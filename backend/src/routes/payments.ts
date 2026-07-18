import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok } from '../types.js'
import { config } from '../config/index.js'

const router = Router()

// POST /payments/campay/initialize
router.post('/campay/initialize', async (req: Request, res: Response, next) => {
  try {
    const { bookingId, amount, currency, provider, customer, successUrl, cancelUrl } = req.body
    if (!bookingId || !amount || !provider) throw createError('bookingId, amount, provider required', 400)

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) throw createError('Booking not found', 404, 'NOT_FOUND')
    
    // Allow guest bookings (no userId) or authenticated user bookings
    if (booking.userId && req.user && booking.userId !== req.user.userId) {
      throw createError('Forbidden', 403, 'FORBIDDEN')
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: amount / 100,
        currency: currency ?? booking.currency,
        provider,
        status: 'PENDING',
      },
    })

    // If Campay credentials exist, call real API; otherwise simulate
    let checkoutUrl: string | undefined
    let externalId: string = payment.id

    if (config.campay.username && config.campay.password) {
      try {
        const tokenRes = await fetch(`${config.campay.baseUrl}/token/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: config.campay.username, password: config.campay.password }),
        })
        const tokenData = await tokenRes.json() as { token: string }
        const campayRes = await fetch(`${config.campay.baseUrl}/collect/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Token ${tokenData.token}` },
          body: JSON.stringify({
            amount: Math.round(amount / 100).toString(),
            currency: currency ?? 'XAF',
            from: customer?.phone ?? '',
            description: `Traveo booking ${bookingId}`,
            external_reference: payment.id,
          }),
        })
        const campayData = await campayRes.json() as { reference?: string; ussd_code?: string }
        externalId = campayData.reference ?? payment.id
        await prisma.payment.update({ where: { id: payment.id }, data: { externalId } })
      } catch (campayErr) {
        console.warn('Campay API error, using mock mode:', campayErr)
      }
    } else {
      // Simulate payment approval for development
      setTimeout(async () => {
        try {
          await prisma.$transaction([
            prisma.payment.update({ where: { id: payment.id }, data: { status: 'COMPLETED', completedAt: new Date() } }),
            prisma.booking.update({ where: { id: bookingId }, data: { status: 'CONFIRMED' } }),
          ])
          // Only create notification if user exists (not a guest booking)
          if (booking.userId) {
            await prisma.notification.create({
              data: {
                userId: booking.userId,
                type: 'payment',
                title: 'Paiement confirmé',
                message: `Votre paiement de ${(amount / 100).toLocaleString('fr-FR')} FCFA a été accepté.`,
                metadata: { bookingId, paymentId: payment.id },
              },
            })
          }
        } catch (e) { console.error('Simulated payment error:', e) }
      }, 3000) // simulate 3s processing
    }

    res.json(ok({
      paymentId: payment.id,
      checkoutUrl,
      message: 'Paiement initié. Veuillez confirmer sur votre téléphone.',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    }))
  } catch (err) { next(err) }
})

// POST /payments/campay/webhooks — Campay callback (booking payments + wallet top-ups)
router.post('/campay/webhooks', async (req: Request, res: Response, next) => {
  try {
    const { reference, status, external_reference } = req.body as {
      reference?: string; status?: string; external_reference?: string
    }

    if (!reference && !external_reference) { res.status(200).json({ received: true }); return }
    const lookupRef = reference || external_reference!

    // 1) Booking payment match
    const payment = await prisma.payment.findFirst({ where: { externalId: lookupRef } })
    if (payment) {
      if (status === 'SUCCESSFUL') {
        await prisma.$transaction([
          prisma.payment.update({ where: { id: payment.id }, data: { status: 'COMPLETED', completedAt: new Date() } }),
          prisma.booking.update({ where: { id: payment.bookingId }, data: { status: 'CONFIRMED' } }),
        ])
        const booking = await prisma.booking.findUnique({ where: { id: payment.bookingId } })
        if (booking && booking.userId) {
          await prisma.notification.create({
            data: {
              userId: booking.userId,
              type: 'payment',
              title: 'Paiement confirmé',
              message: `Votre paiement a été accepté. Réservation confirmée!`,
              metadata: { bookingId: booking.id },
            },
          })
        }
      } else if (status === 'FAILED') {
        await prisma.$transaction([
          prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } }),
          prisma.booking.update({ where: { id: payment.bookingId }, data: { status: 'CANCELLED' } }),
        ])
      }
      res.status(200).json({ received: true }); return
    }

    // 2) Wallet top-up match — find pending walletTransaction by metadata.externalId or id
    const tx = await prisma.walletTransaction.findFirst({
      where: {
        OR: [
          { id: lookupRef },
          { metadata: { path: ['externalId'], equals: lookupRef } as any },
        ],
        status: 'pending',
      },
      include: { wallet: true },
    })
    if (tx) {
      if (status === 'SUCCESSFUL') {
        await prisma.$transaction([
          prisma.walletTransaction.update({ where: { id: tx.id }, data: { status: 'completed' } }),
          prisma.walletAccount.update({ where: { id: tx.walletId }, data: { balance: { increment: tx.amount } } }),
        ])
        await prisma.notification.create({
          data: {
            userId: tx.wallet.userId,
            type: 'payment',
            title: 'Recharge réussie',
            message: `${tx.amount.toLocaleString()} ${tx.currency} ajoutés à votre portefeuille.`,
            metadata: { transactionId: tx.id },
          },
        })
      } else if (status === 'FAILED') {
        await prisma.walletTransaction.update({ where: { id: tx.id }, data: { status: 'failed' } })
      }
    }

    res.status(200).json({ received: true })
  } catch (err) { next(err) }
})

// GET /payments/:id — get payment status
router.get('/:id', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const payment = await prisma.payment.findUnique({ where: { id }, include: { booking: true } })
    if (!payment) throw createError('Payment not found', 404, 'NOT_FOUND')
    if (payment.booking.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      throw createError('Forbidden', 403, 'FORBIDDEN')
    }
    res.json(ok({ ...payment, status: payment.status.toLowerCase() }))
  } catch (err) { next(err) }
})

export default router

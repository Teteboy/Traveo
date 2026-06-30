import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok, getPagination, paginated } from '../types.js'
import { config } from '../config/index.js'

const router = Router()

async function getOrCreateWallet(userId: string) {
  let wallet = await prisma.walletAccount.findUnique({ where: { userId } })
  if (!wallet) {
    wallet = await prisma.walletAccount.create({ data: { userId } })
  }
  return wallet
}

// GET /wallet/balance
router.get('/balance', authenticate, async (req: Request, res: Response, next) => {
  try {
    const wallet = await getOrCreateWallet(req.user!.userId)
    res.json(ok({
      balances: [{ currency: wallet.currency, amount: Math.round(wallet.balance * 100) }],
    }))
  } catch (err) { next(err) }
})

// GET /wallet/transactions
router.get('/transactions', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const wallet = await getOrCreateWallet(req.user!.userId)

    const [total, items] = await Promise.all([
      prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
      prisma.walletTransaction.findMany({ where: { walletId: wallet.id }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    ])

    const mapped = items.map(t => ({
      id: t.id,
      amount: Math.round(t.amount * 100),
      currency: t.currency,
      type: t.type,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      metadata: t.metadata,
    }))

    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// POST /wallet/add-funds — initiate Campay collect; credit on webhook success
router.post('/add-funds', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { amount, currency, provider, phone } = req.body
    if (!amount || amount <= 0) throw createError('Valid amount required', 400)

    const wallet = await getOrCreateWallet(req.user!.userId)
    const amountInMajor = amount / 100 // minor → major units
    const txCurrency = currency ?? wallet.currency

    // If Campay credentials are configured, call collect API and create a PENDING transaction.
    if (config.campay.username && config.campay.password) {
      if (!phone) throw createError('phone required for Campay collect', 400)
      try {
        const tokenRes = await fetch(`${config.campay.baseUrl}/token/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: config.campay.username, password: config.campay.password }),
        })
        const tokenData = await tokenRes.json() as { token: string }

        const tx = await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'credit',
            amount: amountInMajor,
            currency: txCurrency,
            status: 'pending',
            description: `Recharge via ${provider ?? 'Mobile Money'}`,
            metadata: { provider, phone, kind: 'wallet_topup' },
          },
        })

        const collectRes = await fetch(`${config.campay.baseUrl}/collect/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Token ${tokenData.token}` },
          body: JSON.stringify({
            amount: Math.round(amountInMajor).toString(),
            currency: txCurrency,
            from: phone,
            description: `Traveo wallet top-up ${tx.id}`,
            external_reference: tx.id,
          }),
        })
        const collectData = await collectRes.json() as { reference?: string; ussd_code?: string }

        await prisma.walletTransaction.update({
          where: { id: tx.id },
          data: { metadata: { provider, phone, kind: 'wallet_topup', externalId: collectData.reference ?? tx.id, ussdCode: collectData.ussd_code } },
        })

        const current = await prisma.walletAccount.findUnique({ where: { id: wallet.id } })
        res.json(ok({
          status: 'pending',
          transactionId: tx.id,
          message: 'Recharge initiée. Veuillez confirmer sur votre téléphone.',
          balances: [{ currency: current!.currency, amount: Math.round(current!.balance * 100) }],
        }))
        return
      } catch (campayErr) {
        console.warn('Campay collect error, falling back to instant credit:', campayErr)
      }
    }

    // Dev fallback: instant credit (no Campay credentials configured)
    await prisma.$transaction([
      prisma.walletAccount.update({ where: { id: wallet.id }, data: { balance: { increment: amountInMajor } } }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'credit',
          amount: amountInMajor,
          currency: txCurrency,
          status: 'completed',
          description: `Recharge via ${provider ?? 'Mobile Money'}`,
          metadata: { provider, phone, kind: 'wallet_topup', mock: true },
        },
      }),
    ])

    await prisma.notification.create({
      data: {
        userId: req.user!.userId,
        type: 'payment',
        title: 'Recharge réussie',
        message: `${(amountInMajor).toLocaleString()} ${txCurrency} ajoutés à votre portefeuille.`,
      },
    })

    const updated = await prisma.walletAccount.findUnique({ where: { id: wallet.id } })
    res.json(ok({ status: 'completed', balances: [{ currency: updated!.currency, amount: Math.round(updated!.balance * 100) }] }))
  } catch (err) { next(err) }
})

// POST /wallet/pay — debit wallet to pay for a booking
router.post('/pay', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { bookingId } = req.body as { bookingId?: string }
    if (!bookingId) throw createError('bookingId required', 400)

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) throw createError('Booking not found', 404, 'NOT_FOUND')
    if (booking.userId !== req.user!.userId) throw createError('Forbidden', 403, 'FORBIDDEN')
    if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
      throw createError('Booking already paid', 400, 'ALREADY_PAID')
    }

    const wallet = await getOrCreateWallet(req.user!.userId)
    if (wallet.balance < booking.totalAmount) {
      throw createError('Insufficient wallet balance', 400, 'INSUFFICIENT_BALANCE')
    }

    const [, , payment] = await prisma.$transaction([
      prisma.walletAccount.update({ where: { id: wallet.id }, data: { balance: { decrement: booking.totalAmount } } }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'debit',
          amount: booking.totalAmount,
          currency: booking.currency,
          status: 'completed',
          description: `Paiement réservation #${booking.id.slice(0, 8)}`,
          metadata: { bookingId: booking.id, serviceType: booking.serviceType },
        },
      }),
      prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          currency: booking.currency,
          provider: 'wallet',
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      }),
      prisma.booking.update({ where: { id: booking.id }, data: { status: 'CONFIRMED' } }),
    ])

    await prisma.notification.create({
      data: {
        userId: req.user!.userId,
        type: 'payment',
        title: 'Paiement confirmé',
        message: `Votre paiement de ${booking.totalAmount.toLocaleString()} ${booking.currency} a été débité de votre portefeuille.`,
        metadata: { bookingId: booking.id, paymentId: payment.id },
      },
    })

    const updated = await prisma.walletAccount.findUnique({ where: { id: wallet.id } })
    res.json(ok({
      bookingId: booking.id,
      paymentId: payment.id,
      status: 'confirmed',
      balances: [{ currency: updated!.currency, amount: Math.round(updated!.balance * 100) }],
    }))
  } catch (err) { next(err) }
})

// POST /wallet/withdraw
router.post('/withdraw', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { amount, currency, provider, phone } = req.body
    if (!amount || amount <= 0) throw createError('Valid amount required', 400)

    const wallet = await getOrCreateWallet(req.user!.userId)
    const amountInMajor = amount / 100

    if (wallet.balance < amountInMajor) {
      throw createError('Insufficient balance', 400, 'INSUFFICIENT_BALANCE')
    }

    await prisma.$transaction([
      prisma.walletAccount.update({ where: { id: wallet.id }, data: { balance: { decrement: amountInMajor } } }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'debit',
          amount: amountInMajor,
          currency: currency ?? wallet.currency,
          status: 'completed',
          description: `Retrait vers ${provider ?? 'Mobile Money'}`,
          metadata: { provider, phone },
        },
      }),
    ])

    const updated = await prisma.walletAccount.findUnique({ where: { id: wallet.id } })
    res.json(ok({ balances: [{ currency: updated!.currency, amount: Math.round(updated!.balance * 100) }] }))
  } catch (err) { next(err) }
})

export default router

import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok, getPagination, paginated } from '../types.js'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

const router = Router()

// GET /bookings — list user's bookings
router.get('/', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { status, type } = req.query as Record<string, string>

    // Admins see all, users see their own
    const userId = req.user!.role === 'ADMIN' ? undefined : req.user!.userId

    const where = {
      ...(userId && { userId }),
      ...(status && { status: status.toUpperCase() as any }),
      ...(type && { serviceType: type }),
    }

    const [total, items] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { flight: true, service: true, payment: true },
      }),
    ])

    const mapped = items.map(b => ({
      id: b.id,
      userId: b.userId,
      serviceType: b.serviceType,
      serviceId: b.serviceId ?? b.flightId,
      status: b.status.toLowerCase(),
      total: { amount: Math.round(b.totalAmount * 100), currency: b.currency },
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      metadata: b.metadata,
      flight: b.flight,
      service: b.service,
    }))

    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// GET /bookings/:id
router.get('/:id', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { flight: true, service: true, payment: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    })
    if (!booking) throw createError('Booking not found', 404, 'NOT_FOUND')
    if (req.user!.role !== 'ADMIN' && booking.userId !== req.user!.userId) {
      throw createError('Forbidden', 403, 'FORBIDDEN')
    }
    res.json(ok({
      ...booking,
      status: booking.status.toLowerCase(),
      total: { amount: Math.round(booking.totalAmount * 100), currency: booking.currency },
    }))
  } catch (err) { next(err) }
})

// PATCH /bookings/:id — update status (admin or cancel own)
router.patch('/:id', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) throw createError('Booking not found', 404, 'NOT_FOUND')

    if (req.user!.role !== 'ADMIN' && booking.userId !== req.user!.userId) {
      throw createError('Forbidden', 403, 'FORBIDDEN')
    }

    const { status } = req.body
    const updated = await prisma.booking.update({
      where: { id },
      data: { status: status?.toUpperCase() ?? booking.status },
    })

    if (status?.toUpperCase() === 'CANCELLED' && booking.userId) {
      // Refund logic: add back to wallet (only for registered users)
      const wallet = await prisma.walletAccount.findUnique({ where: { userId: booking.userId } })
      if (wallet) {
        await prisma.$transaction([
          prisma.walletAccount.update({ where: { id: wallet.id }, data: { balance: { increment: booking.totalAmount } } }),
          prisma.walletTransaction.create({
            data: { walletId: wallet.id, type: 'refund', amount: booking.totalAmount, currency: booking.currency, description: `Remboursement réservation #${booking.id.slice(0, 8)}` },
          }),
        ])
      }

      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: 'booking',
          title: 'Réservation annulée',
          message: `Votre réservation a été annulée et remboursée.`,
          metadata: { bookingId: booking.id },
        },
      })
    }

    res.json(ok({ ...updated, status: updated.status.toLowerCase() }))
  } catch (err) { next(err) }
})

// DELETE /bookings/:id — cancel
router.delete('/:id', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) throw createError('Booking not found', 404, 'NOT_FOUND')
    if (booking.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      throw createError('Forbidden', 403, 'FORBIDDEN')
    }
    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
      throw createError('Cannot cancel this booking', 400, 'INVALID_STATE')
    }
    const updated = await prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' } })
    res.json(ok({ ...updated, status: 'cancelled' }))
  } catch (err) { next(err) }
})

// GET /bookings/:id/ticket — get QR ticket
router.get('/:id/ticket', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { flight: true, service: true },
    })
    if (!booking) throw createError('Booking not found', 404, 'NOT_FOUND')
    if (booking.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      throw createError('Forbidden', 403, 'FORBIDDEN')
    }
    if (booking.status !== 'CONFIRMED' && booking.status !== 'COMPLETED') {
      throw createError('Ticket not available for this booking', 400, 'TICKET_UNAVAILABLE')
    }

    // Generate QR payload if not already done
    let qrPayload = booking.qrCode
    if (!qrPayload) {
      qrPayload = JSON.stringify({ bookingId: booking.id, type: booking.serviceType, issuedAt: new Date().toISOString() })
      await prisma.booking.update({ where: { id: booking.id }, data: { qrCode: qrPayload, ticketData: { issuedAt: new Date().toISOString() } } })
    }

    res.json(ok({ qrPayload, issuedAt: (booking.ticketData as any)?.issuedAt ?? new Date().toISOString() }))
  } catch (err) { next(err) }
})

// GET /bookings/:id/refunds — get refunds for a booking
router.get('/:id/refunds', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) throw createError('Booking not found', 404, 'NOT_FOUND')
    if (req.user!.role !== 'ADMIN' && booking.userId !== req.user!.userId) {
      throw createError('Forbidden', 403, 'FORBIDDEN')
    }

    const refunds = await prisma.refundRequest.findMany({
      where: { bookingId: id },
      orderBy: { createdAt: 'desc' }
    })

    const mapped = refunds.map(r => ({
      id: r.id,
      bookingId: r.bookingId,
      amount: r.amount,
      currency: r.currency,
      reason: r.reason,
      status: r.status.toLowerCase(),
      requestDate: r.createdAt.toISOString(),
      estimatedDate: r.estimatedDate?.toISOString(),
      completedDate: r.completedDate?.toISOString(),
    }))

    res.json(ok(mapped))
  } catch (err) { next(err) }
})

// POST /bookings/:id/refunds — create refund request
router.post('/:id/refunds', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const { amount, reason } = req.body

    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) throw createError('Booking not found', 404, 'NOT_FOUND')
    if (booking.userId !== req.user!.userId) {
      throw createError('Forbidden', 403, 'FORBIDDEN')
    }

    const refund = await prisma.refundRequest.create({
      data: {
        bookingId: id,
        amount: parseFloat(amount),
        currency: booking.currency,
        reason,
        status: 'PENDING',
        estimatedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      }
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'booking',
        title: 'Demande de remboursement soumise',
        message: `Votre demande de remboursement pour la réservation ${booking.id} a été soumise.`,
        metadata: { bookingId: booking.id, refundId: refund.id },
      }
    })

    res.status(201).json(ok({
      id: refund.id,
      bookingId: refund.bookingId,
      amount: refund.amount,
      currency: refund.currency,
      reason: refund.reason,
      status: refund.status.toLowerCase(),
      requestDate: refund.createdAt.toISOString(),
      estimatedDate: refund.estimatedDate?.toISOString(),
    }))
  } catch (err) { next(err) }
})

// GET /refunds — list user's refund requests
router.get('/refunds/list', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { status } = req.query as Record<string, string>

    const where = {
      ...(req.user!.role !== 'ADMIN' && { booking: { userId: req.user!.userId } }),
      ...(status && { status: status.toUpperCase() as any }),
    }

    const [total, items] = await Promise.all([
      prisma.refundRequest.count({ where }),
      prisma.refundRequest.findMany({
        where,
        include: { booking: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
    ])

    const mapped = items.map(r => ({
      id: r.id,
      bookingId: r.bookingId,
      bookingType: r.booking.serviceType,
      amount: r.amount,
      currency: r.currency,
      reason: r.reason,
      status: r.status.toLowerCase(),
      requestDate: r.createdAt.toISOString().split('T')[0],
      estimatedDate: r.estimatedDate?.toISOString().split('T')[0],
      completedDate: r.completedDate?.toISOString().split('T')[0],
    }))

    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// POST /bookings/guest — guest booking with optional auto-registration
router.post('/guest', async (req: Request, res: Response, next) => {
  try {
    const {
      serviceType,
      flightId,
      serviceId,
      providerId,
      totalAmount,
      currency,
      metadata,
      // Guest information
      guestEmail,
      guestPhone,
      guestName,
      guestTitle,
      guestDateOfBirth,
      guestGender,
      guestCountry,
      // Auto-registration
      createAccount,
      password,
    } = req.body

    if (!serviceType || !totalAmount) {
      throw createError('serviceType and totalAmount are required', 400)
    }

    if (!guestEmail || !guestName) {
      throw createError('guestEmail and guestName are required', 400)
    }

    let userId: string | null = null
    let autoRegistered = false
    let tempPassword: string | null = null

    // Check if user already exists by email
    const existingUser = await prisma.user.findUnique({ where: { email: guestEmail } })

    if (existingUser) {
      userId = existingUser.id
    } else if (createAccount) {
      // Auto-register the user
      const tempPwd = password || Math.random().toString(36).slice(-10)
      const hashedPassword = await bcrypt.hash(tempPwd, 12)

      const nameParts = guestName.split(' ')
      const firstName = nameParts[0] || guestName
      const lastName = nameParts.slice(1).join(' ') || ''

      const newUser = await prisma.user.create({
        data: {
          email: guestEmail,
          password: hashedPassword,
          firstName,
          lastName,
          phone: guestPhone,
          country: guestCountry || 'CM',
          title: guestTitle,
          dateOfBirth: guestDateOfBirth ? new Date(guestDateOfBirth) : null,
          gender: guestGender,
          role: 'USER',
        },
      })

      userId = newUser.id
      autoRegistered = true
      tempPassword = tempPwd

      // Create wallet for new user
      await prisma.walletAccount.create({
        data: { userId: newUser.id, balance: 0, currency: currency || 'XAF' },
      })
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceType,
        flightId,
        serviceId,
        providerId,
        totalAmount: parseFloat(totalAmount),
        currency: currency || 'XAF',
        status: 'PENDING_PAYMENT',
        metadata: metadata || {},
        isGuest: !userId,
        guestEmail,
        guestPhone,
        guestName,
        guestTitle,
        guestDateOfBirth: guestDateOfBirth ? new Date(guestDateOfBirth) : null,
        guestGender,
        guestCountry: guestCountry || 'CM',
      },
      include: { flight: true, service: true },
    })

    res.status(201).json(ok({
      booking: {
        id: booking.id,
        serviceType: booking.serviceType,
        status: booking.status.toLowerCase(),
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        metadata: booking.metadata,
        flight: booking.flight,
        service: booking.service,
      },
      user: userId ? { id: userId, autoRegistered, tempPassword } : null,
      isGuest: !userId,
    }))
  } catch (err) { next(err) }
})

export default router

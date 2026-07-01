import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok, getPagination, paginated } from '../types.js'

const router = Router()

// GET /providers/me — provider profile
router.get('/me', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const provider = await prisma.provider.findUnique({
      where: { userId: req.user!.userId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    })
    if (!provider) throw createError('Provider profile not found', 404, 'NOT_FOUND')
    res.json(ok(provider))
  } catch (err) { next(err) }
})

// POST /providers/register — become a provider
router.post('/register', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { companyName, businessType, description } = req.body
    if (!companyName || !businessType) throw createError('companyName and businessType required', 400)

    const existing = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (existing) throw createError('Already a provider', 409, 'ALREADY_PROVIDER')

    const provider = await prisma.provider.create({
      data: { userId: req.user!.userId, companyName, businessType, description },
    })

    // Upgrade user role
    await prisma.user.update({ where: { id: req.user!.userId }, data: { role: 'PROVIDER' } })

    await prisma.notification.create({
      data: {
        userId: req.user!.userId,
        type: 'system',
        title: 'Demande de partenaire soumise',
        message: 'Votre demande de devenir prestataire a été reçue. Nous vous contacterons sous 48h.',
        metadata: { providerId: provider.id },
      },
    })

    res.status(201).json(ok(provider))
  } catch (err) { next(err) }
})

// GET /providers/dashboard — stats
router.get('/dashboard', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    const [totalBookings, confirmedBookings, revenue, services, pendingBookings] = await Promise.all([
      prisma.booking.count({ where: { providerId: provider.id } }),
      prisma.booking.count({ where: { providerId: provider.id, status: 'CONFIRMED' } }),
      prisma.booking.aggregate({ where: { providerId: provider.id, status: 'CONFIRMED' }, _sum: { totalAmount: true } }),
      prisma.service.count({ where: { providerId: provider.id, isActive: true } }),
      prisma.booking.count({ where: { providerId: provider.id, status: 'PENDING' } }),
    ])

    res.json(ok({
      totalBookings: { count: totalBookings, trend: { percentage: 12, direction: 'up' } },
      totalRevenue: { amount: Math.round((revenue._sum.totalAmount ?? 0) * 100), currency: 'XAF', trend: { percentage: 8, direction: 'up' } },
      activeServices: services,
      pendingBookings,
    }))
  } catch (err) { next(err) }
})

// GET /providers/bookings
router.get('/bookings', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    const { status } = req.query as Record<string, string>
    const where = { providerId: provider.id, ...(status && { status: status.toUpperCase() as any }) }

    const [total, items] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatar: true } }, service: true },
      }),
    ])

    const mapped = items.map(b => ({
      ...b,
      status: b.status.toLowerCase(),
      guestName: `${b.user.firstName} ${b.user.lastName}`,
      guestEmail: b.user.email,
      guestPhone: b.user.phone ?? '',
      serviceName: b.service?.name ?? 'Service',
    }))

    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// GET /providers/earnings
router.get('/earnings', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    const revenue = await prisma.booking.aggregate({
      where: { providerId: provider.id, status: { in: ['CONFIRMED', 'COMPLETED'] } },
      _sum: { totalAmount: true },
      _count: true,
    })

    const pending = await prisma.booking.aggregate({
      where: { providerId: provider.id, status: 'PENDING_PAYMENT' },
      _sum: { totalAmount: true },
    })

    const total = revenue._sum.totalAmount ?? 0
    const commission = total * 0.1

    res.json(ok({
      totalRevenue: Math.round(total * 100),
      pendingPayments: Math.round((pending._sum.totalAmount ?? 0) * 100),
      avgBookingValue: revenue._count > 0 ? Math.round((total / revenue._count) * 100) : 0,
      commissionFees: Math.round(commission * 100),
      currency: 'XAF',
    }))
  } catch (err) { next(err) }
})

// GET /providers/reviews
router.get('/reviews', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    const serviceIds = (await prisma.service.findMany({ where: { providerId: provider.id }, select: { id: true } })).map(s => s.id)

    const [total, items] = await Promise.all([
      prisma.review.count({ where: { serviceId: { in: serviceIds } } }),
      prisma.review.findMany({
        where: { serviceId: { in: serviceIds } },
        skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, avatar: true } }, service: { select: { name: true, type: true } } },
      }),
    ])

    const mapped = items.map(r => ({
      ...r,
      guestName: `${r.user.firstName} ${r.user.lastName}`,
      guestAvatar: r.user.avatar,
      serviceName: r.service?.name,
      serviceType: r.service?.type.toLowerCase(),
    }))

    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// GET /providers/services
router.get('/services', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    const [total, items] = await Promise.all([
      prisma.service.count({ where: { providerId: provider.id } }),
      prisma.service.findMany({ where: { providerId: provider.id }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    ])
    res.json(paginated(items, total, page, limit))
  } catch (err) { next(err) }
})

// PATCH /providers/me — update provider profile
router.patch('/me', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { companyName, description } = req.body
    const provider = await prisma.provider.update({
      where: { userId: req.user!.userId },
      data: { ...(companyName && { companyName }), ...(description !== undefined && { description }) },
    })
    res.json(ok(provider))
  } catch (err) { next(err) }
})

// POST /providers/services — create a service
router.post('/services', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    const { type, name, description, imageUrl, location, country, price, currency, metadata } = req.body
    if (!type || !name || !description || !imageUrl || !location || !country || price == null) {
      throw createError('Missing required fields', 400, 'VALIDATION_ERROR')
    }

    const service = await prisma.service.create({
      data: {
        providerId: provider.id,
        type: String(type).toUpperCase() as any,
        name, description, imageUrl, location, country,
        price: Number(price),
        currency: currency ?? 'XAF',
        metadata: metadata ?? {},
        isActive: true, // Make provider-created services visible by default
      },
    })
    res.status(201).json(ok(service))
  } catch (err) { next(err) }
})

// PATCH /providers/services/:id — update a service
router.patch('/services/:id', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    const existing = await prisma.service.findUnique({ where: { id } })
    if (!existing) throw createError('Service not found', 404, 'NOT_FOUND')
    if (existing.providerId !== provider.id) throw createError('Forbidden', 403, 'FORBIDDEN')

    const { name, description, imageUrl, location, country, price, currency, isActive, metadata } = req.body
    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(location !== undefined && { location }),
        ...(country !== undefined && { country }),
        ...(price !== undefined && { price: Number(price) }),
        ...(currency !== undefined && { currency }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(metadata !== undefined && { metadata }),
      },
    })
    res.json(ok(updated))
  } catch (err) { next(err) }
})

// DELETE /providers/services/:id — soft delete (mark inactive)
router.delete('/services/:id', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    const existing = await prisma.service.findUnique({ where: { id } })
    if (!existing) throw createError('Service not found', 404, 'NOT_FOUND')
    if (existing.providerId !== provider.id) throw createError('Forbidden', 403, 'FORBIDDEN')

    await prisma.service.update({ where: { id }, data: { isActive: false } })
    res.json(ok({ id, deleted: true }))
  } catch (err) { next(err) }
})

// PATCH /providers/bookings/:id — update booking status (confirm/cancel/complete/checkin/checkout)
router.patch('/bookings/:id', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) throw createError('Booking not found', 404, 'NOT_FOUND')
    if (booking.providerId !== provider.id) throw createError('Forbidden', 403, 'FORBIDDEN')

    const { status } = req.body as { status?: string }
    const allowed = ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'CHECKED_IN', 'CHECKED_OUT']
    const next_ = String(status ?? '').toUpperCase()
    if (!allowed.includes(next_)) throw createError('Invalid status', 400, 'VALIDATION_ERROR')

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: next_ as any },
    })

    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'booking',
        title: 'Mise à jour de votre réservation',
        message: `Le statut de votre réservation est maintenant ${next_.toLowerCase()}.`,
        metadata: { bookingId: booking.id, status: next_ },
      },
    })

    res.json(ok({ ...updated, status: updated.status.toLowerCase() }))
  } catch (err) { next(err) }
})

// PATCH /providers/reviews/:id/response — respond to a review
router.patch('/reviews/:id/response', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    // Verify the review is for this provider's service
    const review = await prisma.review.findUnique({
      where: { id },
      include: { service: true },
    })
    if (!review) throw createError('Review not found', 404, 'NOT_FOUND')
    if (review.service?.providerId !== provider.id) throw createError('Forbidden', 403, 'FORBIDDEN')

    const { response } = req.body as { response?: string }
    if (!response) throw createError('Response text required', 400, 'VALIDATION_ERROR')

    const updated = await prisma.review.update({
      where: { id },
      data: {
        providerResponse: response,
        respondedAt: new Date(),
      },
    })

    res.json(ok(updated))
  } catch (err) { next(err) }
})

export default router

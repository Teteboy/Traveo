import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok, getPagination, paginated } from '../types.js'

const router = Router()

// All admin routes require ADMIN role
router.use(authenticate, requireRole('ADMIN'))

// GET /admin/stats — platform overview
router.get('/stats', async (_req: Request, res: Response, next) => {
  try {
    const [users, providers, bookings, revenue, flights, visaApps] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.provider.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({ where: { status: { in: ['CONFIRMED', 'COMPLETED'] } }, _sum: { totalAmount: true } }),
      prisma.flight.count({ where: { isActive: true } }),
      prisma.visaApplication.count(),
    ])
    res.json(ok({
      users,
      providers,
      bookings,
      totalRevenue: Math.round((revenue._sum.totalAmount ?? 0) * 100),
      activeFlights: flights,
      visaApplications: visaApps,
    }))
  } catch (err) { next(err) }
})

// GET /admin/users
router.get('/users', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { role, search } = req.query as Record<string, string>

    const where = {
      ...(role && { role: role.toUpperCase() as any }),
      ...(search && { OR: [{ email: { contains: search, mode: 'insensitive' as const } }, { firstName: { contains: search, mode: 'insensitive' as const } }] }),
    }

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, country: true, createdAt: true },
      }),
    ])

    const mapped = items.map(u => ({ ...u, role: u.role.toLowerCase(), fullName: `${u.firstName} ${u.lastName}` }))
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// PATCH /admin/users/:id — update user role etc
router.patch('/users/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const { role, phone, country } = req.body
    const user = await prisma.user.update({
      where: { id },
      data: { ...(role && { role: role.toUpperCase() as any }), ...(phone !== undefined && { phone }), ...(country && { country }) },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    })
    res.json(ok({ ...user, role: user.role.toLowerCase() }))
  } catch (err) { next(err) }
})

// DELETE /admin/users/:id
router.delete('/users/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    await prisma.user.delete({ where: { id } })
    res.json(ok({ message: 'User deleted' }))
  } catch (err) { next(err) }
})

// GET /admin/bookings
router.get('/bookings', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { status, type } = req.query as Record<string, string>
    const where = {
      ...(status && { status: status.toUpperCase() as any }),
      ...(type && { serviceType: type }),
    }
    const [total, items] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, email: true } }, flight: true, service: true, payment: true },
      }),
    ])
    const mapped = items.map(b => ({ ...b, status: b.status.toLowerCase() }))
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// GET /admin/flights
router.get('/flights', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip, includeDuffel, origin, destination, departDate } = req.query as Record<string, string>
    
    // Parse pagination values to ensure they're numbers
    const pageNum = Math.max(1, parseInt(page ?? '1', 10))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? '10', 10)))
    const skipNum = (pageNum - 1) * limitNum
    
    // If Duffel search is requested
    if (includeDuffel === 'true' && origin && destination && departDate) {
      const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY ?? ''
      const DUFFEL_BASE_URL = process.env.DUFFEL_BASE_URL ?? 'https://api.duffel.com'
      
      if (DUFFEL_API_KEY) {
        try {
          const passengerCount = 1
          const paxList = Array.from({ length: passengerCount }, () => ({ type: 'adult' }))

          const offerRequestRes = await fetch(`${DUFFEL_BASE_URL}/air/offer_requests`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${DUFFEL_API_KEY}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'Duffel-Version': 'v2',
            },
            body: JSON.stringify({
              data: {
                slices: [{ 
                  origin: origin.toUpperCase(), 
                  destination: destination.toUpperCase(), 
                  departure_date: departDate 
                }],
                passengers: paxList,
                cabin_class: 'economy',
                return_offers: true,
              },
            }),
          })

          const offerRequest: any = await offerRequestRes.json()
          const offerRequestId = offerRequest.data?.id

          if (offerRequestId) {
            const offersRes = await fetch(
              `${DUFFEL_BASE_URL}/air/offers?offer_request_id=${offerRequestId}&limit=50&sort=total_amount`,
              {
                headers: {
                  Authorization: `Bearer ${DUFFEL_API_KEY}`,
                  Accept: 'application/json',
                  'Duffel-Version': 'v2',
                },
              }
            )
            const offersData: any = await offersRes.json()
            const offers = (offersData.data ?? []).map((offer: any) => {
              const slice = offer.slices?.[0]
              const seg = slice?.segments?.[0]
              const carrier = seg?.marketing_carrier ?? seg?.operating_carrier ?? {}
              const lastSeg = slice?.segments?.[slice.segments.length - 1]
              const stops = Math.max(0, (slice?.segments?.length ?? 1) - 1)

              const departAt = seg?.departing_at ?? ''
              const arriveAt = lastSeg?.arriving_at ?? ''
              const dMinutes = slice?.duration
                ? parseDuration(slice.duration)
                : Math.round((new Date(arriveAt).getTime() - new Date(departAt).getTime()) / 60000)

              return {
                id: offer.id,
                airline: carrier.name ?? 'Unknown',
                airlineLogo: carrier.logo_symbol_url ?? carrier.logo_lockup_url,
                flightNumber: `${carrier.iata_code ?? ''}${seg?.marketing_carrier_flight_number ?? ''}`.trim(),
                origin: slice?.origin?.name ?? slice?.origin?.iata_code ?? '',
                originCode: slice?.origin?.iata_code ?? '',
                destination: slice?.destination?.name ?? slice?.destination?.iata_code ?? '',
                destinationCode: slice?.destination?.iata_code ?? '',
                departAt,
                arriveAt,
                durationMinutes: dMinutes,
                stops,
                priceEconomy: parseFloat(offer.total_amount ?? '0'),
                priceBusiness: null,
                currency: offer.total_currency ?? 'USD',
                availableSeats: offer.available_services?.length ?? 150,
                isActive: true,
                isDuffel: true,
                offerId: offer.id,
                createdAt: new Date().toISOString(),
              }
            })

            return res.json(paginated(offers, offers.length, pageNum, limitNum))
          }
        } catch (duffelError) {
          console.error('Duffel search failed in admin:', duffelError)
        }
      }
    }

    // Default: local flights
    const [total, items] = await Promise.all([
      prisma.flight.count({ where: { isActive: true } }),
      prisma.flight.findMany({ 
        where: { isActive: true },
        skip: skipNum, 
        take: limitNum, 
        orderBy: { departAt: 'asc' } 
      }),
    ])
    
    // Add isDuffel flag to local flights
    const itemsWithFlag = items.map(f => ({ ...f, isDuffel: false }))
    res.json(paginated(itemsWithFlag, total, pageNum, limitNum))
  } catch (err) { next(err) }
})

// Helper function to parse ISO duration
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return 0
  return parseInt(match[1] ?? '0') * 60 + parseInt(match[2] ?? '0')
}

// POST /admin/flights
router.post('/flights', async (req: Request, res: Response, next) => {
  try {
    const { airline, airlineLogo, flightNumber, origin, originCode, destination, destinationCode, departAt, arriveAt, durationMinutes, stops, priceEconomy, priceBusiness, currency, availableSeats } = req.body
    const flight = await prisma.flight.create({
      data: { 
        airline, 
        airlineLogo, 
        flightNumber, 
        origin, 
        originCode, 
        destination, 
        destinationCode, 
        departAt: new Date(departAt), 
        arriveAt: new Date(arriveAt), 
        durationMinutes, 
        stops: stops ?? 0, 
        priceEconomy, 
        priceBusiness, 
        currency: currency ?? 'XAF', 
        availableSeats: availableSeats ?? 100,
        isActive: true 
      },
    })
    res.status(201).json(ok(flight))
  } catch (err) { next(err) }
})

// PATCH /admin/flights/:id
router.patch('/flights/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const data = { ...req.body }
    if (data.departAt) data.departAt = new Date(data.departAt)
    if (data.arriveAt) data.arriveAt = new Date(data.arriveAt)
    const flight = await prisma.flight.update({ where: { id }, data })
    res.json(ok(flight))
  } catch (err) { next(err) }
})

// DELETE /admin/flights/:id
router.delete('/flights/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    await prisma.flight.update({ where: { id }, data: { isActive: false } })
    res.json(ok({ message: 'Flight deactivated' }))
  } catch (err) { next(err) }
})

// GET /admin/visa
router.get('/visa', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { status } = req.query as Record<string, string>
    const where = { ...(status && { status: status.toUpperCase() as any }) }
    const [total, items] = await Promise.all([
      prisma.visaApplication.count({ where }),
      prisma.visaApplication.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true, email: true } }, documents: true } }),
    ])
    const mapped = items.map(a => ({ ...a, status: a.status.toLowerCase() }))
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// PATCH /admin/visa/:id — update status
router.patch('/visa/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const { status } = req.body
    const app = await prisma.visaApplication.update({
      where: { id },
      data: { status: status.toUpperCase() as any },
    })

    await prisma.notification.create({
      data: {
        userId: app.userId,
        type: 'visa',
        title: `Visa ${status === 'approved' ? 'approuvé' : status === 'rejected' ? 'refusé' : 'mis à jour'}`,
        message: `Votre demande de visa pour ${app.countryName} a été ${status === 'approved' ? 'approuvée' : status === 'rejected' ? 'refusée' : 'mise à jour'}.`,
        metadata: { applicationId: app.id },
      },
    })

    res.json(ok({ ...app, status: app.status.toLowerCase() }))
  } catch (err) { next(err) }
})

// GET /admin/analytics
router.get('/analytics', async (_req: Request, res: Response, next) => {
  try {
    const [bookingsByType, revenueByMonthRaw, topDestinations] = await Promise.all([
      prisma.booking.groupBy({ by: ['serviceType'], _count: { id: true }, _sum: { totalAmount: true } }),
      // Monthly revenue (last 6 months)
      prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") as month, SUM("totalAmount") as revenue, COUNT(id) as count
        FROM bookings WHERE "createdAt" > NOW() - INTERVAL '6 months'
        GROUP BY month ORDER BY month
      `,
      prisma.destination.findMany({ orderBy: { popularityScore: 'desc' }, take: 5 }),
    ])

    // Transform raw query results to match expected types
    const revenueByMonth = (revenueByMonthRaw as any[]).map((row: any) => ({
      month: row.month.toISOString().substring(0, 7), // YYYY-MM format
      revenue: Number(row.revenue),
      count: Number(row.count)
    }))

    res.json(ok({ bookingsByType, revenueByMonth, topDestinations }))
  } catch (err) { next(err) }
})

// GET /admin/payments — list all platform payments
router.get('/payments', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { status, provider } = req.query as Record<string, string>
    const where = {
      ...(status && { status: status.toUpperCase() as any }),
      ...(provider && { provider }),
    }
    const [total, items] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { booking: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } },
      }),
    ])
    const mapped = items.map(p => ({
      ...p,
      status: p.status.toLowerCase(),
      userName: p.booking?.user ? `${p.booking.user.firstName} ${p.booking.user.lastName}` : 'N/A',
      userEmail: p.booking?.user?.email ?? '',
    }))
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// GET /admin/financial — financial overview
router.get('/financial', async (_req: Request, res: Response, next) => {
  try {
    const since = new Date(); since.setDate(since.getDate() - 30)
    const [revenue, monthRevenue, pendingPayments, refundsPending, wallets, payments] = await Promise.all([
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED', completedAt: { gte: since } }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true } }),
      prisma.refundRequest.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true }, _count: true }),
      prisma.walletAccount.count(),
      prisma.payment.count({ where: { status: 'COMPLETED' } }),
    ])
    const total = revenue._sum.amount ?? 0
    res.json(ok({
      totalRevenue: Math.round(total * 100),
      monthlyRevenue: Math.round((monthRevenue._sum.amount ?? 0) * 100),
      pendingSettlements: Math.round((pendingPayments._sum.amount ?? 0) * 100),
      pendingRefunds: Math.round((refundsPending._sum.amount ?? 0) * 100),
      pendingRefundCount: refundsPending._count,
      activeWallets: wallets,
      totalCommissions: Math.round(total * 0.1 * 100),
      paymentsCount: payments,
      currency: 'XAF',
    }))
  } catch (err) { next(err) }
})

// GET /admin/refunds — list refund requests
router.get('/refunds', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { status } = req.query as Record<string, string>
    const where = { ...(status && { status: status.toUpperCase() as any }) }
    const [total, items] = await Promise.all([
      prisma.refundRequest.count({ where }),
      prisma.refundRequest.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { booking: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } },
      }),
    ])
    const mapped = items.map(r => ({ ...r, status: r.status.toLowerCase() }))
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// PATCH /admin/refunds/:id — approve/reject/complete a refund
router.patch('/refunds/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const { status } = req.body
    const allowed = ['APPROVED', 'REJECTED', 'COMPLETED']
    const next_ = String(status ?? '').toUpperCase()
    if (!allowed.includes(next_)) throw createError('Invalid status', 400, 'VALIDATION_ERROR')

    const refund = await prisma.refundRequest.update({
      where: { id },
      data: { status: next_ as any, ...(next_ === 'COMPLETED' && { completedDate: new Date() }) },
      include: { booking: true },
    })

    if (refund.booking.userId) {
      await prisma.notification.create({
        data: {
          userId: refund.booking.userId,
          type: 'refund',
          title: 'Mise à jour de votre remboursement',
          message: `Votre demande de remboursement est maintenant ${next_.toLowerCase()}.`,
          metadata: { refundId: refund.id, status: next_ },
        },
      })
    }

    res.json(ok({ ...refund, status: refund.status.toLowerCase() }))
  } catch (err) { next(err) }
})

// GET /admin/services — list all services across providers (events, hotels, etc.)
router.get('/services', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { type, isActive } = req.query as Record<string, string>
    const where = {
      ...(type && { type: type.toUpperCase() as any }),
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
    }
    const [total, items] = await Promise.all([
      prisma.service.count({ where }),
      prisma.service.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { provider: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } },
      }),
    ])
    res.json(paginated(items, total, page, limit))
  } catch (err) { next(err) }
})

// PATCH /admin/services/:id — approve/deactivate
router.patch('/services/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const { isActive } = req.body
    const service = await prisma.service.update({
      where: { id },
      data: { ...(isActive !== undefined && { isActive: !!isActive }) },
    })
    res.json(ok(service))
  } catch (err) { next(err) }
})

// DELETE /admin/services/:id
router.delete('/services/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    await prisma.service.update({ where: { id }, data: { isActive: false } })
    res.json(ok({ message: 'Service deactivated' }))
  } catch (err) { next(err) }
})

// GET /admin/providers
router.get('/providers', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { status, search } = req.query as Record<string, string>
    
    const where: any = {}
    
    // Filter by verification status
    if (status === 'pending') {
      where.isVerified = false
    } else if (status === 'verified') {
      where.isVerified = true
    }
    
    // Search by company name or user email
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' as const } },
        { user: { email: { contains: search, mode: 'insensitive' as const } } },
        { user: { firstName: { contains: search, mode: 'insensitive' as const } } },
        { user: { lastName: { contains: search, mode: 'insensitive' as const } } },
      ]
    }
    
    const [total, items] = await Promise.all([
      prisma.provider.count({ where }),
      prisma.provider.findMany({
        where,
        skip, 
        take: limit, 
        orderBy: { createdAt: 'desc' },
        include: { 
          user: { 
            select: { 
              firstName: true, 
              lastName: true, 
              email: true, 
              phone: true,
              createdAt: true
            } 
          },
          services: {
            select: { id: true, name: true, type: true }
          }
        },
      }),
    ])
    
    // Map to include computed status
    const mapped = items.map(p => ({
      ...p,
      status: p.isVerified ? 'verified' : p.verificationProgress > 0 ? 'pending' : 'incomplete',
      userName: `${p.user.firstName} ${p.user.lastName}`,
      userEmail: p.user.email,
    }))
    
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// PATCH /admin/providers/:id/verify — approve/verify a provider
router.patch('/providers/:id/verify', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const { action } = req.body // 'approve' or 'reject'
    
    if (!['approve', 'reject'].includes(action)) {
      throw createError('Invalid action. Must be "approve" or "reject"', 400, 'VALIDATION_ERROR')
    }
    
    const provider = await prisma.provider.findUnique({
      where: { id },
      include: { user: true },
    })
    
    if (!provider) {
      throw createError('Provider not found', 404, 'NOT_FOUND')
    }
    
    let updatedProvider
    
    if (action === 'approve') {
      // Approve the provider
      updatedProvider = await prisma.provider.update({
        where: { id },
        data: {
          isVerified: true,
          verificationProgress: 100,
        },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      })
      
      // Create notification for the provider
      await prisma.notification.create({
        data: {
          userId: provider.userId,
          type: 'system',
          title: 'Compte prestataire approuvé',
          message: 'Félicitations ! Votre compte prestataire a été approuvé. Vous pouvez maintenant proposer vos services.',
          metadata: { providerId: id, status: 'approved' },
        },
      })
    } else {
      // Reject - reset verification progress but keep the profile
      updatedProvider = await prisma.provider.update({
        where: { id },
        data: {
          isVerified: false,
          verificationProgress: 0,
        },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      })
      
      // Create notification for the provider
      await prisma.notification.create({
        data: {
          userId: provider.userId,
          type: 'system',
          title: 'Demande prestataire refusée',
          message: 'Votre demande de compte prestataire a été refusée. Veuillez contacter le support pour plus d\'informations.',
          metadata: { providerId: id, status: 'rejected' },
        },
      })
    }
    
    res.json(ok({ 
      provider: updatedProvider,
      message: action === 'approve' ? 'Provider approved successfully' : 'Provider application rejected'
    }))
  } catch (err) { next(err) }
})

// GET /admin/providers/:id — get detailed provider info
router.get('/providers/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    
    const provider = await prisma.provider.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            country: true,
            createdAt: true,
            avatar: true,
          }
        },
        services: true,
        bookings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { firstName: true, lastName: true, email: true } }
          }
        },
      },
    })
    
    if (!provider) {
      throw createError('Provider not found', 404, 'NOT_FOUND')
    }
    
    res.json(ok(provider))
  } catch (err) { next(err) }
})

// DELETE /admin/providers/:id — permanently delete a provider request/application
router.delete('/providers/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const { reason } = req.body // Optional reason for deletion
    
    // Find the provider first to get userId for notification
    const provider = await prisma.provider.findUnique({
      where: { id },
      include: { user: true },
    })
    
    if (!provider) {
      throw createError('Provider not found', 404, 'NOT_FOUND')
    }
    
    // Delete the provider (this will cascade to related records if configured)
    await prisma.provider.delete({
      where: { id },
    })
    
    // Optionally notify the user (if they still exist)
    if (provider.user) {
      await prisma.notification.create({
        data: {
          userId: provider.userId,
          type: 'system',
          title: 'Demande prestataire supprimée',
          message: reason 
            ? `Votre demande de compte prestataire a été supprimée. Raison: ${reason}`
            : 'Votre demande de compte prestataire a été supprimée par l\'administration.',
          metadata: { providerId: id, status: 'deleted', reason },
        },
      })
    }
    
    res.json(ok({ 
      message: 'Provider request deleted successfully',
      deletedProviderId: id 
    }))
  } catch (err) { next(err) }
})

// ─── Payout Management ───────────────────────────────────────────────────────

// GET /admin/payouts — list all payout requests
router.get('/payouts', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { status } = req.query as Record<string, string>
    const where = { ...(status && { status: status.toUpperCase() as any }) }

    const [total, items] = await Promise.all([
      prisma.payoutRequest.count({ where }),
      prisma.payoutRequest.findMany({
        where, skip, take: limit, orderBy: { requestedAt: 'desc' },
        include: { provider: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } },
      }),
    ])

    const mapped = items.map(p => ({
      ...p,
      status: p.status.toLowerCase(),
      providerName: p.provider.companyName,
      providerEmail: p.provider.user.email,
    }))
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// PATCH /admin/payouts/:id — process payout (approve/reject/complete)
router.patch('/payouts/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const { status, rejectionReason } = req.body
    const allowed = ['PROCESSING', 'COMPLETED', 'REJECTED']
    const next_ = String(status ?? '').toUpperCase()
    if (!allowed.includes(next_)) throw createError('Invalid status', 400, 'VALIDATION_ERROR')

    const payout = await prisma.payoutRequest.update({
      where: { id },
      data: {
        status: next_ as any,
        processedAt: new Date(),
        processedBy: req.user!.userId,
        ...(next_ === 'REJECTED' && { rejectionReason }),
      },
      include: { provider: { include: { user: true } } },
    })

    await prisma.notification.create({
      data: {
        userId: payout.provider.userId,
        type: 'payout',
        title: `Demande de paiement ${next_ === 'COMPLETED' ? 'payée' : next_ === 'REJECTED' ? 'rejetée' : 'en cours de traitement'}`,
        message: `Votre demande de paiement de ${payout.amount} ${payout.currency} est ${next_.toLowerCase()}.`,
        metadata: { payoutId: payout.id, status: next_ },
      },
    })

    res.json(ok({ ...payout, status: payout.status.toLowerCase() }))
  } catch (err) { next(err) }
})

// ─── Provider Document Review ─────────────────────────────────────────────────

// GET /admin/provider-documents — list all provider verification documents
router.get('/provider-documents', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { status, providerId } = req.query as Record<string, string>
    const where = {
      ...(status && { status: status.toUpperCase() as any }),
      ...(providerId && { providerId }),
    }

    const [total, items] = await Promise.all([
      prisma.providerDocument.count({ where }),
      prisma.providerDocument.findMany({
        where, skip, take: limit, orderBy: { uploadedAt: 'desc' },
        include: { provider: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } },
      }),
    ])

    const mapped = items.map(d => ({
      ...d,
      status: d.status.toLowerCase(),
      providerName: d.provider.companyName,
      providerEmail: d.provider.user.email,
    }))
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// PATCH /admin/provider-documents/:id — approve/reject document
router.patch('/provider-documents/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const { status, reviewNote } = req.body
    const allowed = ['APPROVED', 'REJECTED']
    const next_ = String(status ?? '').toUpperCase()
    if (!allowed.includes(next_)) throw createError('Invalid status', 400, 'VALIDATION_ERROR')

    const document = await prisma.providerDocument.update({
      where: { id },
      data: {
        status: next_ as any,
        reviewedAt: new Date(),
        reviewNote,
      },
      include: { provider: { include: { user: true } } },
    })

    // Update provider verification progress based on approved documents
    const allDocs = await prisma.providerDocument.findMany({
      where: { providerId: document.providerId },
    })
    const approvedDocs = allDocs.filter(d => d.status === 'APPROVED').length
    const progress = Math.min(100, Math.round((approvedDocs / 4) * 100)) // Assuming 4 required docs

    await prisma.provider.update({
      where: { id: document.providerId },
      data: { verificationProgress: progress },
    })

    await prisma.notification.create({
      data: {
        userId: document.provider.userId,
        type: 'verification',
        title: `Document ${next_ === 'APPROVED' ? 'approuvé' : 'rejeté'}`,
        message: `Votre document de type ${document.documentType} a été ${next_.toLowerCase()}.`,
        metadata: { documentId: document.id, status: next_ },
      },
    })

    res.json(ok({ ...document, status: document.status.toLowerCase() }))
  } catch (err) { next(err) }
})

// ─── Growth & Monetization ───────────────────────────────────────────────────────

// GET /admin/sponsored-content — list all sponsored content
router.get('/sponsored-content', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { status, type, search } = req.query as Record<string, string>
    const where = {
      ...(status && { status: status.toUpperCase() as any }),
      ...(type && { type: type.toUpperCase() as any }),
      ...(search && { OR: [{ title: { contains: search, mode: 'insensitive' as const } }, { sponsor: { contains: search, mode: 'insensitive' as const } }] }),
    }

    const [total, items] = await Promise.all([
      prisma.sponsoredContent.count({ where }),
      prisma.sponsoredContent.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
    ])

    const mapped = items.map(i => ({ ...i, status: i.status.toLowerCase(), type: i.type.toLowerCase() }))
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// POST /admin/sponsored-content — create sponsored content
router.post('/sponsored-content', async (req: Request, res: Response, next) => {
  try {
    const { title, type, sponsor, sponsorId, placement, startDate, endDate, budget, imageUrl, videoUrl, contentUrl, metadata } = req.body
    const content = await prisma.sponsoredContent.create({
      data: {
        title,
        type: type.toUpperCase(),
        sponsor,
        sponsorId,
        placement,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: Number(budget),
        imageUrl,
        videoUrl,
        contentUrl,
        metadata,
      },
    })
    res.json(ok({ ...content, status: content.status.toLowerCase(), type: content.type.toLowerCase() }))
  } catch (err) { next(err) }
})

// PATCH /admin/sponsored-content/:id — update sponsored content
router.patch('/sponsored-content/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const { title, type, sponsor, sponsorId, placement, status, startDate, endDate, budget, imageUrl, videoUrl, contentUrl, impressions, clicks, cost, metadata } = req.body
    const content = await prisma.sponsoredContent.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(type && { type: type.toUpperCase() }),
        ...(sponsor && { sponsor }),
        ...(sponsorId && { sponsorId }),
        ...(placement && { placement }),
        ...(status && { status: status.toUpperCase() as any }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(budget !== undefined && { budget: Number(budget) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(contentUrl !== undefined && { contentUrl }),
        ...(impressions !== undefined && { impressions: Number(impressions) }),
        ...(clicks !== undefined && { clicks: Number(clicks) }),
        ...(cost !== undefined && { cost: Number(cost) }),
        ...(metadata !== undefined && { metadata }),
      },
    })
    res.json(ok({ ...content, status: content.status.toLowerCase(), type: content.type.toLowerCase() }))
  } catch (err) { next(err) }
})

// DELETE /admin/sponsored-content/:id — delete sponsored content
router.delete('/sponsored-content/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    await prisma.sponsoredContent.delete({ where: { id } })
    res.json(ok({ message: 'Sponsored content deleted' }))
  } catch (err) { next(err) }
})

// GET /admin/partnerships — list all partnerships
router.get('/partnerships', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { status, type, search } = req.query as Record<string, string>
    const where = {
      ...(status && { status: status.toUpperCase() as any }),
      ...(type && { type: type.toUpperCase() as any }),
      ...(search && { OR: [{ name: { contains: search, mode: 'insensitive' as const } }] }),
    }

    const [total, items] = await Promise.all([
      prisma.partnership.count({ where }),
      prisma.partnership.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
    ])

    const mapped = items.map(i => ({ ...i, status: i.status.toLowerCase(), type: i.type.toLowerCase(), tier: i.tier.toLowerCase() }))
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// POST /admin/partnerships — create partnership
router.post('/partnerships', async (req: Request, res: Response, next) => {
  try {
    const { name, type, tier, commission, startDate, contractEnd, benefits, contactEmail, contactPhone, logoUrl, metadata } = req.body
    const partnership = await prisma.partnership.create({
      data: {
        name,
        type: type.toUpperCase(),
        tier: tier.toUpperCase(),
        commission: Number(commission),
        startDate: startDate ? new Date(startDate) : null,
        contractEnd: contractEnd ? new Date(contractEnd) : null,
        benefits,
        contactEmail,
        contactPhone,
        logoUrl,
        metadata,
      },
    })
    res.json(ok({ ...partnership, status: partnership.status.toLowerCase(), type: partnership.type.toLowerCase(), tier: partnership.tier.toLowerCase() }))
  } catch (err) { next(err) }
})

// PATCH /admin/partnerships/:id — update partnership
router.patch('/partnerships/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const { name, type, status, tier, revenue, bookings, commission, startDate, contractEnd, benefits, contactEmail, contactPhone, logoUrl, metadata } = req.body
    const partnership = await prisma.partnership.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type: type.toUpperCase() }),
        ...(status && { status: status.toUpperCase() as any }),
        ...(tier && { tier: tier.toUpperCase() }),
        ...(revenue !== undefined && { revenue: Number(revenue) }),
        ...(bookings !== undefined && { bookings: Number(bookings) }),
        ...(commission !== undefined && { commission: Number(commission) }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(contractEnd !== undefined && { contractEnd: contractEnd ? new Date(contractEnd) : null }),
        ...(benefits !== undefined && { benefits }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(metadata !== undefined && { metadata }),
      },
    })
    res.json(ok({ ...partnership, status: partnership.status.toLowerCase(), type: partnership.type.toLowerCase(), tier: partnership.tier.toLowerCase() }))
  } catch (err) { next(err) }
})

// DELETE /admin/partnerships/:id — delete partnership
router.delete('/partnerships/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    await prisma.partnership.delete({ where: { id } })
    res.json(ok({ message: 'Partnership deleted' }))
  } catch (err) { next(err) }
})

// GET /admin/promotions — list all promotions
router.get('/promotions', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { status, search } = req.query as Record<string, string>
    const where = {
      ...(status && { status: status.toUpperCase() as any }),
      ...(search && { OR: [{ code: { contains: search, mode: 'insensitive' as const } }, { description: { contains: search, mode: 'insensitive' as const } }] }),
    }

    const [total, items] = await Promise.all([
      prisma.promotion.count({ where }),
      prisma.promotion.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
    ])

    const mapped = items.map(i => ({ ...i, status: i.status.toLowerCase(), discountType: i.discountType.toLowerCase() }))
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// POST /admin/promotions — create promotion
router.post('/promotions', async (req: Request, res: Response, next) => {
  try {
    const { code, description, discount, discountType, minPurchase, maxDiscount, usageLimit, startDate, endDate, applicableTo, metadata } = req.body
    const promotion = await prisma.promotion.create({
      data: {
        code: code.toUpperCase(),
        description,
        discount: Number(discount),
        discountType: discountType.toUpperCase(),
        minPurchase: Number(minPurchase || 0),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        applicableTo,
        metadata,
      },
    })
    res.json(ok({ ...promotion, status: promotion.status.toLowerCase(), discountType: promotion.discountType.toLowerCase() }))
  } catch (err) { next(err) }
})

// PATCH /admin/promotions/:id — update promotion
router.patch('/promotions/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const { code, description, discount, discountType, status, minPurchase, maxDiscount, usageLimit, usedCount, startDate, endDate, applicableTo, metadata } = req.body
    const promotion = await prisma.promotion.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(description && { description }),
        ...(discount !== undefined && { discount: Number(discount) }),
        ...(discountType && { discountType: discountType.toUpperCase() }),
        ...(status && { status: status.toUpperCase() as any }),
        ...(minPurchase !== undefined && { minPurchase: Number(minPurchase) }),
        ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? Number(maxDiscount) : null }),
        ...(usageLimit !== undefined && { usageLimit: usageLimit ? Number(usageLimit) : null }),
        ...(usedCount !== undefined && { usedCount: Number(usedCount) }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(applicableTo !== undefined && { applicableTo }),
        ...(metadata !== undefined && { metadata }),
      },
    })
    res.json(ok({ ...promotion, status: promotion.status.toLowerCase(), discountType: promotion.discountType.toLowerCase() }))
  } catch (err) { next(err) }
})

// DELETE /admin/promotions/:id — delete promotion
router.delete('/promotions/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    await prisma.promotion.delete({ where: { id } })
    res.json(ok({ message: 'Promotion deleted' }))
  } catch (err) { next(err) }
})

// ─── Risks, Legal & Moderation ─────────────────────────────────────────────────────

// GET /admin/moderation — list moderation items
router.get('/moderation', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { status, type, priority, search } = req.query as Record<string, string>
    const where = {
      ...(status && { status: status.toUpperCase() as any }),
      ...(type && { type: type.toUpperCase() as any }),
      ...(priority && { priority: priority.toUpperCase() as any }),
      ...(search && { OR: [{ authorName: { contains: search, mode: 'insensitive' as const } }, { targetName: { contains: search, mode: 'insensitive' as const } }] }),
    }

    const [total, items] = await Promise.all([
      prisma.moderationItem.count({ where }),
      prisma.moderationItem.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
    ])

    const mapped = items.map(i => ({ ...i, status: i.status.toLowerCase(), type: i.type.toLowerCase(), priority: i.priority.toLowerCase() }))
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// POST /admin/moderation — create moderation item
router.post('/moderation', async (req: Request, res: Response, next) => {
  try {
    const { type, content, authorId, authorName, targetType, targetId, targetName, priority, reason, reports, metadata } = req.body
    const item = await prisma.moderationItem.create({
      data: {
        type: type.toUpperCase(),
        content,
        authorId,
        authorName,
        targetType,
        targetId,
        targetName,
        priority: priority.toUpperCase(),
        reason,
        reports: Number(reports || 0),
        metadata,
      },
    })
    res.json(ok({ ...item, status: item.status.toLowerCase(), type: item.type.toLowerCase(), priority: item.priority.toLowerCase() }))
  } catch (err) { next(err) }
})

// PATCH /admin/moderation/:id — resolve moderation item
router.patch('/moderation/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const { status, resolution, priority } = req.body
    const allowed = ['INVESTIGATING', 'RESOLVED', 'ESCALATED']
    const next_ = String(status ?? '').toUpperCase()
    if (!allowed.includes(next_)) throw createError('Invalid status', 400, 'VALIDATION_ERROR')

    const item = await prisma.moderationItem.update({
      where: { id },
      data: {
        status: next_ as any,
        ...(priority && { priority: priority.toUpperCase() }),
        ...(resolution && { resolution }),
        ...(next_ === 'RESOLVED' && { resolvedAt: new Date(), resolvedBy: req.user!.userId }),
      },
    })
    res.json(ok({ ...item, status: item.status.toLowerCase(), type: item.type.toLowerCase(), priority: item.priority.toLowerCase() }))
  } catch (err) { next(err) }
})

// DELETE /admin/moderation/:id — delete moderation item
router.delete('/moderation/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    await prisma.moderationItem.delete({ where: { id } })
    res.json(ok({ message: 'Moderation item deleted' }))
  } catch (err) { next(err) }
})

// GET /admin/legal-cases — list legal cases
router.get('/legal-cases', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { status, type, priority, search } = req.query as Record<string, string>
    const where = {
      ...(status && { status: status.toUpperCase() as any }),
      ...(type && { type: type.toUpperCase() as any }),
      ...(priority && { priority: priority.toUpperCase() as any }),
      ...(search && { OR: [{ title: { contains: search, mode: 'insensitive' as const } }, { userName: { contains: search, mode: 'insensitive' as const } }] }),
    }

    const [total, items] = await Promise.all([
      prisma.legalCase.count({ where }),
      prisma.legalCase.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
    ])

    const mapped = items.map(i => ({ ...i, status: i.status.toLowerCase(), type: i.type.toLowerCase(), priority: i.priority.toLowerCase() }))
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// POST /admin/legal-cases — create legal case
router.post('/legal-cases', async (req: Request, res: Response, next) => {
  try {
    const { type, title, userId, userName, userEmail, priority, description, amount, deadline, metadata } = req.body
    const legalCase = await prisma.legalCase.create({
      data: {
        type: type.toUpperCase(),
        title,
        userId,
        userName,
        userEmail,
        priority: priority.toUpperCase(),
        description,
        amount: amount ? Number(amount) : null,
        deadline: deadline ? new Date(deadline) : null,
        metadata,
      },
    })
    res.json(ok({ ...legalCase, status: legalCase.status.toLowerCase(), type: legalCase.type.toLowerCase(), priority: legalCase.priority.toLowerCase() }))
  } catch (err) { next(err) }
})

// PATCH /admin/legal-cases/:id — resolve legal case
router.patch('/legal-cases/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const { status, resolution, priority } = req.body
    const allowed = ['INVESTIGATING', 'RESOLVED', 'ESCALATED']
    const next_ = String(status ?? '').toUpperCase()
    if (!allowed.includes(next_)) throw createError('Invalid status', 400, 'VALIDATION_ERROR')

    const legalCase = await prisma.legalCase.update({
      where: { id },
      data: {
        status: next_ as any,
        ...(priority && { priority: priority.toUpperCase() }),
        ...(resolution && { resolution }),
        ...(next_ === 'RESOLVED' && { resolvedAt: new Date(), resolvedBy: req.user!.userId }),
      },
    })
    res.json(ok({ ...legalCase, status: legalCase.status.toLowerCase(), type: legalCase.type.toLowerCase(), priority: legalCase.priority.toLowerCase() }))
  } catch (err) { next(err) }
})

// DELETE /admin/legal-cases/:id — delete legal case
router.delete('/legal-cases/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    await prisma.legalCase.delete({ where: { id } })
    res.json(ok({ message: 'Legal case deleted' }))
  } catch (err) { next(err) }
})

// GET /admin/security-alerts — list security alerts
router.get('/security-alerts', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { status, severity, type, search } = req.query as Record<string, string>
    const where = {
      ...(status && { status: status.toUpperCase() as any }),
      ...(severity && { severity: severity.toUpperCase() as any }),
      ...(type && { type: type.toUpperCase() as any }),
      ...(search && { OR: [{ message: { contains: search, mode: 'insensitive' as const } }, { affectedUser: { contains: search, mode: 'insensitive' as const } }] }),
    }

    const [total, items] = await Promise.all([
      prisma.securityAlert.count({ where }),
      prisma.securityAlert.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
    ])

    const mapped = items.map(i => ({ ...i, status: i.status.toLowerCase(), severity: i.severity.toLowerCase(), type: i.type.toLowerCase() }))
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// POST /admin/security-alerts — create security alert
router.post('/security-alerts', async (req: Request, res: Response, next) => {
  try {
    const { type, severity, message, ip, location, userAgent, affectedUser, affectedCount, metadata } = req.body
    const alert = await prisma.securityAlert.create({
      data: {
        type: type.toUpperCase(),
        severity: severity.toUpperCase(),
        message,
        ip,
        location,
        userAgent,
        affectedUser,
        affectedCount: Number(affectedCount || 0),
        metadata,
      },
    })
    res.json(ok({ ...alert, status: alert.status.toLowerCase(), severity: alert.severity.toLowerCase(), type: alert.type.toLowerCase() }))
  } catch (err) { next(err) }
})

// PATCH /admin/security-alerts/:id — resolve security alert
router.patch('/security-alerts/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const { status, resolution, severity } = req.body
    const allowed = ['INVESTIGATING', 'RESOLVED', 'IGNORED']
    const next_ = String(status ?? '').toUpperCase()
    if (!allowed.includes(next_)) throw createError('Invalid status', 400, 'VALIDATION_ERROR')

    const alert = await prisma.securityAlert.update({
      where: { id },
      data: {
        status: next_ as any,
        ...(severity && { severity: severity.toUpperCase() }),
        ...(resolution && { resolution }),
        ...(next_ === 'RESOLVED' && { resolvedAt: new Date(), resolvedBy: req.user!.userId }),
      },
    })
    res.json(ok({ ...alert, status: alert.status.toLowerCase(), severity: alert.severity.toLowerCase(), type: alert.type.toLowerCase() }))
  } catch (err) { next(err) }
})

// DELETE /admin/security-alerts/:id — delete security alert
router.delete('/security-alerts/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    await prisma.securityAlert.delete({ where: { id } })
    res.json(ok({ message: 'Security alert deleted' }))
  } catch (err) { next(err) }
})

export default router

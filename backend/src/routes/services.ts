/**
 * Generic services router - handles Hotels, Guides, Restaurants, Transfers, Events
 * Each service type is filtered by ?type= query param or separate endpoint aliases
 */
import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok, getPagination, paginated } from '../types.js'
import multer from 'multer'
import { uploadBufferToCloudinary } from '../services/cloudinary.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

function makeServiceRouter(serviceType: 'HOTEL' | 'GUIDE' | 'TRANSPORT' | 'RESTAURANT' | 'EVENTS') {
  const r = Router()

  // GET /
  r.get('/', async (req: Request, res: Response, next) => {
    try {
      const { page, limit, skip } = getPagination(req.query)
      const { search, country, minPrice, maxPrice } = req.query as Record<string, string>

      const where = {
        type: serviceType,
        OR: [
          { isActive: true },
          {
            providerId: { not: null },
            provider: { isVerified: true }
          }
        ],
        ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
        ...(country && { country: { equals: country, mode: 'insensitive' as const } }),
        ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
        ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
      }

      const [total, items] = await Promise.all([
        prisma.service.count({ where }),
        prisma.service.findMany({ where, skip, take: limit, orderBy: { rating: 'desc' } }),
      ])
      res.json(paginated(items, total, page, limit))
    } catch (err) { next(err) }
  })

  // GET /:id
  r.get('/:id', async (req: Request, res: Response, next) => {
    try {
      const { id } = req.params as { id: string }
      const item = await prisma.service.findFirst({ where: { id, type: serviceType } })
      if (!item) throw createError('Not found', 404, 'NOT_FOUND')
      res.json(ok(item))
    } catch (err) { next(err) }
  })

  // POST /:id/book
  r.post('/:id/book', async (req: Request, res: Response, next) => {
    try {
      const { id } = req.params as { id: string }
      const item = await prisma.service.findFirst({ where: { id, type: serviceType, isActive: true } })
      if (!item) throw createError('Service not found', 404, 'NOT_FOUND')

      const { 
        checkInDate, checkOutDate, guests, startDate, endDate, reservationDate, covers, paymentMethod,
        // Guest booking fields
        guestEmail, guestPhone, guestName, guestCountry,
        createAccount, password
      } = req.body

      let userId: string | null = null
      let autoRegistered = false
      let tempPassword: string | null = null

      // Handle guest booking with optional auto-registration
      if (req.user) {
        userId = req.user.userId
      } else if (guestEmail && guestName) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email: guestEmail } })
        if (existingUser) {
          userId = existingUser.id
        } else if (createAccount) {
          // Auto-register the guest
          const bcrypt = (await import('bcryptjs')).default
          const tempPwd = password || Math.random().toString(36).slice(-10)
          const hashedPassword = await bcrypt.hash(tempPwd, 12)

          const nameParts = guestName.split(' ')
          const firstName = nameParts[0] || guestName
          const lastName = nameParts.slice(1).join('') || ''

          const newUser = await prisma.user.create({
            data: {
              email: guestEmail,
              password: hashedPassword,
              firstName,
              lastName,
              phone: guestPhone,
              country: guestCountry || 'CM',
              role: 'USER',
            },
          })

          userId = newUser.id
          autoRegistered = true
          tempPassword = tempPwd

          // Create wallet for new user
          await prisma.walletAccount.create({
            data: { userId: newUser.id, balance: 0, currency: item.currency },
          })
        }
      }

      const booking = await prisma.booking.create({
        data: {
          userId,
          serviceType: serviceType.toLowerCase(),
          serviceId: item.id,
          providerId: item.providerId ?? undefined,
          status: 'PENDING_PAYMENT',
          totalAmount: item.price,
          currency: item.currency,
          metadata: { checkInDate, checkOutDate, guests, startDate, endDate, reservationDate, covers, paymentMethod },
          isGuest: !userId,
          guestEmail,
          guestPhone,
          guestName,
          guestCountry: guestCountry || 'CM',
        },
      })

      // Only create notification if user exists (not a guest booking)
      if (userId) {
        await prisma.notification.create({
          data: {
            userId,
            type: 'booking',
            title: 'Réservation créée',
            message: `Votre réservation pour ${item.name} est en attente de paiement.`,
            metadata: { bookingId: booking.id },
          },
        })
      }

      res.status(201).json(ok({
        bookingId: booking.id,
        status: 'pending_payment',
        user: userId ? { id: userId, autoRegistered, tempPassword } : null,
        isGuest: !userId,
      }))
    } catch (err) { next(err) }
  })

  r.post('/upload-image', authenticate, requireRole('PROVIDER', 'ADMIN'), upload.single('file'), async (req: Request, res: Response, next) => {
    try {
      if (!req.file?.buffer) throw createError('file required', 400)
      const uploaded = await uploadBufferToCloudinary(req.file.buffer, `traveo/services/${serviceType.toLowerCase()}`)
      res.status(201).json(ok({ imageUrl: uploaded.url, publicId: uploaded.publicId }))
    } catch (err) { next(err) }
  })

  // POST / — create (provider/admin)
  r.post('/', authenticate, requireRole('PROVIDER', 'ADMIN'), async (req: Request, res: Response, next) => {
    try {
      const { name, description, imageUrl, location, country, price, currency, metadata } = req.body
      let providerId: string | undefined

      if (req.user!.role === 'PROVIDER') {
        const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
        if (!provider) throw createError('Provider profile not found', 403, 'FORBIDDEN')
        providerId = provider.id
      }

      const item = await prisma.service.create({
        data: { type: serviceType, providerId, name, description, imageUrl, location, country, price: parseFloat(price), currency: currency ?? 'XAF', metadata: metadata ?? {} },
      })
      res.status(201).json(ok(item))
    } catch (err) { next(err) }
  })

  // PATCH /:id
  r.patch('/:id', authenticate, requireRole('PROVIDER', 'ADMIN'), async (req: Request, res: Response, next) => {
    try {
      const { id } = req.params as { id: string }
      const item = await prisma.service.update({ where: { id }, data: req.body })
      res.json(ok(item))
    } catch (err) { next(err) }
  })

  // DELETE /:id
  r.delete('/:id', authenticate, requireRole('PROVIDER', 'ADMIN'), async (req: Request, res: Response, next) => {
    try {
      const { id } = req.params as { id: string }
      await prisma.service.update({ where: { id }, data: { isActive: false } })
      res.json(ok({ message: 'Service deactivated' }))
    } catch (err) { next(err) }
  })

  return r
}

// ─── Duffel Stays (Hotels) helper ────────────────────────────────────────────
const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY ?? ''
const DUFFEL_BASE_URL = process.env.DUFFEL_BASE_URL ?? 'https://api.duffel.com'

async function duffelFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${DUFFEL_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${DUFFEL_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Duffel-Version': 'v2',
      ...(options.headers ?? {}),
    },
  })
  const body = await res.json()
  if (!res.ok) {
    const msg = (body as any).errors?.[0]?.message ?? 'Duffel API error'
    throw new Error(msg)
  }
  return body as T
}

export const hotelsRouter = makeServiceRouter('HOTEL')

// GET /hotels/search/duffel — search hotels via Duffel Stays
hotelsRouter.get('/search/duffel', async (req: Request, res: Response, next) => {
  try {
    const { location, checkInDate, checkOutDate, guests = '1', rooms = '1' } = req.query as Record<string, string>
    if (!location || !checkInDate || !checkOutDate) {
      throw createError('location, checkInDate, checkOutDate required', 400)
    }

    if (!DUFFEL_API_KEY) {
      // Fallback to local services when Duffel not configured
      const items = await prisma.service.findMany({
        where: { type: 'HOTEL', isActive: true, ...(location && { country: { contains: location, mode: 'insensitive' as const } }) },
        take: 20,
        orderBy: { rating: 'desc' },
      })
      return res.json({ source: 'local', total: items.length, results: items })
    }

    try {
      const searchRes: any = await duffelFetch('/stays/search', {
        method: 'POST',
        body: JSON.stringify({
          data: {
            location: { radius: 10, geographic_coordinates: undefined, query: location },
            check_in_date: checkInDate,
            check_out_date: checkOutDate,
            rooms: parseInt(rooms, 10) || 1,
            guests: Array.from({ length: parseInt(guests, 10) || 1 }, () => ({ type: 'adult' })),
          },
        }),
      })

      const results = (searchRes.data?.results ?? []).slice(0, 30).map((r: any) => ({
        offerId: r.id,
        accommodationId: r.accommodation?.id,
        name: r.accommodation?.name ?? 'Hotel',
        description: r.accommodation?.description ?? '',
        imageUrl: r.accommodation?.photos?.[0]?.url ?? null,
        rating: r.accommodation?.rating ?? null,
        location: r.accommodation?.location?.address?.line_one ?? location,
        country: r.accommodation?.location?.address?.country_code ?? '',
        price: parseFloat(r.cheapest_rate_total_amount ?? '0'),
        currency: 'XAF',
        amenities: r.accommodation?.amenities ?? [],
      }))

      return res.json({ source: 'duffel', total: results.length, results })
    } catch (duffelError) {
      console.error('❌ Duffel stays search failed:', (duffelError as Error).message)
      const items = await prisma.service.findMany({
        where: { type: 'HOTEL', isActive: true },
        take: 20,
        orderBy: { rating: 'desc' },
      })
      return res.json({ source: 'local-fallback', total: items.length, results: items })
    }
  } catch (err) { next(err) }
})
export const guidesRouter = makeServiceRouter('GUIDE')
export const restaurantsRouter = makeServiceRouter('RESTAURANT')
export const transfersRouter = makeServiceRouter('TRANSPORT')
export const eventsRouter = makeServiceRouter('EVENTS')

export default router

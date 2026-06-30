import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok, getPagination, paginated } from '../types.js'

const router = Router()

// ─── Duffel API Helper ────────────────────────────────────────────────────────
const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY ?? ''
const DUFFEL_BASE_URL = process.env.DUFFEL_BASE_URL ?? 'https://api.duffel.com'

async function duffelFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
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

// ─── Format a Duffel offer to our UI shape ────────────────────────────────────
function formatOffer(offer: any) {
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
    offerId: offer.id,
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
    currency: offer.total_currency ?? 'XAF',
    availableSeats: offer.available_services?.length ?? 150,
    conditions: offer.conditions ?? {},
  }
}

function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return 0
  return parseInt(match[1] ?? '0') * 60 + parseInt(match[2] ?? '0')
}

// ─── GET /flights/search — via Duffel ─────────────────────────────────────────
router.get('/search', async (req: Request, res: Response, next) => {
  try {
    const { origin, destination, departDate, passengers = '1', cabin = 'economy' } = req.query as Record<string, string>

    if (!origin || !destination || !departDate) {
      throw createError('origin, destination, departDate required', 400)
    }

    // Use Duffel if API key available, otherwise fall back to local DB
    if (DUFFEL_API_KEY) {
      console.log(`🔍 Searching Duffel flights: ${origin} → ${destination} on ${departDate}`)

      const passengerCount = parseInt(passengers, 10) || 1
      const paxList = Array.from({ length: passengerCount }, () => ({ type: 'adult' }))

      try {
        const offerRequest: any = await duffelFetch('/air/offer_requests', {
          method: 'POST',
          body: JSON.stringify({
            data: {
              slices: [{ origin: origin.toUpperCase(), destination: destination.toUpperCase(), departure_date: departDate }],
              passengers: paxList,
              cabin_class: cabin === 'business' ? 'business' : 'economy',
              return_offers: true,
            },
          }),
        })

        const offerRequestId = offerRequest.data?.id
        if (!offerRequestId) throw new Error('No offer request ID returned')

        console.log(`✅ Created Duffel offer request: ${offerRequestId}`)

        // Get offers
        const offersRes: any = await duffelFetch(
          `/air/offers?offer_request_id=${offerRequestId}&limit=20&sort=total_amount`,
        )
        const offers = (offersRes.data ?? []).map(formatOffer)

        console.log(`✈️ Found ${offers.length} Duffel flights`)

        return res.json({ searchId: offerRequestId, page: 1, limit: 20, total: offers.length, results: offers })
      } catch (duffelError) {
        console.error('❌ Duffel search failed:', (duffelError as Error).message)
        console.log('⚠️ Falling back to local flights')
      }
    }

    // Fallback — local DB
    const { skip } = getPagination(req.query)
    const where = {
      isActive: true,
      ...(origin && { originCode: { equals: origin.toUpperCase() } }),
      ...(destination && { destinationCode: { equals: destination.toUpperCase() } }),
      ...(departDate && {
        departAt: { gte: new Date(`${departDate}T00:00:00Z`), lte: new Date(`${departDate}T23:59:59Z`) },
      }),
      availableSeats: { gte: parseInt(passengers, 10) },
    }
    const [total, items] = await Promise.all([
      prisma.flight.count({ where }),
      prisma.flight.findMany({ where, skip, take: 20, orderBy: { priceEconomy: 'asc' } }),
    ])
    const results = items.map(f => ({
      offerId: f.id, id: f.id, airline: f.airline, flightNumber: f.flightNumber,
      origin: f.origin, originCode: f.originCode, destination: f.destination, destinationCode: f.destinationCode,
      departAt: f.departAt.toISOString(), arriveAt: f.arriveAt.toISOString(),
      durationMinutes: f.durationMinutes, stops: f.stops,
      priceEconomy: f.priceEconomy, priceBusiness: f.priceBusiness, currency: f.currency,
      availableSeats: f.availableSeats,
    }))
    res.json({ searchId: `local_${Date.now()}`, page: 1, limit: 20, total, results })
  } catch (err) { next(err) }
})

// GET /flights/:id
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }

    // Try Duffel offer first
    if (DUFFEL_API_KEY && id.startsWith('off_')) {
      const offer: any = await duffelFetch(`/air/offers/${id}`)
      return res.json(ok(formatOffer(offer.data)))
    }

    const flight = await prisma.flight.findUnique({ where: { id } })
    if (!flight) throw createError('Flight not found', 404, 'NOT_FOUND')
    res.json(ok(flight))
  } catch (err) { next(err) }
})

// POST /flights/book
router.post('/book', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { offerId, paymentMethod, cabin } = req.body
    if (!offerId) throw createError('offerId required', 400)

    // Get user information for booking
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, title: true, dateOfBirth: true, gender: true, country: true }
    })
    if (!user) throw createError('User not found', 404, 'USER_NOT_FOUND')

    // Check if user has required flight booking information
    if (!user.title || !user.dateOfBirth || !user.gender || !user.phone) {
      throw createError('Please complete your profile with title, date of birth, gender, and phone number before booking flights', 400, 'INCOMPLETE_PROFILE')
    }

    let bookingAmount = 0
    let bookingCurrency = 'XAF'
    let duffelOrderId: string | undefined
    let bookingReference: string | undefined

      // Try Duffel booking if it's a Duffel offer
    if (DUFFEL_API_KEY && offerId.startsWith('off_')) {
      console.log('🎫 Attempting Duffel booking for offer:', offerId)

      // Get offer details first to get passenger IDs and price
      const offerRes: any = await duffelFetch(`/air/offers/${offerId}`)
      const offer = offerRes.data
      console.log('📋 Fetched offer:', { id: offer.id, total_amount: offer.total_amount, currency: offer.total_currency, passengers: offer.passengers })

      bookingAmount = parseFloat(offer.total_amount ?? '0')
      bookingCurrency = offer.total_currency ?? 'USD'

      // For instant bookings, we need to match passenger structure from the offer
      try {
        console.log('👤 Creating passenger for user:', user.firstName, user.lastName)

        // Format phone number to E.164 if needed
        let phoneNumber = user.phone
        if (phoneNumber && !phoneNumber.startsWith('+')) {
          // Add country code if missing - this is a simplified approach
          // In a real app, you'd want more sophisticated phone number parsing
          phoneNumber = `+${user.country === 'CM' ? '237' : '1'}${phoneNumber.replace(/\D/g, '')}`
        }

        let passengerData: any[]

        if (offer.passengers && offer.passengers.length > 0) {
          // Use existing passenger IDs from the offer
          passengerData = offer.passengers.map((pass: any) => ({
            id: pass.id,
            type: pass.type || 'adult',
            title: user.title,
            given_name: user.firstName,
            family_name: user.lastName,
            email: user.email,
            phone_number: phoneNumber,
            born_on: user.dateOfBirth?.toISOString().split('T')[0],
            gender: user.gender,
          }))
        } else {
          // Create new passenger data
          passengerData = [{
            type: 'adult',
            title: user.title,
            given_name: user.firstName,
            family_name: user.lastName,
            email: user.email,
            phone_number: phoneNumber,
            born_on: user.dateOfBirth?.toISOString().split('T')[0],
            gender: user.gender,
          }]
        }

        console.log('📝 Passenger data for order:', passengerData)

        const orderRes: any = await duffelFetch('/air/orders', {
          method: 'POST',
          body: JSON.stringify({
            data: {
              type: 'instant',
              selected_offers: [offerId],
              passengers: passengerData,
              payments: [{
                type: 'balance',
                amount: offer.total_amount,
                currency: offer.total_currency
              }],
            },
          }),
        })
        duffelOrderId = orderRes.data?.id
        bookingReference = orderRes.data?.booking_reference || orderRes.data?.booking_references?.[0]?.booking_reference
        console.log('✅ Duffel order created successfully:', duffelOrderId)
        console.log('🔗 Order details:', orderRes.data)
      } catch (duffelErr: any) {
        const errorMessage = duffelErr?.message || 'Unknown error'
        console.error('❌ Duffel booking failed:', errorMessage)

        // Check if this is an "already booked" error
        if (errorMessage.includes('already been booked') || errorMessage.includes('offer request that has already been booked')) {
          console.warn('⚠️ Offer already booked, user may have refreshed or multiple attempts')
          // Don't create local booking for already booked offers
          throw createError('Cette offre a déjà été réservée. Veuillez rechercher de nouveaux vols.', 409, 'OFFER_ALREADY_BOOKED')
        }

        console.warn('📝 Creating local booking record instead')
      }
    } else {
      // Local flight booking
      const flight = await prisma.flight.findUnique({ where: { id: offerId } })
      if (!flight) throw createError('Flight not found', 404, 'NOT_FOUND')
      if (flight.availableSeats < 1) throw createError('No seats available', 409, 'NO_SEATS')
      bookingAmount = cabin === 'business' ? (flight.priceBusiness ?? flight.priceEconomy * 2) : flight.priceEconomy
      bookingCurrency = flight.currency
      await prisma.flight.update({ where: { id: flight.id }, data: { availableSeats: { decrement: 1 } } })
    }

    // Create booking record
    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.userId,
        serviceType: 'flight',
        flightId: offerId.startsWith('off_') ? undefined : offerId,
        status: duffelOrderId ? 'CONFIRMED' : 'PENDING_PAYMENT',
        totalAmount: bookingAmount,
        currency: bookingCurrency,
        metadata: { passenger: { fullName: `${user.firstName} ${user.lastName}`, email: user.email, phone: user.phone }, paymentMethod, cabin: cabin ?? 'economy', duffelOrderId },
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.user!.userId,
        type: 'booking',
        title: duffelOrderId ? 'Vol confirmé ✅' : 'Réservation en cours',
        message: duffelOrderId
          ? `Votre vol a été confirmé. Commande Duffel: ${duffelOrderId}`
          : `Votre réservation est en attente de paiement.`,
        metadata: { bookingId: booking.id },
      },
    })

    res.status(201).json(ok({
      bookingId: booking.id,
      status: duffelOrderId ? 'confirmed' : 'pending_payment',
      duffelOrderId,
      bookingReference
    }))
  } catch (err) { next(err) }
})

// GET /flights — list all
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const [total, items] = await Promise.all([
      prisma.flight.count({ where: { isActive: true } }),
      prisma.flight.findMany({ where: { isActive: true }, skip, take: limit, orderBy: { departAt: 'asc' } }),
    ])
    res.json(paginated(items, total, page, limit))
  } catch (err) { next(err) }
})

export default router

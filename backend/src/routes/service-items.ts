import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok, getPagination, paginated } from '../types.js'

const router = Router()

// Helper to verify service ownership
async function verifyServiceOwnership(serviceId: string, userId: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { provider: true },
  })
  if (!service) throw createError('Service not found', 404, 'NOT_FOUND')
  if (service.provider?.userId !== userId) throw createError('Forbidden', 403, 'FORBIDDEN')
  return service
}

// Helper to get provider's first service of a specific type
async function getProviderServiceByType(userId: string, serviceType: string) {
  const provider = await prisma.provider.findUnique({ where: { userId } })
  if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

  const service = await prisma.service.findFirst({
    where: { providerId: provider.id, type: serviceType.toUpperCase() as any },
  })
  if (!service) {
    // Log for debugging
    console.log(`No service found for provider ${provider.id} with type ${serviceType.toUpperCase()}`)
    throw createError(`No service found for type ${serviceType}. Please create a service first.`, 404, 'NOT_FOUND')
  }
  return service
}

// ─── Hotel Rooms ───────────────────────────────────────────────────────────────

// GET /providers/service-items/hotel-rooms (auto-detect provider's hotel service)
router.get('/hotel-rooms', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    const service = await prisma.service.findFirst({
      where: { providerId: provider.id, type: 'HOTEL' },
    })
    if (!service) {
      // Return empty array instead of 404 - provider hasn't created a hotel service yet
      return res.json(ok([]))
    }

    const rooms = await prisma.hotelRoom.findMany({
      where: { serviceId: service.id },
      orderBy: { createdAt: 'desc' },
    })
    res.json(ok(rooms))
  } catch (err) { next(err) }
})

// POST /providers/service-items/hotel-rooms (auto-detect provider's hotel service)
router.post('/hotel-rooms', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId, name, price, maxGuests, available, amenities, description, imageUrl } = req.body

    // If serviceId is provided, verify it belongs to the provider
    let targetServiceId: string
    if (serviceId) {
      const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
      if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

      const service = await prisma.service.findFirst({
        where: { id: serviceId, providerId: provider.id, type: 'HOTEL' },
      })
      if (!service) throw createError('Hotel service not found or does not belong to you', 404, 'NOT_FOUND')
      targetServiceId = service.id
    } else {
      // Auto-detect provider's hotel service
      const service = await getProviderServiceByType(req.user!.userId, 'HOTEL')
      targetServiceId = service.id
    }

    if (!name || !price || !maxGuests || !available) {
      throw createError('name, price, maxGuests, and available required', 400, 'VALIDATION_ERROR')
    }

    const room = await prisma.hotelRoom.create({
      data: {
        serviceId: targetServiceId,
        name,
        price: Number(price),
        maxGuests: Number(maxGuests),
        available: Number(available),
        amenities: amenities || [],
        description,
        imageUrl,
      },
    })
    res.status(201).json(ok(room))
  } catch (err) { next(err) }
})

// PATCH /providers/service-items/hotel-rooms/:id
router.patch('/hotel-rooms/:id', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const service = await getProviderServiceByType(req.user!.userId, 'HOTEL')
    const room = await prisma.hotelRoom.findFirst({ where: { id, serviceId: service.id } })
    if (!room) throw createError('Room not found', 404, 'NOT_FOUND')

    const { name, price, maxGuests, available, amenities, description, imageUrl, isActive } = req.body
    const updated = await prisma.hotelRoom.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: Number(price) }),
        ...(maxGuests !== undefined && { maxGuests: Number(maxGuests) }),
        ...(available !== undefined && { available: Number(available) }),
        ...(amenities !== undefined && { amenities }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })
    res.json(ok(updated))
  } catch (err) { next(err) }
})

// DELETE /providers/service-items/hotel-rooms/:id
router.delete('/hotel-rooms/:id', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const service = await getProviderServiceByType(req.user!.userId, 'HOTEL')
    const room = await prisma.hotelRoom.findFirst({ where: { id, serviceId: service.id } })
    if (!room) throw createError('Room not found', 404, 'NOT_FOUND')

    await prisma.hotelRoom.delete({ where: { id } })
    res.json(ok({ id, deleted: true }))
  } catch (err) { next(err) }
})

// GET /providers/services/:serviceId/rooms
router.get('/rooms/:serviceId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId } = req.params as { serviceId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    const rooms = await prisma.hotelRoom.findMany({
      where: { serviceId },
      orderBy: { createdAt: 'desc' },
    })
    res.json(ok(rooms))
  } catch (err) { next(err) }
})

// POST /providers/services/:serviceId/rooms
router.post('/rooms/:serviceId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId } = req.params as { serviceId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    const { name, price, maxGuests, available, amenities, description, imageUrl } = req.body
    if (!name || !price || !maxGuests || !available) {
      throw createError('name, price, maxGuests, and available required', 400, 'VALIDATION_ERROR')
    }

    const room = await prisma.hotelRoom.create({
      data: {
        serviceId,
        name,
        price: Number(price),
        maxGuests: Number(maxGuests),
        available: Number(available),
        amenities: amenities || [],
        description,
        imageUrl,
      },
    })
    res.status(201).json(ok(room))
  } catch (err) { next(err) }
})

// PATCH /providers/services/:serviceId/rooms/:roomId
router.patch('/rooms/:serviceId/:roomId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId, roomId } = req.params as { serviceId: string; roomId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    const { name, price, maxGuests, available, amenities, description, imageUrl, isActive } = req.body
    const room = await prisma.hotelRoom.update({
      where: { id: roomId },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: Number(price) }),
        ...(maxGuests !== undefined && { maxGuests: Number(maxGuests) }),
        ...(available !== undefined && { available: Number(available) }),
        ...(amenities !== undefined && { amenities }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })
    res.json(ok(room))
  } catch (err) { next(err) }
})

// DELETE /providers/services/:serviceId/rooms/:roomId
router.delete('/rooms/:serviceId/:roomId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId, roomId } = req.params as { serviceId: string; roomId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    await prisma.hotelRoom.delete({ where: { id: roomId } })
    res.json(ok({ id: roomId, deleted: true }))
  } catch (err) { next(err) }
})

// ─── Menu Items ───────────────────────────────────────────────────────────────

// GET /providers/service-items/menu-items (auto-detect provider's restaurant service)
router.get('/menu-items', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    const service = await prisma.service.findFirst({
      where: { providerId: provider.id, type: 'RESTAURANT' },
    })
    if (!service) {
      return res.json(ok([]))
    }

    const items = await prisma.menuItem.findMany({
      where: { serviceId: service.id },
      orderBy: { createdAt: 'desc' },
    })
    res.json(ok(items))
  } catch (err) { next(err) }
})

// POST /providers/service-items/menu-items (auto-detect provider's restaurant service)
router.post('/menu-items', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const service = await getProviderServiceByType(req.user!.userId, 'RESTAURANT')
    const { name, price, cuisine, description, preparationTime, imageUrl, dietary } = req.body
    if (!name || !price || !cuisine) {
      throw createError('name, price, and cuisine required', 400, 'VALIDATION_ERROR')
    }

    const item = await prisma.menuItem.create({
      data: {
        serviceId: service.id,
        name,
        price: Number(price),
        cuisine,
        description,
        preparationTime: preparationTime ? Number(preparationTime) : null,
        imageUrl,
        dietary: dietary || [],
      },
    })
    res.status(201).json(ok(item))
  } catch (err) { next(err) }
})

// PATCH /providers/service-items/menu-items/:id
router.patch('/menu-items/:id', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const service = await getProviderServiceByType(req.user!.userId, 'RESTAURANT')
    const item = await prisma.menuItem.findFirst({ where: { id, serviceId: service.id } })
    if (!item) throw createError('Menu item not found', 404, 'NOT_FOUND')

    const { name, price, cuisine, description, preparationTime, imageUrl, dietary, isActive } = req.body
    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: Number(price) }),
        ...(cuisine !== undefined && { cuisine }),
        ...(description !== undefined && { description }),
        ...(preparationTime !== undefined && { preparationTime: preparationTime ? Number(preparationTime) : null }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(dietary !== undefined && { dietary }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })
    res.json(ok(updated))
  } catch (err) { next(err) }
})

// DELETE /providers/service-items/menu-items/:id
router.delete('/menu-items/:id', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const service = await getProviderServiceByType(req.user!.userId, 'RESTAURANT')
    const item = await prisma.menuItem.findFirst({ where: { id, serviceId: service.id } })
    if (!item) throw createError('Menu item not found', 404, 'NOT_FOUND')

    await prisma.menuItem.delete({ where: { id } })
    res.json(ok({ id, deleted: true }))
  } catch (err) { next(err) }
})

// GET /providers/services/:serviceId/menu-items
router.get('/menu-items/:serviceId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId } = req.params as { serviceId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    const items = await prisma.menuItem.findMany({
      where: { serviceId },
      orderBy: { createdAt: 'desc' },
    })
    res.json(ok(items))
  } catch (err) { next(err) }
})

// POST /providers/services/:serviceId/menu-items
router.post('/menu-items/:serviceId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId } = req.params as { serviceId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    const { name, price, cuisine, description, preparationTime, imageUrl, dietary } = req.body
    if (!name || !price || !cuisine) {
      throw createError('name, price, and cuisine required', 400, 'VALIDATION_ERROR')
    }

    const item = await prisma.menuItem.create({
      data: {
        serviceId,
        name,
        price: Number(price),
        cuisine,
        description,
        preparationTime: preparationTime ? Number(preparationTime) : null,
        imageUrl,
        dietary: dietary || [],
      },
    })
    res.status(201).json(ok(item))
  } catch (err) { next(err) }
})

// PATCH /providers/services/:serviceId/menu-items/:itemId
router.patch('/menu-items/:serviceId/:itemId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId, itemId } = req.params as { serviceId: string; itemId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    const { name, price, cuisine, description, preparationTime, imageUrl, dietary, isActive } = req.body
    const item = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: Number(price) }),
        ...(cuisine !== undefined && { cuisine }),
        ...(description !== undefined && { description }),
        ...(preparationTime !== undefined && { preparationTime: preparationTime ? Number(preparationTime) : null }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(dietary !== undefined && { dietary }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })
    res.json(ok(item))
  } catch (err) { next(err) }
})

// DELETE /providers/services/:serviceId/menu-items/:itemId
router.delete('/menu-items/:serviceId/:itemId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId, itemId } = req.params as { serviceId: string; itemId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    await prisma.menuItem.delete({ where: { id: itemId } })
    res.json(ok({ id: itemId, deleted: true }))
  } catch (err) { next(err) }
})

// ─── Vehicles ─────────────────────────────────────────────────────────────────

// GET /providers/service-items/vehicles (auto-detect provider's transport service)
router.get('/vehicles', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    const service = await prisma.service.findFirst({
      where: { providerId: provider.id, type: 'TRANSPORT' },
    })
    if (!service) {
      return res.json(ok([]))
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { serviceId: service.id },
      orderBy: { createdAt: 'desc' },
    })
    res.json(ok(vehicles))
  } catch (err) { next(err) }
})

// POST /providers/service-items/vehicles (auto-detect provider's transport service)
router.post('/vehicles', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const service = await getProviderServiceByType(req.user!.userId, 'TRANSPORT')
    const { name, price, capacity, vehicleType, routes, features, imageUrl } = req.body
    if (!name || !price || !capacity || !vehicleType) {
      throw createError('name, price, capacity, and vehicleType required', 400, 'VALIDATION_ERROR')
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        serviceId: service.id,
        name,
        price: Number(price),
        capacity: Number(capacity),
        vehicleType,
        routes: routes || [],
        features: features || [],
        imageUrl,
      },
    })
    res.status(201).json(ok(vehicle))
  } catch (err) { next(err) }
})

// PATCH /providers/service-items/vehicles/:id
router.patch('/vehicles/:id', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const service = await getProviderServiceByType(req.user!.userId, 'TRANSPORT')
    const vehicle = await prisma.vehicle.findFirst({ where: { id, serviceId: service.id } })
    if (!vehicle) throw createError('Vehicle not found', 404, 'NOT_FOUND')

    const { name, price, capacity, vehicleType, routes, features, imageUrl, isActive } = req.body
    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: Number(price) }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(vehicleType !== undefined && { vehicleType }),
        ...(routes !== undefined && { routes }),
        ...(features !== undefined && { features }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })
    res.json(ok(updated))
  } catch (err) { next(err) }
})

// DELETE /providers/service-items/vehicles/:id
router.delete('/vehicles/:id', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const service = await getProviderServiceByType(req.user!.userId, 'TRANSPORT')
    const vehicle = await prisma.vehicle.findFirst({ where: { id, serviceId: service.id } })
    if (!vehicle) throw createError('Vehicle not found', 404, 'NOT_FOUND')

    await prisma.vehicle.delete({ where: { id } })
    res.json(ok({ id, deleted: true }))
  } catch (err) { next(err) }
})

// GET /providers/services/:serviceId/vehicles
router.get('/vehicles/:serviceId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId } = req.params as { serviceId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    const vehicles = await prisma.vehicle.findMany({
      where: { serviceId },
      orderBy: { createdAt: 'desc' },
    })
    res.json(ok(vehicles))
  } catch (err) { next(err) }
})

// POST /providers/services/:serviceId/vehicles
router.post('/vehicles/:serviceId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId } = req.params as { serviceId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    const { name, price, capacity, vehicleType, routes, features, imageUrl } = req.body
    if (!name || !price || !capacity || !vehicleType) {
      throw createError('name, price, capacity, and vehicleType required', 400, 'VALIDATION_ERROR')
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        serviceId,
        name,
        price: Number(price),
        capacity: Number(capacity),
        vehicleType,
        routes: routes || [],
        features: features || [],
        imageUrl,
      },
    })
    res.status(201).json(ok(vehicle))
  } catch (err) { next(err) }
})

// PATCH /providers/services/:serviceId/vehicles/:vehicleId
router.patch('/vehicles/:serviceId/:vehicleId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId, vehicleId } = req.params as { serviceId: string; vehicleId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    const { name, price, capacity, vehicleType, routes, features, imageUrl, isActive } = req.body
    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: Number(price) }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(vehicleType !== undefined && { vehicleType }),
        ...(routes !== undefined && { routes }),
        ...(features !== undefined && { features }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })
    res.json(ok(vehicle))
  } catch (err) { next(err) }
})

// DELETE /providers/services/:serviceId/vehicles/:vehicleId
router.delete('/vehicles/:serviceId/:vehicleId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId, vehicleId } = req.params as { serviceId: string; vehicleId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    await prisma.vehicle.delete({ where: { id: vehicleId } })
    res.json(ok({ id: vehicleId, deleted: true }))
  } catch (err) { next(err) }
})

// ─── Tours ────────────────────────────────────────────────────────────────────

// GET /providers/service-items/tours (auto-detect provider's guide service)
router.get('/tours', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    const service = await prisma.service.findFirst({
      where: { providerId: provider.id, type: 'GUIDE' },
    })
    if (!service) {
      return res.json(ok([]))
    }

    const tours = await prisma.tour.findMany({
      where: { serviceId: service.id },
      orderBy: { createdAt: 'desc' },
    })
    res.json(ok(tours))
  } catch (err) { next(err) }
})

// POST /providers/service-items/tours (auto-detect provider's guide service)
router.post('/tours', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const service = await getProviderServiceByType(req.user!.userId, 'GUIDE')
    const { name, price, duration, groupSize, languages, difficulty, description, imageUrl } = req.body
    if (!name || !price || !duration || !groupSize) {
      throw createError('name, price, duration, and groupSize required', 400, 'VALIDATION_ERROR')
    }

    const tour = await prisma.tour.create({
      data: {
        serviceId: service.id,
        name,
        price: Number(price),
        duration,
        groupSize: Number(groupSize),
        languages: languages || [],
        difficulty,
        description,
        imageUrl,
      },
    })
    res.status(201).json(ok(tour))
  } catch (err) { next(err) }
})

// PATCH /providers/service-items/tours/:id
router.patch('/tours/:id', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const service = await getProviderServiceByType(req.user!.userId, 'GUIDE')
    const tour = await prisma.tour.findFirst({ where: { id, serviceId: service.id } })
    if (!tour) throw createError('Tour not found', 404, 'NOT_FOUND')

    const { name, price, duration, groupSize, languages, difficulty, description, imageUrl, isActive } = req.body
    const updated = await prisma.tour.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: Number(price) }),
        ...(duration !== undefined && { duration }),
        ...(groupSize !== undefined && { groupSize: Number(groupSize) }),
        ...(languages !== undefined && { languages }),
        ...(difficulty !== undefined && { difficulty }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })
    res.json(ok(updated))
  } catch (err) { next(err) }
})

// DELETE /providers/service-items/tours/:id
router.delete('/tours/:id', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const service = await getProviderServiceByType(req.user!.userId, 'GUIDE')
    const tour = await prisma.tour.findFirst({ where: { id, serviceId: service.id } })
    if (!tour) throw createError('Tour not found', 404, 'NOT_FOUND')

    await prisma.tour.delete({ where: { id } })
    res.json(ok({ id, deleted: true }))
  } catch (err) { next(err) }
})

// GET /providers/services/:serviceId/tours
router.get('/tours/:serviceId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId } = req.params as { serviceId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    const tours = await prisma.tour.findMany({
      where: { serviceId },
      orderBy: { createdAt: 'desc' },
    })
    res.json(ok(tours))
  } catch (err) { next(err) }
})

// POST /providers/services/:serviceId/tours
router.post('/tours/:serviceId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId } = req.params as { serviceId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    const { name, price, duration, groupSize, languages, difficulty, description, imageUrl } = req.body
    if (!name || !price || !duration || !groupSize) {
      throw createError('name, price, duration, and groupSize required', 400, 'VALIDATION_ERROR')
    }

    const tour = await prisma.tour.create({
      data: {
        serviceId,
        name,
        price: Number(price),
        duration,
        groupSize: Number(groupSize),
        languages: languages || [],
        difficulty,
        description,
        imageUrl,
      },
    })
    res.status(201).json(ok(tour))
  } catch (err) { next(err) }
})

// PATCH /providers/services/:serviceId/tours/:tourId
router.patch('/tours/:serviceId/:tourId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId, tourId } = req.params as { serviceId: string; tourId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    const { name, price, duration, groupSize, languages, difficulty, description, imageUrl, isActive } = req.body
    const tour = await prisma.tour.update({
      where: { id: tourId },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: Number(price) }),
        ...(duration !== undefined && { duration }),
        ...(groupSize !== undefined && { groupSize: Number(groupSize) }),
        ...(languages !== undefined && { languages }),
        ...(difficulty !== undefined && { difficulty }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })
    res.json(ok(tour))
  } catch (err) { next(err) }
})

// DELETE /providers/services/:serviceId/tours/:tourId
router.delete('/tours/:serviceId/:tourId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId, tourId } = req.params as { serviceId: string; tourId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    await prisma.tour.delete({ where: { id: tourId } })
    res.json(ok({ id: tourId, deleted: true }))
  } catch (err) { next(err) }
})

// ─── Event Spaces ───────────────────────────────────────────────────────────────

// GET /providers/service-items/event-spaces (auto-detect provider's events service)
router.get('/event-spaces', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    const service = await prisma.service.findFirst({
      where: { providerId: provider.id, type: 'EVENTS' },
    })
    if (!service) {
      return res.json(ok([]))
    }

    const spaces = await prisma.eventSpace.findMany({
      where: { serviceId: service.id },
      orderBy: { createdAt: 'desc' },
    })
    res.json(ok(spaces))
  } catch (err) { next(err) }
})

// POST /providers/service-items/event-spaces (auto-detect provider's events service)
router.post('/event-spaces', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const service = await getProviderServiceByType(req.user!.userId, 'EVENTS')
    const { name, price, capacity, eventType, equipment, description, imageUrl } = req.body
    if (!name || !price || !capacity || !eventType) {
      throw createError('name, price, capacity, and eventType required', 400, 'VALIDATION_ERROR')
    }

    const space = await prisma.eventSpace.create({
      data: {
        serviceId: service.id,
        name,
        price: Number(price),
        capacity: Number(capacity),
        eventType,
        equipment: equipment || [],
        description,
        imageUrl,
      },
    })
    res.status(201).json(ok(space))
  } catch (err) { next(err) }
})

// PATCH /providers/service-items/event-spaces/:id
router.patch('/event-spaces/:id', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const service = await getProviderServiceByType(req.user!.userId, 'EVENTS')
    const space = await prisma.eventSpace.findFirst({ where: { id, serviceId: service.id } })
    if (!space) throw createError('Event space not found', 404, 'NOT_FOUND')

    const { name, price, capacity, eventType, equipment, description, imageUrl, isActive } = req.body
    const updated = await prisma.eventSpace.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: Number(price) }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(eventType !== undefined && { eventType }),
        ...(equipment !== undefined && { equipment }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })
    res.json(ok(updated))
  } catch (err) { next(err) }
})

// DELETE /providers/service-items/event-spaces/:id
router.delete('/event-spaces/:id', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const service = await getProviderServiceByType(req.user!.userId, 'EVENTS')
    const space = await prisma.eventSpace.findFirst({ where: { id, serviceId: service.id } })
    if (!space) throw createError('Event space not found', 404, 'NOT_FOUND')

    await prisma.eventSpace.delete({ where: { id } })
    res.json(ok({ id, deleted: true }))
  } catch (err) { next(err) }
})

// GET /providers/services/:serviceId/event-spaces
router.get('/event-spaces/:serviceId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId } = req.params as { serviceId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    const spaces = await prisma.eventSpace.findMany({
      where: { serviceId },
      orderBy: { createdAt: 'desc' },
    })
    res.json(ok(spaces))
  } catch (err) { next(err) }
})

// POST /providers/services/:serviceId/event-spaces
router.post('/event-spaces/:serviceId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId } = req.params as { serviceId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    const { name, price, capacity, eventType, equipment, description, imageUrl } = req.body
    if (!name || !price || !capacity || !eventType) {
      throw createError('name, price, capacity, and eventType required', 400, 'VALIDATION_ERROR')
    }

    const space = await prisma.eventSpace.create({
      data: {
        serviceId,
        name,
        price: Number(price),
        capacity: Number(capacity),
        eventType,
        equipment: equipment || [],
        description,
        imageUrl,
      },
    })
    res.status(201).json(ok(space))
  } catch (err) { next(err) }
})

// PATCH /providers/services/:serviceId/event-spaces/:spaceId
router.patch('/event-spaces/:serviceId/:spaceId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId, spaceId } = req.params as { serviceId: string; spaceId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    const { name, price, capacity, eventType, equipment, description, imageUrl, isActive } = req.body
    const space = await prisma.eventSpace.update({
      where: { id: spaceId },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: Number(price) }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(eventType !== undefined && { eventType }),
        ...(equipment !== undefined && { equipment }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })
    res.json(ok(space))
  } catch (err) { next(err) }
})

// DELETE /providers/services/:serviceId/event-spaces/:spaceId
router.delete('/event-spaces/:serviceId/:spaceId', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { serviceId, spaceId } = req.params as { serviceId: string; spaceId: string }
    await verifyServiceOwnership(serviceId, req.user!.userId)

    await prisma.eventSpace.delete({ where: { id: spaceId } })
    res.json(ok({ id: spaceId, deleted: true }))
  } catch (err) { next(err) }
})

export default router

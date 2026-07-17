import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { createError } from '../middleware/error.js'
import { ok, getPagination, paginated } from '../types.js'

const router = Router()

// GET /hotels/:serviceId/rooms — public endpoint for hotel rooms
router.get('/hotels/:serviceId/rooms', async (req: Request, res: Response, next) => {
  try {
    const { serviceId } = req.params as { serviceId: string }
    const service = await prisma.service.findFirst({
      where: { id: serviceId, type: 'HOTEL', isActive: true },
    })
    if (!service) throw createError('Hotel not found', 404, 'NOT_FOUND')

    const rooms = await prisma.hotelRoom.findMany({
      where: { serviceId, isActive: true },
      orderBy: { price: 'asc' },
    })
    res.json(ok(rooms))
  } catch (err) { next(err) }
})

// GET /restaurants/:serviceId/menu-items — public endpoint for menu items
router.get('/restaurants/:serviceId/menu-items', async (req: Request, res: Response, next) => {
  try {
    const { serviceId } = req.params as { serviceId: string }
    const service = await prisma.service.findFirst({
      where: { id: serviceId, type: 'RESTAURANT', isActive: true },
    })
    if (!service) throw createError('Restaurant not found', 404, 'NOT_FOUND')

    const items = await prisma.menuItem.findMany({
      where: { serviceId, isActive: true },
      orderBy: { price: 'asc' },
    })
    res.json(ok(items))
  } catch (err) { next(err) }
})

// GET /transfers/:serviceId/vehicles — public endpoint for vehicles
router.get('/transfers/:serviceId/vehicles', async (req: Request, res: Response, next) => {
  try {
    const { serviceId } = req.params as { serviceId: string }
    const service = await prisma.service.findFirst({
      where: { id: serviceId, type: 'TRANSPORT', isActive: true },
    })
    if (!service) throw createError('Transport service not found', 404, 'NOT_FOUND')

    const vehicles = await prisma.vehicle.findMany({
      where: { serviceId, isActive: true },
      orderBy: { price: 'asc' },
    })
    res.json(ok(vehicles))
  } catch (err) { next(err) }
})

// GET /guides/:serviceId/tours — public endpoint for tours
router.get('/guides/:serviceId/tours', async (req: Request, res: Response, next) => {
  try {
    const { serviceId } = req.params as { serviceId: string }
    const service = await prisma.service.findFirst({
      where: { id: serviceId, type: 'GUIDE', isActive: true },
    })
    if (!service) throw createError('Guide service not found', 404, 'NOT_FOUND')

    const tours = await prisma.tour.findMany({
      where: { serviceId, isActive: true },
      orderBy: { price: 'asc' },
    })
    res.json(ok(tours))
  } catch (err) { next(err) }
})

// GET /events/:serviceId/spaces — public endpoint for event spaces
router.get('/events/:serviceId/spaces', async (req: Request, res: Response, next) => {
  try {
    const { serviceId } = req.params as { serviceId: string }
    const service = await prisma.service.findFirst({
      where: { id: serviceId, type: 'EVENTS', isActive: true },
    })
    if (!service) throw createError('Event service not found', 404, 'NOT_FOUND')

    const spaces = await prisma.eventSpace.findMany({
      where: { serviceId, isActive: true },
      orderBy: { price: 'asc' },
    })
    res.json(ok(spaces))
  } catch (err) { next(err) }
})

export default router

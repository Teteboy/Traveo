import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok, getPagination, paginated } from '../types.js'

const router = Router()

// GET /destinations
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const search = req.query.search as string | undefined
    const country = req.query.country as string | undefined

    const where = {
      isActive: true,
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
      ...(country && { country: { equals: country, mode: 'insensitive' as const } }),
    }

    const [total, items] = await Promise.all([
      prisma.destination.count({ where }),
      prisma.destination.findMany({ where, skip, take: limit, orderBy: { popularityScore: 'desc' } }),
    ])
    res.json(paginated(items, total, page, limit))
  } catch (err) { next(err) }
})

// GET /destinations/:id
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const dest = await prisma.destination.findUnique({ where: { id } })
    if (!dest) throw createError('Destination not found', 404, 'NOT_FOUND')
    res.json(ok(dest))
  } catch (err) { next(err) }
})

// POST /destinations — admin only
router.post('/', authenticate, requireRole('ADMIN'), async (req: Request, res: Response, next) => {
  try {
    const { name, country, imageUrl, description, popularityScore } = req.body
    const dest = await prisma.destination.create({ data: { name, country, imageUrl, description, popularityScore: popularityScore ?? 0 } })
    res.status(201).json(ok(dest))
  } catch (err) { next(err) }
})

export default router

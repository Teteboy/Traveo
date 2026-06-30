import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { createError } from '../middleware/error.js'
import { ok, getPagination, paginated } from '../types.js'

const router = Router()

// GET /promotions — public promotions endpoint (active only)
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const now = new Date()

    const [total, items] = await Promise.all([
      prisma.promotion.count({
        where: {
          status: 'ACTIVE',
          OR: [
            { startDate: { lte: now }, endDate: { gte: now } },
            { startDate: { lte: now }, endDate: null },
          ],
        },
      }),
      prisma.promotion.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { startDate: { lte: now }, endDate: { gte: now } },
            { startDate: { lte: now }, endDate: null },
          ],
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const mapped = items.map(i => ({ ...i, status: i.status.toLowerCase(), discountType: i.discountType.toLowerCase() }))
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

export default router

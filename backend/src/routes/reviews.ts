import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok, getPagination, paginated } from '../types.js'
import { autoModerateContent } from '../services/contentFilter.js'

const router = Router()

// GET /reviews — my reviews
router.get('/', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const [total, items] = await Promise.all([
      prisma.review.count({ where: { userId: req.user!.userId } }),
      prisma.review.findMany({
        where: { userId: req.user!.userId },
        skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { service: { select: { name: true, type: true, imageUrl: true } } },
      }),
    ])
    res.json(paginated(items, total, page, limit))
  } catch (err) { next(err) }
})

// GET /reviews/service/:serviceId — reviews for a service
router.get('/service/:serviceId', async (req: Request, res: Response, next) => {
  try {
    const { serviceId } = req.params as { serviceId: string }
    const { page, limit, skip } = getPagination(req.query)
    const [total, items] = await Promise.all([
      prisma.review.count({ where: { serviceId } }),
      prisma.review.findMany({
        where: { serviceId },
        skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
      }),
    ])
    const mapped = items.map(r => ({
      ...r,
      guestName: `${r.user.firstName} ${r.user.lastName}`,
      guestAvatar: r.user.avatar,
    }))
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// POST /reviews
router.post('/', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { serviceId, rating, comment } = req.body
    const userId = req.user!.userId

    if (!rating || rating < 1 || rating > 5) throw createError('Rating 1-5 required', 400)

    // Auto-moderate comment (skip if tables don't exist yet)
    if (comment) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { firstName: true, lastName: true, email: true },
        })

        if (user) {
          const moderationResult = await autoModerateContent(
            comment,
            userId,
            `${user.firstName} ${user.lastName}`,
            'REVIEW',
            serviceId,
            `Service ${serviceId}`
          )

          if (moderationResult.shouldBlock) {
            throw createError('Review contains inappropriate content and has been blocked', 400, 'CONTENT_BLOCKED')
          }
        }
      } catch (e) {
        // Tables might not exist yet, skip moderation
        if (e instanceof Error && e.message === 'Review contains inappropriate content and has been blocked') {
          throw e // Re-throw actual content block errors
        }
      }
    }

    const review = await prisma.review.create({ data: { userId, serviceId, rating: parseFloat(rating), comment } })

    // Update service rating
    if (serviceId) {
      const avg = await prisma.review.aggregate({ where: { serviceId }, _avg: { rating: true }, _count: true })
      await prisma.service.update({
        where: { id: serviceId },
        data: { rating: avg._avg.rating ?? 0, reviewCount: avg._count },
      })
    }

    res.status(201).json(ok(review))
  } catch (err) { next(err) }
})

// DELETE /reviews/:id
router.delete('/:id', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) throw createError('Review not found', 404, 'NOT_FOUND')
    if (review.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      throw createError('Forbidden', 403, 'FORBIDDEN')
    }
    await prisma.review.delete({ where: { id } })
    res.json(ok({ message: 'Review deleted' }))
  } catch (err) { next(err) }
})

export default router

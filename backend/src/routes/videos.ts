import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok, getPagination, paginated } from '../types.js'

const router = Router()

// GET /videos — public discover feed (with optional pagination)
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { country } = req.query as Record<string, string>

    const where = { isActive: true, ...(country && { country }) }

    const [total, items] = await Promise.all([
      prisma.video.count({ where }),
      prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: {
            select: { id: true, firstName: true, lastName: true, avatar: true, provider: { select: { companyName: true } } },
          },
        },
      }),
    ])

    const mapped = items.map(v => ({
      id: v.id,
      title: v.title,
      videoUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl,
      destination: v.destination ?? '',
      country: v.country ?? '',
      likes: v.likes,
      views: v.views,
      createdAt: v.createdAt,
      creator: v.uploadedBy ? {
        id: v.uploadedBy.id,
        name: v.uploadedBy.provider?.companyName || `${v.uploadedBy.firstName} ${v.uploadedBy.lastName}`,
        avatar: v.uploadedBy.avatar,
      } : undefined,
    }))

    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// GET /videos/me — videos uploaded by current user/provider
router.get('/me', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const userId = req.user!.userId

    const [total, items] = await Promise.all([
      prisma.video.count({ where: { userId, isActive: true } }),
      prisma.video.findMany({
        where: { userId, isActive: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    res.json(paginated(items, total, page, limit))
  } catch (err) { next(err) }
})

// POST /videos — upload a new video
router.post('/', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { title, videoUrl, thumbnailUrl, destination, country } = req.body
    if (!title || !videoUrl) {
      return next(createError('title and videoUrl are required', 400))
    }

    const video = await prisma.video.create({
      data: {
        title,
        videoUrl,
        thumbnailUrl,
        destination,
        country,
        userId: req.user!.userId,
        isActive: true,
      },
    })

    res.status(201).json(ok(video))
  } catch (err) { next(err) }
})

// DELETE /videos/:id — soft delete a video owned by current user
router.delete('/:id', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const existing = await prisma.video.findUnique({ where: { id } })
    if (!existing) return next(createError('Video not found', 404, 'NOT_FOUND'))
    if (existing.userId !== req.user!.userId) {
      return next(createError('Not authorized', 403, 'FORBIDDEN'))
    }

    await prisma.video.update({ where: { id }, data: { isActive: false } })
    res.json(ok({ deleted: true }))
  } catch (err) { next(err) }
})

export default router

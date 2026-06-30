import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok } from '../types.js'

const router = Router()

// All report routes require authentication
router.use(authenticate)

// POST /reports/content — report content for moderation
router.post('/content', async (req: Request, res: Response, next) => {
  try {
    const { targetType, targetId, targetName, reason, description } = req.body
    const userId = req.user!.userId

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    })

    if (!user) {
      throw createError('User not found', 404, 'NOT_FOUND')
    }

    // Check if already reported
    const existing = await prisma.moderationItem.findFirst({
      where: {
        targetType,
        targetId,
        authorId: userId,
        status: { in: ['PENDING', 'INVESTIGATING'] },
      },
    })

    if (existing) {
      // Increment report count
      await prisma.moderationItem.update({
        where: { id: existing.id },
        data: { reports: { increment: 1 } },
      })
      return res.json(ok({ message: 'Report count incremented', id: existing.id }))
    }

    // Create new moderation item
    const moderationItem = await prisma.moderationItem.create({
      data: {
        type: 'CONTENT',
        content: description || reason,
        authorId: userId,
        authorName: `${user.firstName} ${user.lastName}`,
        targetType,
        targetId,
        targetName,
        status: 'PENDING',
        priority: 'MEDIUM',
        reason,
        reports: 1,
      },
    })

    res.json(ok({ ...moderationItem, status: moderationItem.status.toLowerCase(), type: moderationItem.type.toLowerCase(), priority: moderationItem.priority.toLowerCase() }))
  } catch (err) { next(err) }
})

// POST /reports/user — report a user
router.post('/user', async (req: Request, res: Response, next) => {
  try {
    const { targetUserId, targetUserName, reason, description } = req.body
    const userId = req.user!.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    })

    if (!user) {
      throw createError('User not found', 404, 'NOT_FOUND')
    }

    const moderationItem = await prisma.moderationItem.create({
      data: {
        type: 'USER',
        content: description || reason,
        authorId: userId,
        authorName: `${user.firstName} ${user.lastName}`,
        targetType: 'USER',
        targetId: targetUserId,
        targetName: targetUserName,
        status: 'PENDING',
        priority: 'HIGH',
        reason,
        reports: 1,
      },
    })

    res.json(ok({ ...moderationItem, status: moderationItem.status.toLowerCase(), type: moderationItem.type.toLowerCase(), priority: moderationItem.priority.toLowerCase() }))
  } catch (err) { next(err) }
})

// POST /reports/review — report a review
router.post('/review', async (req: Request, res: Response, next) => {
  try {
    const { reviewId, reviewContent, reason } = req.body
    const userId = req.user!.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    })

    if (!user) {
      throw createError('User not found', 404, 'NOT_FOUND')
    }

    const moderationItem = await prisma.moderationItem.create({
      data: {
        type: 'REVIEW',
        content: reviewContent,
        authorId: userId,
        authorName: `${user.firstName} ${user.lastName}`,
        targetType: 'REVIEW',
        targetId: reviewId,
        targetName: `Review #${reviewId}`,
        status: 'PENDING',
        priority: 'MEDIUM',
        reason,
        reports: 1,
      },
    })

    res.json(ok({ ...moderationItem, status: moderationItem.status.toLowerCase(), type: moderationItem.type.toLowerCase(), priority: moderationItem.priority.toLowerCase() }))
  } catch (err) { next(err) }
})

// POST /reports/provider — report a provider
router.post('/provider', async (req: Request, res: Response, next) => {
  try {
    const { providerId, providerName, reason, description } = req.body
    const userId = req.user!.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    })

    if (!user) {
      throw createError('User not found', 404, 'NOT_FOUND')
    }

    const moderationItem = await prisma.moderationItem.create({
      data: {
        type: 'PROVIDER',
        content: description || reason,
        authorId: userId,
        authorName: `${user.firstName} ${user.lastName}`,
        targetType: 'PROVIDER',
        targetId: providerId,
        targetName: providerName,
        status: 'PENDING',
        priority: 'HIGH',
        reason,
        reports: 1,
      },
    })

    res.json(ok({ ...moderationItem, status: moderationItem.status.toLowerCase(), type: moderationItem.type.toLowerCase(), priority: moderationItem.priority.toLowerCase() }))
  } catch (err) { next(err) }
})

// GET /reports/my-reports — get user's own reports
router.get('/my-reports', async (req: Request, res: Response, next) => {
  try {
    const userId = req.user!.userId

    const reports = await prisma.moderationItem.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
    })

    const mapped = reports.map(r => ({
      ...r,
      status: r.status.toLowerCase(),
      type: r.type.toLowerCase(),
      priority: r.priority.toLowerCase(),
    }))

    res.json(ok(mapped))
  } catch (err) { next(err) }
})

export default router

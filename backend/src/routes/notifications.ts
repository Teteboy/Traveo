import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok, getPagination, paginated } from '../types.js'

const router = Router()

// GET /notifications
router.get('/', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { type, read } = req.query as Record<string, string>

    const where = {
      userId: req.user!.userId,
      ...(type && { type }),
      ...(read !== undefined && { read: read === 'true' }),
    }

    const [total, items] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    ])
    res.json(paginated(items, total, page, limit))
  } catch (err) { next(err) }
})

// PATCH /notifications/:id/read
router.patch('/:id/read', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const notif = await prisma.notification.findUnique({ where: { id } })
    if (!notif) throw createError('Notification not found', 404, 'NOT_FOUND')
    if (notif.userId !== req.user!.userId) throw createError('Forbidden', 403, 'FORBIDDEN')
    const updated = await prisma.notification.update({ where: { id }, data: { read: true } })
    res.json(ok(updated))
  } catch (err) { next(err) }
})

// PATCH /notifications/read-all
router.patch('/read-all', authenticate, async (req: Request, res: Response, next) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user!.userId, read: false }, data: { read: true } })
    res.json(ok({ message: 'All notifications marked as read' }))
  } catch (err) { next(err) }
})

// DELETE /notifications/:id
router.delete('/:id', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const notif = await prisma.notification.findUnique({ where: { id } })
    if (!notif) throw createError('Not found', 404, 'NOT_FOUND')
    if (notif.userId !== req.user!.userId) throw createError('Forbidden', 403, 'FORBIDDEN')
    await prisma.notification.delete({ where: { id } })
    res.json(ok({ message: 'Notification deleted' }))
  } catch (err) { next(err) }
})

export default router

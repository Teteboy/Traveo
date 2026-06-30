import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok } from '../types.js'

const router = Router()

// All legal routes require authentication
router.use(authenticate)

// POST /legal/gdpr-request — submit GDPR request
router.post('/gdpr-request', async (req: Request, res: Response, next) => {
  try {
    const { requestType, description } = req.body // requestType: 'data_deletion' | 'data_export' | 'access_request'
    const userId = req.user!.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    })

    if (!user) {
      throw createError('User not found', 404, 'NOT_FOUND')
    }

    // Create legal case
    const legalCase = await prisma.legalCase.create({
      data: {
        type: 'GDPR',
        title: `GDPR ${requestType.replace('_', ' ').toUpperCase()} Request`,
        userId,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        status: 'PENDING',
        priority: 'HIGH',
        description: `${requestType}: ${description}`,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    })

    res.json(ok({ ...legalCase, status: legalCase.status.toLowerCase(), type: legalCase.type.toLowerCase(), priority: legalCase.priority.toLowerCase() }))
  } catch (err) { next(err) }
})

// POST /legal/refund-dispute — submit refund dispute
router.post('/refund-dispute', async (req: Request, res: Response, next) => {
  try {
    const { bookingId, reason, amount } = req.body
    const userId = req.user!.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    })

    if (!user) {
      throw createError('User not found', 404, 'NOT_FOUND')
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    })

    if (!booking) {
      throw createError('Booking not found', 404, 'NOT_FOUND')
    }

    if (booking.userId !== userId) {
      throw createError('Unauthorized', 403, 'FORBIDDEN')
    }

    // Create legal case
    const legalCase = await prisma.legalCase.create({
      data: {
        type: 'REFUND_DISPUTE',
        title: `Refund Dispute - Booking ${bookingId}`,
        userId,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        status: 'PENDING',
        priority: 'MEDIUM',
        description: reason,
        amount: amount || booking.totalAmount,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
    })

    // Also create refund request if it doesn't exist
    const existingRefund = await prisma.refundRequest.findFirst({
      where: { bookingId },
    })

    if (!existingRefund) {
      await prisma.refundRequest.create({
        data: {
          bookingId,
          amount: amount || booking.totalAmount,
          reason,
          status: 'PENDING',
        },
      })
    }

    res.json(ok({ ...legalCase, status: legalCase.status.toLowerCase(), type: legalCase.type.toLowerCase(), priority: legalCase.priority.toLowerCase() }))
  } catch (err) { next(err) }
})

// POST /legal/terms-violation — report terms violation
router.post('/terms-violation', async (req: Request, res: Response, next) => {
  try {
    const { targetType, targetId, targetName, description } = req.body
    const userId = req.user!.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    })

    if (!user) {
      throw createError('User not found', 404, 'NOT_FOUND')
    }

    const legalCase = await prisma.legalCase.create({
      data: {
        type: 'TERMS_VIOLATION',
        title: `Terms Violation Report - ${targetName}`,
        userId,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        status: 'PENDING',
        priority: 'HIGH',
        description: `Target: ${targetType} (${targetId})\n${description}`,
      },
    })

    res.json(ok({ ...legalCase, status: legalCase.status.toLowerCase(), type: legalCase.type.toLowerCase(), priority: legalCase.priority.toLowerCase() }))
  } catch (err) { next(err) }
})

// GET /legal/my-cases — get user's legal cases
router.get('/my-cases', async (req: Request, res: Response, next) => {
  try {
    const userId = req.user!.userId

    const cases = await prisma.legalCase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    const mapped = cases.map(c => ({
      ...c,
      status: c.status.toLowerCase(),
      type: c.type.toLowerCase(),
      priority: c.priority.toLowerCase(),
    }))

    res.json(ok(mapped))
  } catch (err) { next(err) }
})

export default router

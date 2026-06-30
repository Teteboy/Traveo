import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok, getPagination, paginated } from '../types.js'

const router = Router()

// GET /providers/payouts — list payout requests
router.get('/', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    const { status } = req.query as Record<string, string>
    const where = { providerId: provider.id, ...(status && { status: status.toUpperCase() as any }) }

    const [total, items] = await Promise.all([
      prisma.payoutRequest.count({ where }),
      prisma.payoutRequest.findMany({
        where, skip, take: limit, orderBy: { requestedAt: 'desc' },
      }),
    ])

    res.json(paginated(items, total, page, limit))
  } catch (err) { next(err) }
})

// POST /providers/payouts/request — create payout request
router.post('/request', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { amount, bankDetails } = req.body
    if (!amount || !bankDetails) throw createError('amount and bankDetails required', 400, 'VALIDATION_ERROR')

    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    // Check if provider has sufficient balance (simplified - in real app, calculate from confirmed bookings)
    const revenue = await prisma.booking.aggregate({
      where: { providerId: provider.id, status: { in: ['CONFIRMED', 'COMPLETED', 'CHECKED_IN', 'CHECKED_OUT'] } },
      _sum: { totalAmount: true },
    })
    const totalRevenue = revenue._sum.totalAmount ?? 0
    const commission = totalRevenue * 0.1
    const netRevenue = totalRevenue - commission

    // Check pending payouts
    const pendingPayouts = await prisma.payoutRequest.aggregate({
      where: { providerId: provider.id, status: { in: ['PENDING', 'PROCESSING'] } },
      _sum: { amount: true },
    })
    const pendingAmount = pendingPayouts._sum.amount ?? 0
    const availableBalance = netRevenue - pendingAmount

    if (amount > availableBalance) {
      throw createError(`Insufficient balance. Available: ${availableBalance.toFixed(2)} XAF`, 400, 'INSUFFICIENT_BALANCE')
    }

    const payout = await prisma.payoutRequest.create({
      data: {
        providerId: provider.id,
        amount: Number(amount),
        currency: 'XAF',
        bankDetails,
        status: 'PENDING',
      },
    })

    res.status(201).json(ok(payout))
  } catch (err) { next(err) }
})

// GET /providers/payouts/:id — get single payout request
router.get('/:id', authenticate, requireRole('PROVIDER'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const provider = await prisma.provider.findUnique({ where: { userId: req.user!.userId } })
    if (!provider) throw createError('Provider not found', 404, 'NOT_FOUND')

    const payout = await prisma.payoutRequest.findFirst({
      where: { id, providerId: provider.id },
    })
    if (!payout) throw createError('Payout request not found', 404, 'NOT_FOUND')

    res.json(ok(payout))
  } catch (err) { next(err) }
})

export default router

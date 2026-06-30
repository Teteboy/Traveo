import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../db/prisma.js'
import { config } from '../config/index.js'
import { authenticate, AuthPayload } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok } from '../types.js'

const router = Router()

function generateTokens(payload: AuthPayload) {
  const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as string,
  } as jwt.SignOptions)
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as string,
  } as jwt.SignOptions)
  return { accessToken, refreshToken }
}

// POST /auth/register
router.post('/register', async (req: Request, res: Response, next) => {
  try {
    const { email, password, firstName, lastName, phone, country } = req.body
    if (!email || !password || !firstName || !lastName) {
      throw createError('email, password, firstName, lastName are required', 400)
    }
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) throw createError('Email already registered', 409, 'EMAIL_TAKEN')

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, password: hashed, firstName, lastName, phone, country: country ?? 'CM' },
    })

    // TODO: Create wallet via payment service
    // For now, assume wallet is created separately or in shared DB

    const payload: AuthPayload = { userId: user.id, role: user.role, email: user.email }
    const { accessToken, refreshToken } = generateTokens(payload)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } })

    const { password: _, ...userOut } = user
    res.status(201).json(ok({ user: { ...userOut, fullName: `${user.firstName} ${user.lastName}`, role: user.role.toLowerCase() }, tokens: { accessToken, refreshToken } }))
  } catch (err) { next(err) }
})

// POST /auth/login
router.post('/login', async (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) throw createError('email and password required', 400)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS')

    const payload: AuthPayload = { userId: user.id, role: user.role, email: user.email }
    const { accessToken, refreshToken } = generateTokens(payload)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } })

    const { password: _, ...userOut } = user
    res.json(ok({ user: { ...userOut, fullName: `${user.firstName} ${user.lastName}`, role: user.role.toLowerCase() }, tokens: { accessToken, refreshToken } }))
  } catch (err) { next(err) }
})

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) throw createError('refreshToken required', 400)

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } })
    if (!stored || stored.expiresAt < new Date()) {
      throw createError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN')
    }

    try {
      jwt.verify(refreshToken, config.jwt.refreshSecret)
    } catch {
      await prisma.refreshToken.delete({ where: { id: stored.id } })
      throw createError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN')
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } })

    const payload: AuthPayload = { userId: stored.user.id, role: stored.user.role, email: stored.user.email }
    const tokens = generateTokens(payload)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: stored.user.id, expiresAt } })

    res.json(ok(tokens))
  } catch (err) { next(err) }
})

// POST /auth/logout
router.post('/logout', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { refreshToken } = req.body
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    }
    res.json(ok({ message: 'Logged out successfully' }))
  } catch (err) { next(err) }
})

// GET /auth/me
router.get('/me', authenticate, async (req: Request, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true, country: true, role: true, createdAt: true } })
    if (!user) throw createError('User not found', 404, 'NOT_FOUND')
    res.json(ok({ user: { ...user, fullName: `${user.firstName} ${user.lastName}`, role: user.role.toLowerCase() } }))
  } catch (err) { next(err) }
})

// PATCH /auth/me  — update profile
router.patch('/me', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { firstName, lastName, phone, avatar, country } = req.body
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { ...(firstName && { firstName }), ...(lastName && { lastName }), ...(phone !== undefined && { phone }), ...(avatar !== undefined && { avatar }), ...(country && { country }) },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true, country: true, role: true, createdAt: true },
    })
    res.json(ok({ user: { ...user, fullName: `${user.firstName} ${user.lastName}`, role: user.role.toLowerCase() } }))
  } catch (err) { next(err) }
})

export default router
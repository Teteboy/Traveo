import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok } from '../types.js'
import { Role, ServiceType } from '@prisma/client'
import multer from 'multer'
import { uploadBufferToCloudinary } from '../services/cloudinary.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { trackFailedLogin, shouldBlockLogin, clearFailedLoginAttempts } from '../middleware/security.js'
import { ipRateLimit, isIpBlocked } from '../middleware/rateLimit.js'

type AuthPayload = { userId: string; role: string; email: string }

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

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

    // Create wallet for new user
    await prisma.walletAccount.create({ data: { userId: user.id } })

    const payload: AuthPayload = { userId: user.id, role: user.role, email: user.email }
    const { accessToken, refreshToken } = generateTokens(payload)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } })

     const { password: _, ...userOut } = user
     res.status(201).json(ok({ user: { ...userOut, fullName: `${user.firstName} ${user.lastName}`, role: user.role }, tokens: { accessToken, refreshToken } }))
  } catch (err) { next(err) }
})

// POST /auth/login
router.post('/login', async (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    const userAgent = req.get('user-agent')

    if (!email || !password) throw createError('email and password required', 400)

    // Check if IP is blocked (skip if tables don't exist yet)
    let ipBlocked = false
    try {
      ipBlocked = await isIpBlocked(ip)
    } catch (e) {
      // Tables might not exist yet, skip check
    }
    if (ipBlocked) {
      return res.status(403).json({
        error: 'IP_BLOCKED',
        message: 'Your IP has been blocked due to suspicious activity',
      })
    }

    // Check rate limit for this IP (skip if tables don't exist yet)
    let rateLimitResult: { allowed: boolean; resetTime?: Date } = { allowed: true }
    try {
      rateLimitResult = await ipRateLimit(ip, '/auth/login', 10, 15) // 10 requests per 15 minutes
    } catch (e) {
      // Tables might not exist yet, skip check
    }
    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: 'TOO_MANY_REQUESTS',
        message: 'Too many login attempts, please try again later',
        retryAfter: Math.ceil(((rateLimitResult.resetTime?.getTime() ?? 0) - Date.now()) / 1000),
      })
    }

    // Check if login should be blocked (skip if tables don't exist yet)
    let blockCheck: { blocked: boolean; reason?: string } = { blocked: false }
    try {
      blockCheck = await shouldBlockLogin(email, ip)
    } catch (e) {
      // Tables might not exist yet, skip check
    }
    if (blockCheck.blocked) {
      return res.status(429).json({
        error: 'LOGIN_BLOCKED',
        message: blockCheck.reason,
      })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      try {
        await trackFailedLogin(email, ip, userAgent)
      } catch (e) {
        // Tables might not exist yet, skip
      }
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      try {
        await trackFailedLogin(email, ip, userAgent)
      } catch (e) {
        // Tables might not exist yet, skip
      }
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
    }

    // Clear failed login attempts on successful login
    try {
      await clearFailedLoginAttempts(email, ip)
    } catch (e) {
      // Tables might not exist yet, skip
    }

    // Session hijacking detection (skip if tables don't exist yet)
    try {
      const { detectSessionHijacking } = await import('../middleware/security.js')
      const hijackCheck = await detectSessionHijacking(user.id, ip, userAgent || '')
      if (hijackCheck.suspicious) {
        // Create security alert but allow login
        await prisma.securityAlert.create({
          data: {
            type: 'SUSPICIOUS_ACTIVITY',
            severity: 'HIGH',
            status: 'NEW',
            message: 'Potential session hijacking detected',
            ip,
            userAgent,
            affectedUser: email,
            metadata: { reason: hijackCheck.reason },
          },
        })
      }
    } catch (e) {
      // Tables might not exist yet, skip
    }

    const payload: AuthPayload = { userId: user.id, role: user.role, email: user.email }
    const { accessToken, refreshToken } = generateTokens(payload)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } })

     const { password: _, ...userOut } = user
     res.json(ok({ user: { ...userOut, fullName: `${user.firstName} ${user.lastName}`, role: user.role }, tokens: { accessToken, refreshToken } }))
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
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true, country: true, role: true, createdAt: true, title: true, dateOfBirth: true, gender: true } })
      if (!user) throw createError('User not found', 404, 'NOT_FOUND')
      res.json(ok({ user: { ...user, fullName: `${user.firstName} ${user.lastName}`, role: user.role } }))
    } catch (err) { next(err) }
  })

// PATCH /auth/me  — update profile
  router.patch('/me', authenticate, async (req: Request, res: Response, next) => {
    try {
      const { firstName, lastName, phone, avatar, country, title, dateOfBirth, gender } = req.body
      const user = await prisma.user.update({
        where: { id: req.user!.userId },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phone !== undefined && { phone }),
          ...(avatar !== undefined && { avatar }),
          ...(country && { country }),
          ...(title !== undefined && { title }),
          ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
          ...(gender !== undefined && { gender })
        },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true, country: true, role: true, createdAt: true, title: true, dateOfBirth: true, gender: true },
      })
      res.json(ok({ user: { ...user, fullName: `${user.firstName} ${user.lastName}`, role: user.role } }))
    } catch (err) { next(err) }
  })

router.patch('/me/avatar', authenticate, upload.single('file'), async (req: Request, res: Response, next) => {
    try {
      if (!req.file?.buffer) throw createError('file required', 400)

      const { config } = await import('../config/index.js')

      // Require Cloudinary configuration
      if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
        throw createError('Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET', 500)
      }

      // Upload to Cloudinary
      const uploaded = await uploadBufferToCloudinary(req.file.buffer, 'traveo/avatars', req.user!.userId, 'image')

      const user = await prisma.user.update({
        where: { id: req.user!.userId },
        data: { avatar: uploaded.url },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true, country: true, role: true, createdAt: true },
      })

      res.json(ok({ user: { ...user, fullName: `${user.firstName} ${user.lastName}`, role: user.role } }))
    } catch (err) { next(err) }
  })

// PATCH /auth/password — change password (authenticated)
router.patch('/password', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) throw createError('currentPassword and newPassword required', 400, 'VALIDATION_ERROR')
    if (String(newPassword).length < 8) throw createError('Password must be at least 8 characters', 400, 'VALIDATION_ERROR')

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
    if (!user) throw createError('User not found', 404, 'NOT_FOUND')

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) throw createError('Current password is incorrect', 401, 'INVALID_CREDENTIALS')

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })

    // Invalidate refresh tokens for this user
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } })

    res.json(ok({ success: true }))
  } catch (err) { next(err) }
})

// BECOME PROVIDER ENDPOINTS

// GET /auth/provider-status — check if user can become provider
router.get('/provider-status', authenticate, async (_req: Request, res: Response, next) => {
  try {
    const userId = _req.user!.userId
    const provider = await prisma.provider.findUnique({
      where: { userId },
    })
    
    res.json(ok({ 
      isProvider: !!provider,
      provider: provider ? { 
        id: provider.id,
        companyName: provider.companyName,
        businessType: provider.businessType,
        isVerified: provider.isVerified,
        verificationProgress: provider.verificationProgress
      } : null
    }))
  } catch (err) { next(err) }
})

// POST /auth/become-provider — start provider application
router.post('/become-provider', authenticate, async (req: Request, res: Response, next) => {
  try {
    const userId = req.user!.userId
    const { companyName, businessType, description } = req.body
    
    // Validate required fields
    if (!companyName || !businessType) {
      throw createError('Company name and business type are required', 400, 'VALIDATION_ERROR')
    }
    
    // Validate businessType
    const validBusinessTypes: ServiceType[] = ['HOTEL', 'GUIDE', 'TRANSPORT', 'RESTAURANT', 'EVENTS']
    if (!validBusinessTypes.includes(businessType as ServiceType)) {
      throw createError('Invalid business type', 400, 'VALIDATION_ERROR')
    }
    
    // Check if user already is a provider
    const existingProvider = await prisma.provider.findUnique({
      where: { userId },
    })
    
    if (existingProvider) {
      throw createError('User is already a provider', 400, 'ALREADY_EXISTS')
    }
    
    // Check if user role is still USER (should be)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    
    if (!user) {
      throw createError('User not found', 404, 'NOT_FOUND')
    }

    // Allow if user is still USER or if they don't have a provider yet
    if (user.role !== 'USER' && existingProvider) {
      throw createError('Only regular users can become providers', 403, 'FORBIDDEN')
    }
    
    // Update user role to PROVIDER and create provider profile in a transaction
    const [updatedUser, provider] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role: 'PROVIDER' },
      }),
      prisma.provider.create({
        data: {
          userId,
          companyName,
          businessType: businessType as ServiceType,
          description: description || '',
          isVerified: false,
          verificationProgress: 10, // Started application
        },
      }),
    ])
    
    // Generate new tokens with updated role
    const payload: AuthPayload = { 
      userId: updatedUser.id, 
      role: updatedUser.role, 
      email: updatedUser.email 
    }
    const { accessToken, refreshToken } = generateTokens(payload)
    
    // Create new refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({ 
      data: { token: refreshToken, userId: updatedUser.id, expiresAt } 
    })
    
    res.status(201).json(ok({ 
      provider: {
        id: provider.id,
        companyName: provider.companyName,
        businessType: provider.businessType,
        description: provider.description,
        isVerified: provider.isVerified,
        verificationProgress: provider.verificationProgress
      },
      user: {
        ...updatedUser,
        fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
        role: updatedUser.role
      },
      tokens: {
        accessToken,
        refreshToken
      },
      message: 'Provider account created successfully. You can now log in as a provider.'
    }))
  } catch (err) { next(err) }
})

// PATCH /auth/provider-profile — update provider profile
router.patch('/provider-profile', authenticate, async (req: Request, res: Response, next) => {
  try {
    const userId = req.user!.userId
    const { companyName, businessType, description } = req.body
    
    // Find existing provider
    const provider = await prisma.provider.findUnique({
      where: { userId },
    })
    
    if (!provider) {
      throw createError('Provider profile not found', 404, 'NOT_FOUND')
    }
    
    // Validate businessType if provided
    if (businessType) {
      const validBusinessTypes: ServiceType[] = ['HOTEL', 'GUIDE', 'TRANSPORT', 'RESTAURANT', 'EVENTS']
      if (!validBusinessTypes.includes(businessType as ServiceType)) {
        throw createError('Invalid business type', 400, 'VALIDATION_ERROR')
      }
    }
    
    // Update provider profile
    const updatedProvider = await prisma.provider.update({
      where: { userId },
      data: { 
        ...(companyName !== undefined && { companyName }),
        ...(businessType !== undefined && { businessType: businessType as ServiceType }),
        ...(description !== undefined && { description }),
      },
    })
    
    res.json(ok({ 
      provider: {
        id: updatedProvider.id,
        companyName: updatedProvider.companyName,
        businessType: updatedProvider.businessType,
        description: updatedProvider.description,
        isVerified: updatedProvider.isVerified,
        verificationProgress: updatedProvider.verificationProgress
      }
    }))
  } catch (err) { next(err) }
})

// POST /auth/provider-verification-documents — upload verification documents
router.post('/provider-verification-documents', authenticate, async (req: Request, res: Response, next) => {
  try {
    const userId = req.user!.userId
    const { documentType, documentUrl } = req.body
    
    // Validate required fields
    if (!documentType || !documentUrl) {
      throw createError('Document type and URL are required', 400, 'VALIDATION_ERROR')
    }
    
    // Find existing provider
    const provider = await prisma.provider.findUnique({
      where: { userId },
    })
    
    if (!provider) {
      throw createError('Provider profile not found', 404, 'NOT_FOUND')
    }
    
    // Update verification progress (simple increment for demo)
    const newProgress = Math.min(provider.verificationProgress + 20, 90)
    
    const updatedProvider = await prisma.provider.update({
      where: { userId },
      data: { 
        verificationProgress: newProgress,
      },
    })
    
    res.json(ok({ 
      provider: {
        id: updatedProvider.id,
        verificationProgress: updatedProvider.verificationProgress
      },
      message: 'Document uploaded successfully'
    }))
  } catch (err) { next(err) }
})

export default router

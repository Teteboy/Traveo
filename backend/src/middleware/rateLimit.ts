import { Request, Response, NextFunction } from 'express'
import { prisma } from '../db/prisma.js'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown'
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Clean up old entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < windowStart) {
        rateLimitStore.delete(k)
      }
    }

    const record = rateLimitStore.get(key)

    if (!record || record.resetTime < windowStart) {
      // New window
      rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
      return next()
    }

    if (record.count >= config.maxRequests) {
      // Rate limit exceeded
      const resetTime = record.resetTime
      const retryAfter = Math.ceil((resetTime - now) / 1000)

      res.setHeader('Retry-After', String(retryAfter))
      res.setHeader('X-RateLimit-Limit', String(config.maxRequests))
      res.setHeader('X-RateLimit-Remaining', '0')
      res.setHeader('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)))

      return res.status(429).json({
        error: 'TOO_MANY_REQUESTS',
        message: 'Too many requests, please try again later',
        retryAfter,
      })
    }

    // Increment counter
    record.count++
    rateLimitStore.set(key, record)

    res.setHeader('X-RateLimit-Limit', String(config.maxRequests))
    res.setHeader('X-RateLimit-Remaining', String(config.maxRequests - record.count))
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)))

    next()
  }
}

// IP-based rate limiter with database persistence
export async function ipRateLimit(
  ip: string,
  endpoint: string,
  maxRequests: number,
  windowMinutes: number = 15
): Promise<{ allowed: boolean; remaining: number; resetTime?: Date }> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000)

  // Clean up old records
  await prisma.rateLimitRecord.deleteMany({
    where: {
      createdAt: { lt: windowStart },
    },
  })

  // Count requests in window
  const count = await prisma.rateLimitRecord.count({
    where: {
      ip,
      endpoint,
      createdAt: { gte: windowStart },
    },
  })

  const allowed = count < maxRequests
  const remaining = Math.max(0, maxRequests - count)

  if (allowed) {
    // Record this request
    await prisma.rateLimitRecord.create({
      data: { ip, endpoint, createdAt: now },
    })
  }

  return { allowed, remaining, resetTime: windowStart }
}

// Check if IP is blocked due to abuse
export async function isIpBlocked(ip: string): Promise<boolean> {
  const blocked = await prisma.ipBlock.findFirst({
    where: {
      ip,
      OR: [
        { blockedUntil: null },
        { blockedUntil: { gt: new Date() } },
      ],
    },
  })

  return blocked !== null
}

// Block an IP temporarily or permanently
export async function blockIp(
  ip: string,
  reason: string,
  durationHours?: number
): Promise<void> {
  const blockedUntil = durationHours
    ? new Date(Date.now() + durationHours * 60 * 60 * 1000)
    : null

  await prisma.ipBlock.upsert({
    where: { ip },
    create: { ip, reason, blockedUntil },
    update: { reason, blockedUntil },
  })
}

// Unblock an IP
export async function unblockIp(ip: string): Promise<void> {
  await prisma.ipBlock.delete({
    where: { ip },
  })
}

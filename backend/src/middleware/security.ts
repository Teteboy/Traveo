import { Request, Response, NextFunction } from 'express'
import { prisma } from '../db/prisma.js'
import { blockIp, isIpBlocked } from './rateLimit.js'

// Track failed login attempts
export async function trackFailedLogin(email: string, ip: string, userAgent?: string): Promise<void> {
  await prisma.failedLoginAttempt.create({
    data: {
      email,
      ip,
      userAgent,
    },
  })

  // Check if we should block this IP
  const attempts = await prisma.failedLoginAttempt.count({
    where: {
      ip,
      createdAt: {
        gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
      },
    },
  })

  if (attempts >= 5) {
    // Block IP for 1 hour
    await blockIp(ip, 'Too many failed login attempts', 1)
    
    // Create security alert
    await prisma.securityAlert.create({
      data: {
        type: 'LOGIN_ATTEMPT',
        severity: 'HIGH',
        status: 'NEW',
        message: 'Multiple failed login attempts detected',
        ip,
        userAgent,
        affectedUser: email,
        affectedCount: attempts,
      },
    })
  }
}

// Check if login should be blocked
export async function shouldBlockLogin(email: string, ip: string): Promise<{ blocked: boolean; reason?: string }> {
  // Check if IP is blocked
  const ipBlocked = await isIpBlocked(ip)
  if (ipBlocked) {
    return { blocked: true, reason: 'IP is blocked due to suspicious activity' }
  }

  // Check for too many failed attempts from this email
  const emailAttempts = await prisma.failedLoginAttempt.count({
    where: {
      email,
      createdAt: {
        gte: new Date(Date.now() - 15 * 60 * 1000),
      },
    },
  })

  if (emailAttempts >= 10) {
    return { blocked: true, reason: 'Too many failed login attempts for this account' }
  }

  return { blocked: false }
}

// Clear failed login attempts on successful login
export async function clearFailedLoginAttempts(email: string, ip: string): Promise<void> {
  await prisma.failedLoginAttempt.deleteMany({
    where: {
      email,
      ip,
    },
  })
}

// Middleware to check for blocked IPs
export function checkBlockedIp() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    
    const blocked = await isIpBlocked(ip)
    if (blocked) {
      return res.status(403).json({
        error: 'IP_BLOCKED',
        message: 'Your IP has been blocked due to suspicious activity',
      })
    }

    next()
  }
}

// Session hijacking detection
export async function detectSessionHijacking(userId: string, currentIp: string, userAgent: string): Promise<{ suspicious: boolean; reason?: string }> {
  // Get recent login history for this user
  const recentLogins = await prisma.failedLoginAttempt.findMany({
    where: {
      email: userId, // Using email as userId for now
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
    take: 10,
  })

  // Check for IP changes
  const uniqueIps = new Set(recentLogins.map(l => l.ip))
  if (uniqueIps.size > 3) {
    return { suspicious: true, reason: 'Multiple IPs detected for this account' }
  }

  // Check for unusual user agent
  const uniqueUserAgents = new Set(recentLogins.map(l => l.userAgent).filter(Boolean))
  if (uniqueUserAgents.size > 2) {
    return { suspicious: true, reason: 'Multiple user agents detected' }
  }

  return { suspicious: false }
}

// API abuse detection
export async function detectApiAbuse(ip: string, endpoint: string): Promise<{ abusive: boolean; reason?: string }> {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  // Count requests in last hour
  const requestCount = await prisma.rateLimitRecord.count({
    where: {
      ip,
      endpoint,
      createdAt: {
        gte: oneHourAgo,
      },
    },
  })

  // If more than 1000 requests in an hour, flag as abuse
  if (requestCount > 1000) {
    await prisma.securityAlert.create({
      data: {
        type: 'API_ABUSE',
        severity: 'HIGH',
        status: 'NEW',
        message: 'Unusual API usage detected',
        ip,
        affectedCount: requestCount,
        metadata: { endpoint },
      },
    })

    return { abusive: true, reason: 'Excessive API requests' }
  }

  return { abusive: false }
}

// Data breach detection - check for unusual data access patterns
export async function detectDataBreach(userId: string, accessedData: string[]): Promise<{ suspicious: boolean; reason?: string }> {
  // This is a simplified version - in production, you'd use ML/anomaly detection
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { bookings: true },
  })

  if (!user) {
    return { suspicious: false }
  }

  // Check if user is accessing data they shouldn't
  // For example, accessing many different users' data
  if (accessedData.length > 50) {
    await prisma.securityAlert.create({
      data: {
        type: 'DATA_BREACH',
        severity: 'CRITICAL',
        status: 'NEW',
        message: 'Unusual data access pattern detected',
        affectedUser: userId,
        affectedCount: accessedData.length,
        metadata: { accessedData },
      },
    })

    return { suspicious: true, reason: 'Unusual data access pattern' }
  }

  return { suspicious: false }
}

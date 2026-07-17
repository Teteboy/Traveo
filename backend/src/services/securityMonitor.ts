import { prisma } from '../db/prisma.js'

// Security monitoring service for detecting suspicious activity
export class SecurityMonitor {
  // Monitor for unusual login patterns
  static async monitorLoginPatterns(): Promise<void> {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    // Find IPs with excessive failed login attempts
    const suspiciousIps = await prisma.failedLoginAttempt.groupBy({
      by: ['ip'],
      where: {
        createdAt: { gte: oneHourAgo },
      },
      having: {
        id: { _count: { gte: 10 } },
      },
    })

    for (const { ip } of suspiciousIps) {
      const count = await prisma.failedLoginAttempt.count({
        where: {
          ip,
          createdAt: { gte: oneHourAgo },
        },
      })

      // Check if alert already exists
      const existingAlert = await prisma.securityAlert.findFirst({
        where: {
          type: 'LOGIN_ATTEMPT',
          ip,
          status: { in: ['NEW', 'INVESTIGATING'] },
          createdAt: { gte: oneHourAgo },
        },
      })

      if (!existingAlert) {
        await prisma.securityAlert.create({
          data: {
            type: 'LOGIN_ATTEMPT',
            severity: 'HIGH',
            status: 'NEW',
            message: 'Excessive failed login attempts detected',
            ip,
            affectedCount: count,
          },
        })
      }
    }
  }

  // Monitor for API abuse
  static async monitorApiAbuse(): Promise<void> {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    // Find IPs with excessive API requests
    const abusiveIps = await prisma.rateLimitRecord.groupBy({
      by: ['ip', 'endpoint'],
      where: {
        createdAt: { gte: oneHourAgo },
      },
      having: {
        id: { _count: { gte: 1000 } },
      },
    })

    for (const { ip, endpoint } of abusiveIps) {
      const count = await prisma.rateLimitRecord.count({
        where: {
          ip,
          endpoint,
          createdAt: { gte: oneHourAgo },
        },
      })

      const existingAlert = await prisma.securityAlert.findFirst({
        where: {
          type: 'API_ABUSE',
          ip,
          status: { in: ['NEW', 'INVESTIGATING'] },
          createdAt: { gte: oneHourAgo },
        },
      })

      if (!existingAlert) {
        await prisma.securityAlert.create({
          data: {
            type: 'API_ABUSE',
            severity: 'HIGH',
            status: 'NEW',
            message: 'Excessive API usage detected',
            ip,
            affectedCount: count,
            metadata: { endpoint },
          },
        })
      }
    }
  }

  // Monitor for unusual data access patterns
  static async monitorDataAccess(): Promise<void> {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    // Find users accessing unusually large amounts of data
    const suspiciousUsers = await prisma.booking.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: oneHourAgo },
      },
      having: {
        id: { _count: { gte: 50 } },
      },
    })

    for (const { userId } of suspiciousUsers) {
      if (!userId) continue
      const count = await prisma.booking.count({
        where: {
          userId,
          createdAt: { gte: oneHourAgo },
        },
      })

      const existingAlert = await prisma.securityAlert.findFirst({
        where: {
          type: 'DATA_BREACH',
          affectedUser: userId,
          status: { in: ['NEW', 'INVESTIGATING'] },
          createdAt: { gte: oneHourAgo },
        },
      })

      if (!existingAlert) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        })

        await prisma.securityAlert.create({
          data: {
            type: 'DATA_BREACH',
            severity: 'CRITICAL',
            status: 'NEW',
            message: 'Unusual data access pattern detected',
            affectedUser: user?.email || userId,
            affectedCount: count,
          },
        })
      }
    }
  }

  // Monitor for rapid account creation (potential bot activity)
  static async monitorAccountCreation(): Promise<void> {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    const newAccounts = await prisma.user.count({
      where: {
        createdAt: { gte: oneHourAgo },
      },
    })

    // If more than 100 accounts created in an hour, flag it
    if (newAccounts > 100) {
      const existingAlert = await prisma.securityAlert.findFirst({
        where: {
          type: 'SUSPICIOUS_ACTIVITY',
          status: { in: ['NEW', 'INVESTIGATING'] },
          createdAt: { gte: oneHourAgo },
        },
      })

      if (!existingAlert) {
        await prisma.securityAlert.create({
          data: {
            type: 'SUSPICIOUS_ACTIVITY',
            severity: 'HIGH',
            status: 'NEW',
            message: 'Unusual account creation activity detected',
            affectedCount: newAccounts,
          },
        })
      }
    }
  }

  // Monitor for multiple moderation reports from same user (potential harassment)
  static async monitorHarassment(): Promise<void> {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const aggressiveReporters = await prisma.moderationItem.groupBy({
      by: ['authorId'],
      where: {
        createdAt: { gte: oneDayAgo },
      },
      having: {
        id: { _count: { gte: 20 } },
      },
    })

    for (const { authorId } of aggressiveReporters) {
      const count = await prisma.moderationItem.count({
        where: {
          authorId,
          createdAt: { gte: oneDayAgo },
        },
      })

      const existingAlert = await prisma.securityAlert.findFirst({
        where: {
          type: 'SUSPICIOUS_ACTIVITY',
          affectedUser: authorId,
          status: { in: ['NEW', 'INVESTIGATING'] },
          createdAt: { gte: oneDayAgo },
        },
      })

      if (!existingAlert) {
        const user = await prisma.user.findUnique({
          where: { id: authorId },
          select: { email: true },
        })

        await prisma.securityAlert.create({
          data: {
            type: 'SUSPICIOUS_ACTIVITY',
            severity: 'MEDIUM',
            status: 'NEW',
            message: 'Excessive reporting activity detected (potential harassment)',
            affectedUser: user?.email || authorId,
            affectedCount: count,
          },
        })
      }
    }
  }

  // Run all security checks
  static async runAllChecks(): Promise<void> {
    await this.monitorLoginPatterns()
    await this.monitorApiAbuse()
    await this.monitorDataAccess()
    await this.monitorAccountCreation()
    await this.monitorHarassment()
  }
}

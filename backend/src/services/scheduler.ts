import cron from 'node-cron'
import { SecurityMonitor } from './securityMonitor.js'

// Security monitoring scheduler
class SecurityScheduler {
  private tasks: cron.ScheduledTask[] = []

  // Run security checks every 5 minutes
  startSecurityMonitoring(): void {
    const task = cron.schedule('*/5 * * * *', async () => {
      console.log('[Security] Running security monitoring checks...')
      try {
        await SecurityMonitor.runAllChecks()
        console.log('[Security] Security monitoring checks completed')
      } catch (error) {
        console.error('[Security] Error running security checks:', error)
      }
    })

    this.tasks.push(task)
    console.log('[Security] Security monitoring scheduler started (runs every 5 minutes)')
  }

  // Clean up old rate limit records every hour
  startRateLimitCleanup(): void {
    const task = cron.schedule('0 * * * *', async () => {
      console.log('[Cleanup] Cleaning up old rate limit records...')
      try {
        const { prisma } = await import('../db/prisma.js')
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        
        await prisma.rateLimitRecord.deleteMany({
          where: {
            createdAt: { lt: oneDayAgo },
          },
        })
        
        console.log('[Cleanup] Rate limit records cleanup completed')
      } catch (error) {
        console.error('[Cleanup] Error cleaning up rate limit records:', error)
      }
    })

    this.tasks.push(task)
    console.log('[Cleanup] Rate limit cleanup scheduler started (runs every hour)')
  }

  // Clean up old failed login attempts every day
  startFailedLoginCleanup(): void {
    const task = cron.schedule('0 0 * * *', async () => {
      console.log('[Cleanup] Cleaning up old failed login attempts...')
      try {
        const { prisma } = await import('../db/prisma.js')
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        
        await prisma.failedLoginAttempt.deleteMany({
          where: {
            createdAt: { lt: sevenDaysAgo },
          },
        })
        
        console.log('[Cleanup] Failed login attempts cleanup completed')
      } catch (error) {
        console.error('[Cleanup] Error cleaning up failed login attempts:', error)
      }
    })

    this.tasks.push(task)
    console.log('[Cleanup] Failed login cleanup scheduler started (runs daily)')
  }

  // Clean up expired IP blocks every hour
  startIpBlockCleanup(): void {
    const task = cron.schedule('0 * * * *', async () => {
      console.log('[Cleanup] Cleaning up expired IP blocks...')
      try {
        const { prisma } = await import('../db/prisma.js')
        const now = new Date()
        
        await prisma.ipBlock.deleteMany({
          where: {
            blockedUntil: { lt: now },
          },
        })
        
        console.log('[Cleanup] IP block cleanup completed')
      } catch (error) {
        console.error('[Cleanup] Error cleaning up IP blocks:', error)
      }
    })

    this.tasks.push(task)
    console.log('[Cleanup] IP block cleanup scheduler started (runs every hour)')
  }

  // Start all scheduled tasks
  startAll(): void {
    this.startSecurityMonitoring()
    this.startRateLimitCleanup()
    this.startFailedLoginCleanup()
    this.startIpBlockCleanup()
    console.log('[Scheduler] All scheduled tasks started')
  }

  // Stop all scheduled tasks
  stopAll(): void {
    this.tasks.forEach(task => task.stop())
    this.tasks = []
    console.log('[Scheduler] All scheduled tasks stopped')
  }
}

export const securityScheduler = new SecurityScheduler()

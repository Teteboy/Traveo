import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'

export interface AuthPayload {
  userId: string
  role: string
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing or invalid token' })
    return
  }
  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as AuthPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ code: 'TOKEN_EXPIRED', message: 'Token expired or invalid' })
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
      return
    }
    // SUPER_ADMIN has access to all admin functions
    const role = req.user.role.toUpperCase()
    if (role === 'SUPER_ADMIN') {
      next()
      return
    }
    if (!roles.map(r => r.toUpperCase()).includes(role)) {
      res.status(403).json({ code: 'FORBIDDEN', message: 'Insufficient permissions' })
      return
    }
    next()
  }
}

import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  code?: string
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500
  const code = err.code ?? 'INTERNAL_ERROR'
  const message = err.message ?? 'An unexpected error occurred'

  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', err)
  }

  res.status(statusCode).json({ code, message })
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` })
}

export function createError(message: string, statusCode = 400, code = 'BAD_REQUEST'): AppError {
  const err: AppError = new Error(message)
  err.statusCode = statusCode
  err.code = code
  return err
}

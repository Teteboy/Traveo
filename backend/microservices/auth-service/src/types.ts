// Shared types used across route handlers

export interface PaginationQuery {
  page?: string
  limit?: string
}

export function getPagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(query.page ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export function ok<T>(data: T, meta?: Record<string, unknown>) {
  return { data, ...(meta ? { meta } : {}) }
}

export function paginated<T>(items: T[], total: number, page: number, limit: number) {
  return { page, limit, total, items }
}
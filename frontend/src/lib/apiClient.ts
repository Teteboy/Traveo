/**
 * Traveo API Client
 * Centralized HTTP client with JWT auth, request/response interceptors
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/v1'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem('traveo_access_token')
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('traveo_access_token', accessToken)
  localStorage.setItem('traveo_refresh_token', refreshToken)
}

export function clearTokens() {
  localStorage.removeItem('traveo_access_token')
  localStorage.removeItem('traveo_refresh_token')
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('traveo_refresh_token')
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) { clearTokens(); return null }
    const json = await res.json()
    const { accessToken, refreshToken: newRefresh } = json.data
    setTokens(accessToken, newRefresh)
    return accessToken
  } catch {
    clearTokens()
    return null
  }
}

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function request<T>(
  path: string,
  method: HttpMethod = 'GET',
  body?: unknown,
  isRetry = false,
): Promise<T> {
  const token = getAccessToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && !isRetry) {
    // Try refresh once
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = refreshAccessToken().finally(() => { isRefreshing = false; refreshPromise = null })
    }

    const newToken = await refreshPromise
    if (newToken) return request<T>(path, method, body, true)

    // If refresh failed, ensure auth state is cleared and surface a consistent error.
    clearTokens()
    window.dispatchEvent(new CustomEvent('traveo:unauthorized'))
    throw new ApiError('UNAUTHORIZED', 'Session expirée, veuillez vous reconnecter', 401)
  }

  let json: unknown
  const contentType = res.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    json = await res.json()
  } else {
    json = await res.text()
  }

  if (!res.ok) {
    const err = json as { code?: string; message?: string }
    throw new ApiError(err.code ?? 'UNKNOWN_ERROR', err.message ?? 'Une erreur est survenue', res.status)
  }

  return json as T
}

// ─── API Client ───────────────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string) => request<T>(path, 'GET'),
  post: <T>(path: string, body?: unknown) => request<T>(path, 'POST', body),
  patch: <T>(path: string, body?: unknown) => request<T>(path, 'PATCH', body),
  put: <T>(path: string, body?: unknown) => request<T>(path, 'PUT', body),
  delete: <T>(path: string) => request<T>(path, 'DELETE'),
}

// ─── Upload helper ────────────────────────────────────────────────────────────
export async function uploadFile(path: string, formData: FormData): Promise<unknown> {
  const token = getAccessToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { method: 'POST', headers, body: formData })
  const json = await res.json()
  if (!res.ok) throw new ApiError(json.code ?? 'UPLOAD_ERROR', json.message ?? 'Upload failed', res.status)
  return json
}

export default apiClient

import type { ApiResponse, AuthMeData, Pi360User } from './types'
import { withResolvedAreaAccess } from '../lib/areaPermissions'

const SITE_ORIGIN = (import.meta.env.VITE_SITE_ORIGIN || 'https://pi360.net').replace(/\/$/, '')
const INSTITUTE_ID = import.meta.env.VITE_INSTITUTE_ID ?? 'mietjammu'

const TOKEN_KEY = 'itracker_token'
const LOGIN_USER_KEY = 'itracker_login_user'

function resolveApiBase(raw: string | undefined): string {
  const base = (raw ?? '/api').trim()
  if (base.startsWith('http://') || base.startsWith('https://')) {
    return base.replace(/\/$/, '')
  }
  const path = base.startsWith('/') ? base : `/${base}`
  return path.replace(/\/$/, '')
}

const API_BASE = resolveApiBase(import.meta.env.VITE_API_BASE)

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(LOGIN_USER_KEY)
}

function buildUrl(route: string, params?: Record<string, string | number | undefined>) {
  const cleanRoute = route.replace(/^\//, '')
  const base = API_BASE.replace(/\/$/, '')
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5174'
  const fullPath = `${base}/${cleanRoute}`
  const url = base.startsWith('http')
    ? new URL(fullPath)
    : new URL(fullPath, origin)

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
    })
  }
  return url.toString()
}

export async function apiRequest<T>(
  route: string,
  options: RequestInit & { params?: Record<string, string | number | undefined> } = {},
): Promise<T> {
  const { params, ...init } = options
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string>),
  }

  if (init.body && !(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(buildUrl(route, params), { ...init, headers, cache: 'no-store' })
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Network error'
    throw new Error(
      `Could not reach the portal API (${reason}). If developing locally, restart Vite after .env changes.`,
    )
  }

  const refreshed = res.headers.get('X-Refreshed-Token')
  if (refreshed) setToken(refreshed)

  const raw = await res.text()
  let json: ApiResponse<T>
  try {
    json = raw
      ? (JSON.parse(raw) as ApiResponse<T>)
      : { status: 'error', response_code: res.status, message: '' }
  } catch {
    if (res.status >= 500) {
      throw new Error(
        `Could not reach the portal API (HTTP ${res.status}). If developing locally, run npm run dev:api.`,
      )
    }
    throw new Error(`The portal API returned an invalid response. (HTTP ${res.status})`)
  }

  if (json.status !== 'success') {
    const fallback =
      res.status >= 500
        ? `Could not reach the portal API (HTTP ${res.status}). If developing locally, run npm run dev:api.`
        : `Request failed (HTTP ${res.status})`
    const err = new Error(json.message || fallback) as Error & {
      code?: number
      data?: unknown
    }
    err.code = json.response_code ?? res.status
    err.data = json.data
    throw err
  }
  return json.data as T
}

export const api = {
  get: <T>(route: string, params?: Record<string, string | number | undefined>) =>
    apiRequest<T>(route, { method: 'GET', params }),
  post: <T>(route: string, body?: unknown, params?: Record<string, string | number | undefined>) =>
    apiRequest<T>(route, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      params,
    }),
  put: <T>(route: string, body?: unknown, params?: Record<string, string | number | undefined>) =>
    apiRequest<T>(route, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      params,
    }),
  delete: <T>(route: string, params?: Record<string, string | number | undefined>) =>
    apiRequest<T>(route, { method: 'DELETE', params }),
}

export interface LoginResult {
  token: string
  statusCode: number
  message: string
  data: Record<string, unknown>
}

/** Same login contract as PI-360 / leaderboard */
export async function loginPi360(username: string, password: string): Promise<LoginResult> {
  const url = `${SITE_ORIGIN}/site/api/api_login_user.php?institute_id=${encodeURIComponent(INSTITUTE_ID)}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      username_1: username,
      password_1: password,
    }),
  })

  if (!res.ok) {
    throw new Error('Login request failed')
  }

  const json = (await res.json()) as Record<string, unknown>

  if (json.statusCode !== 200) {
    throw new Error((json.message as string) || 'Login failed')
  }

  const token = json.token
  if (typeof token !== 'string' || token === '') {
    throw new Error('Login succeeded but no token was returned')
  }

  const data = (json.data ?? {}) as Record<string, unknown>
  setToken(token)
  localStorage.setItem(LOGIN_USER_KEY, JSON.stringify(data))

  return {
    token,
    statusCode: 200,
    message: String(json.message ?? 'Login successful'),
    data,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function pickDisplayName(data: Record<string, unknown>): string {
  const explicit = String(data.name ?? data.Name ?? data.full_name ?? '').trim()
  if (explicit) return explicit

  const username = String(data.username ?? data.Username ?? '').trim()
  if (username && !looksLikeEmail(username)) return username

  return 'User'
}

function pickEmail(data: Record<string, unknown>): string {
  const explicit = String(data.email ?? data.Email ?? '').trim()
  if (explicit) return explicit

  const username = String(data.username ?? data.Username ?? '').trim()
  if (username && looksLikeEmail(username)) return username

  return ''
}

function pickAvatar(data: Record<string, unknown>): string | undefined {
  const avatar = String(data.avatar ?? data.Avatar ?? data.picture ?? data.Picture ?? '').trim()
  return avatar || undefined
}

function pickRole(data: Record<string, unknown>): string | undefined {
  const role = data.accountType ?? data.account_type ?? data.role ?? data.Role
  return role ? String(role) : undefined
}

/** PI-360 login `data` has display name + avatar; JWT only carries login email in `username`. */
export function authFromLoginPayload(data: Record<string, unknown>): AuthMeData {
  const name = pickDisplayName(data)
  const email = pickEmail(data)
  const avatar = pickAvatar(data)
  const role = pickRole(data)

  const pi360: Pi360User = {
    ...(data as Pi360User),
    name,
    email,
    avatar,
    account_type: role,
  }

  return {
    pi360,
    name,
    email,
    avatar,
    role,
    designation: data.designation
      ? String(data.designation)
      : data.dept_name
        ? String(data.dept_name)
        : data.role && !looksLikeEmail(String(data.role))
          ? String(data.role)
          : undefined,
  }
}

function mergeAuthWithLogin(api: AuthMeData, stored: AuthMeData | null): AuthMeData {
  if (!stored) return api

  const name =
    stored.name && !looksLikeEmail(stored.name)
      ? stored.name
      : api.name && !looksLikeEmail(api.name)
        ? api.name
        : stored.name || api.name

  const avatar = stored.avatar ?? stored.pi360?.avatar ?? api.avatar ?? api.pi360?.avatar
  const email = stored.email || api.email
  const designation = stored.designation ?? api.designation
  const role = api.role ?? stored.role

  return {
    ...api,
    name,
    email,
    avatar,
    role,
    designation,
    pi360: {
      ...(stored.pi360 ?? {}),
      ...(api.pi360 ?? {}),
      name,
      email,
      avatar,
      account_type: role ?? stored.pi360?.account_type,
    },
  }
}

export function userFromLoginStorage(): AuthMeData | null {
  const raw = localStorage.getItem(LOGIN_USER_KEY)
  if (!raw) return null
  try {
    return authFromLoginPayload(JSON.parse(raw) as Record<string, unknown>)
  } catch {
    return null
  }
}

/** Validate session via tracker API; fall back to PI-360 login payload when API is not ready */
export async function fetchAuthMeWithRetry(maxAttempts = 3): Promise<AuthMeData> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const data = await api.get<AuthMeData>('auth/me')
      const stored = userFromLoginStorage()
      if (data) return withResolvedAreaAccess(mergeAuthWithLogin(data, stored))
      if (stored) return withResolvedAreaAccess(stored)
      throw new Error('Invalid session')
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Auth check failed')
      const stored = userFromLoginStorage()
      if (stored && getToken()) return withResolvedAreaAccess(stored)

      const retryable =
        attempt < maxAttempts - 1 &&
        /validate session|decoding failed|prior to|expired|could not reach|invalid response/i.test(
          lastError.message,
        )
      if (!retryable) break
      await sleep(400 * (attempt + 1))
    }
  }

  const stored = userFromLoginStorage()
  if (stored && getToken()) return withResolvedAreaAccess(stored)

  throw lastError ?? new Error('Auth check failed')
}

export { INSTITUTE_ID, API_BASE, SITE_ORIGIN, buildUrl, initials }

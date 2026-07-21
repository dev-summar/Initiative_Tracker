import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { sendError } from '../utils/response.js'

export interface AuthUser {
  usercode: number
  username: string | null
  role: string | null
  accountType: string | null
  deptcode: number | null
  batch: string | null
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

interface Pi360JwtPayload {
  iss?: string
  aud?: string
  exp?: number
  data?: {
    usercode?: number
    username?: string
    role?: string
    accountType?: string
    deptcode?: number
    batch?: string
    sid?: string
  }
}

function accountType(user: AuthUser): string {
  const at = (user.accountType ?? '').toLowerCase()
  const role = (user.role ?? '').toLowerCase()
  if (at === 'student') return 'student'
  if (at === 'admin' || role === 'admin') return 'admin'
  return 'staff'
}

export function actorName(user: AuthUser): string {
  return user.username ?? 'User'
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return sendError(res, 401, 'Authorization required. Login to PI-360 first.')
  }

  try {
    const decoded = jwt.verify(match[1], env.jwtSecret, {
      algorithms: ['HS256'],
      clockTolerance: 300,
    }) as Pi360JwtPayload

    const data = decoded.data ?? {}
    const usercode = Number(data.usercode ?? 0)
    if (!usercode) {
      return sendError(res, 401, 'Invalid or expired session.')
    }

    req.user = {
      usercode,
      username: data.username ?? null,
      role: data.role ?? null,
      accountType: data.accountType ?? null,
      deptcode: data.deptcode ?? null,
      batch: data.batch ?? null,
    }

    maybeRefreshToken(res, decoded, match[1])
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return sendError(res, 401, 'Session expired. Please sign in again.')
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return sendError(res, 401, 'Invalid session token.')
    }
    return sendError(res, 401, 'Could not validate session. Please sign in again.')
  }
}

export function requireManager(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return sendError(res, 401, 'Authorization required.')
  }
  if (accountType(req.user) === 'student') {
    return sendError(res, 403, 'Access restricted to management staff.')
  }
  next()
}

const SESSION_TTL = 30 * 24 * 60 * 60

function maybeRefreshToken(res: Response, decoded: Pi360JwtPayload, _token: string) {
  if (!decoded.data?.sid || !decoded.exp) return
  const remaining = decoded.exp - Math.floor(Date.now() / 1000)
  if (remaining <= 0 || remaining >= SESSION_TTL / 2) return

  const payload = {
    iss: env.jwtIssuer,
    aud: env.jwtAudience,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL,
    data: decoded.data,
  }

  const newJwt = jwt.sign(payload, env.jwtSecret, { algorithm: 'HS256' })
  res.setHeader('Access-Control-Expose-Headers', 'X-Refreshed-Token')
  res.setHeader('X-Refreshed-Token', newJwt)
}

export { accountType }

import type { Request, Response } from 'express'
import { resolveAllowedEmail } from '../config/allowedEmails.js'
import { canAccessArea, getAllowedAreaIds } from '../config/areaPermissions.js'
import { sendError } from '../utils/response.js'

export function loginEmail(req: Request): string {
  const raw = (req.user?.username ?? '').trim().toLowerCase()
  return resolveAllowedEmail(raw) ?? raw
}

export function userAllowedAreaIds(req: Request): string[] {
  return req.allowedAreaIds ?? getAllowedAreaIds(loginEmail(req))
}

/** Returns true when a 403 was sent. */
export function denyUnlessAreaAccess(req: Request, res: Response, areaId: string): boolean {
  if (!canAccessArea(loginEmail(req), areaId)) {
    sendError(res, 403, 'You do not have access to this area.')
    return true
  }
  return false
}

/**
 * Resolve area filter for list endpoints.
 * Returns null if access was denied (403 already sent).
 */
export function resolveAreaScope(
  req: Request,
  res: Response,
  areaId?: string,
): string[] | null {
  const allowed = userAllowedAreaIds(req)
  if (areaId) {
    if (!allowed.includes(areaId)) {
      sendError(res, 403, 'You do not have access to this area.')
      return null
    }
    return [areaId]
  }
  return allowed
}

import { normalizeLoginEmail, resolveAllowedLoginEmail } from './allowedEmails'

/** Mirror of backend area access — used when API session has no allowedAreaIds yet. */
const USER_AREA_ACCESS: Record<string, readonly string[]> = {
  'sahil.adm@mietjammu.in': [
    'area-strategy',
    'area-qa',
    'area-recruitment',
    'area-operational',
    'area-special',
    'area-admissions',
  ],
  'summar.adm@mietjammu.in': [
    'area-strategy',
    'area-qa',
    'area-recruitment',
    'area-operational',
    'area-special',
    'area-admissions',
  ],
  'rohin.adm@mietjammu.in': [
    'area-strategy',
    'area-admissions',
    'area-special',
    'area-operational',
  ],
  'navpreet.ash@mietjammu.in': ['area-recruitment'],
  'gurleen.ash@mietjammu.in': ['area-qa'],
  'rudraksh.ash@mietjammu.in': ['area-qa'],
  'harsimran.ash@mietjammu.in': ['area-qa'],
}

export function getAllowedAreaIdsForEmail(email: string): string[] {
  const canonical = resolveAllowedLoginEmail(email) ?? normalizeLoginEmail(email)
  const configured = USER_AREA_ACCESS[canonical]
  return configured ? [...configured] : []
}

export function withResolvedAreaAccess<T extends { email?: string; allowedAreaIds?: string[] }>(
  user: T,
): T & { allowedAreaIds: string[] } {
  const email = user.email ?? ''
  const allowedAreaIds =
    user.allowedAreaIds && user.allowedAreaIds.length > 0
      ? user.allowedAreaIds
      : getAllowedAreaIdsForEmail(email)
  return { ...user, allowedAreaIds }
}

import { env } from './env.js'

/** PI-360 JWT username variants → canonical allowlist email */
const EMAIL_ALIASES: Record<string, string> = {
  'rudraksh@mietjammu.in': 'rudraksh.ash@mietjammu.in',
  'gurleen@mietjammu.in': 'gurleen.ash@mietjammu.in',
  'harsimran@mietjammu.in': 'harsimran.ash@mietjammu.in',
  'navpreet@mietjammu.in': 'navpreet.ash@mietjammu.in',
  'sahil@mietjammu.in': 'sahil.adm@mietjammu.in',
}

export function normalizeLoginEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Map JWT / PI-360 username to a canonical allowlisted email, or null if not allowed. */
export function resolveAllowedEmail(email: string): string | null {
  const key = normalizeLoginEmail(email)
  if (!key) return null

  if (env.allowedLoginEmails.has(key)) return key

  const alias = EMAIL_ALIASES[key]
  if (alias && env.allowedLoginEmails.has(alias)) return alias

  return null
}

export function isAllowedLoginEmail(email: string): boolean {
  return resolveAllowedEmail(email) !== null
}

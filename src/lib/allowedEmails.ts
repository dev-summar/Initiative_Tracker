const DEFAULT_ALLOWED_EMAILS = [
  'sahil.adm@mietjammu.in',
  'rohin.adm@mietjammu.in',
  'summar.adm@mietjammu.in',
  'navpreet.ash@mietjammu.in',
  'gurleen.ash@mietjammu.in',
  'rudraksh.ash@mietjammu.in',
  'harsimran.ash@mietjammu.in',
]

/** PI-360 JWT username variants → canonical allowlist email */
const EMAIL_ALIASES: Record<string, string> = {
  'rudraksh@mietjammu.in': 'rudraksh.ash@mietjammu.in',
  'gurleen@mietjammu.in': 'gurleen.ash@mietjammu.in',
  'harsimran@mietjammu.in': 'harsimran.ash@mietjammu.in',
  'navpreet@mietjammu.in': 'navpreet.ash@mietjammu.in',
  'sahil@mietjammu.in': 'sahil.adm@mietjammu.in',
}

function parseAllowedEmails(raw: string | undefined): string[] {
  if (!raw?.trim()) return DEFAULT_ALLOWED_EMAILS
  return raw
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

/** Emails allowed to use Initiative Tracker (override via VITE_ALLOWED_LOGIN_EMAILS). */
export const ALLOWED_LOGIN_EMAILS = new Set(
  parseAllowedEmails(import.meta.env.VITE_ALLOWED_LOGIN_EMAILS as string | undefined),
)

export function normalizeLoginEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Map login / JWT email to a canonical allowlisted email, or null if not allowed. */
export function resolveAllowedLoginEmail(email: string): string | null {
  const key = normalizeLoginEmail(email)
  if (!key) return null

  if (ALLOWED_LOGIN_EMAILS.has(key)) return key

  const alias = EMAIL_ALIASES[key]
  if (alias && ALLOWED_LOGIN_EMAILS.has(alias)) return alias

  return null
}

export function isAllowedLoginEmail(email: string): boolean {
  return resolveAllowedLoginEmail(email) !== null
}

const DEFAULT_ALLOWED_EMAILS = [
  'sahil@mietjammu.in',
  'rohin.adm@mietjammu.in',
  'summar.adm@mietjammu.in',
]

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

export function isAllowedLoginEmail(email: string): boolean {
  return ALLOWED_LOGIN_EMAILS.has(email.trim().toLowerCase())
}

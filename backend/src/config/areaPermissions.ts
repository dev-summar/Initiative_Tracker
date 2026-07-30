/** All tracker areas (must match seeded area ids). */
export const ALL_AREA_IDS = [
  'area-strategy',
  'area-qa',
  'area-recruitment',
  'area-operational',
  'area-special',
  'area-admissions',
] as const

export type AreaId = (typeof ALL_AREA_IDS)[number]

const FULL_ACCESS = [...ALL_AREA_IDS]

/** Per-user area access. Emails are normalized to lowercase. */
export const USER_AREA_ACCESS: Record<string, readonly string[]> = {
  // Full portal
  'sahil.adm@mietjammu.in': FULL_ACCESS,
  'summar.adm@mietjammu.in': FULL_ACCESS,

  // Strategy, admissions, special initiatives, operational
  'rohin.adm@mietjammu.in': [
    'area-strategy',
    'area-admissions',
    'area-special',
    'area-operational',
  ],

  // Recruitment only
  'navpreet.ash@mietjammu.in': ['area-recruitment'],

  // Quality assurance only
  'gurleen.ash@mietjammu.in': ['area-qa'],
  'rudraksh.ash@mietjammu.in': ['area-qa'],
  'harsimran.ash@mietjammu.in': ['area-qa'],
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function getAllowedAreaIds(email: string): string[] {
  const key = normalizeEmail(email)
  const configured = USER_AREA_ACCESS[key]
  if (configured) return [...configured]
  return []
}

export function canAccessArea(email: string, areaId: string): boolean {
  return getAllowedAreaIds(email).includes(areaId)
}

/** Intersect requested ids with the user's allowed set. Empty requested → all allowed. */
export function scopeToAllowedAreas(email: string, requested?: string[]): string[] {
  const allowed = getAllowedAreaIds(email)
  if (!requested?.length) return allowed
  return requested.filter((id) => allowed.includes(id))
}

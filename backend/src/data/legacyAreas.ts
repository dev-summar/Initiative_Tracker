/** Operational tracker areas (non-strategy) */

export const LEGACY_AREAS = [
  {
    id: 'area-qa',
    slug: 'quality-assurance',
    name: 'Quality Assurance',
    description: 'Academic standards, audits, accreditation, and continuous improvement.',
    color: '#60A5FA',
    icon: 'ShieldCheck',
    sortOrder: 2,
  },
  {
    id: 'area-recruitment',
    slug: 'recruitment',
    name: 'Recruitment',
    description: 'Faculty and staff hiring pipelines, interviews, and onboarding.',
    color: '#FBBF24',
    icon: 'Users',
    sortOrder: 3,
  },
  {
    id: 'area-operational',
    slug: 'operational',
    name: 'Operational',
    description: 'Day-to-day campus operations, facilities, and process excellence.',
    color: '#5EEAD4',
    icon: 'Settings',
    sortOrder: 4,
  },
  {
    id: 'area-special',
    slug: 'special-initiatives',
    name: 'Special Initiatives',
    description: 'Cross-functional projects, innovation labs, and pilot programs.',
    color: '#818CF8',
    icon: 'Sparkles',
    sortOrder: 5,
  },
  {
    id: 'area-admissions',
    slug: 'admissions',
    name: 'Admissions',
    description: 'Enrollment funnel, counseling, outreach, and seat allocation.',
    color: '#B4A7E5',
    icon: 'GraduationCap',
    sortOrder: 6,
  },
] as const

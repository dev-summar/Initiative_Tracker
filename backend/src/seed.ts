import { connectDb } from './config/db.js'
import { AreaModel } from './models/Area.js'

const AREAS = [
  {
    id: 'area-strategy',
    slug: 'strategy',
    name: 'Strategy',
    description: 'Long-term planning, OKRs, and institutional growth initiatives.',
    color: '#A78BFA',
    icon: 'Compass',
    sortOrder: 1,
  },
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
]

async function seed() {
  await connectDb()

  for (const area of AREAS) {
    await AreaModel.findOneAndUpdate({ id: area.id }, area, { upsert: true, new: true })
    console.log(`Seeded area: ${area.name}`)
  }

  console.log('Done — 6 areas seeded.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})

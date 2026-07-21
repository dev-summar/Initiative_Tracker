/** MIET Strategic Plan 2024–30 structure + 1st Review / 8th GB Item 7 accomplishments */

export const STRATEGY_AREA = {
  id: 'area-strategy',
  slug: 'strategy',
  name: 'Strategy',
  description: 'MIET Strategic Plan 2024–2030 — objectives, implementation plans, and progress tracking.',
  color: '#A78BFA',
  icon: 'Compass',
  sortOrder: 1,
}

export const GB_REVIEW_SOURCE = '8th Governing Body — Item 7 (1st Strategic Review, Jul 2026)'

export interface PlanItemSeed {
  title: string
  description?: string
  processOwner?: string
  phase?: string
  status?: 'todo' | 'in_progress' | 'done' | 'blocked'
  documentRef?: string
  progressSource?: string
  lastReviewDate?: string
  checklist?: { label: string; done?: boolean }[]
}

export interface SubAreaSeed {
  id: string
  slug: string
  name: string
  description: string
  documentRef: string
  color: string
  icon: string
  sortOrder: number
  items: PlanItemSeed[]
}

export const STRATEGIC_SUB_AREAS: SubAreaSeed[] = [
  {
    id: 'plan-digital',
    slug: 'digital-transformation',
    name: 'Digital Transformation Plan',
    description: 'Campus connectivity, cybersecurity, PI-360 automation, and smart learning infrastructure.',
    documentRef: 'Strategic Plan — Appendix IV: Digital Transformation Plan',
    color: '#6366F1',
    icon: 'Cpu',
    sortOrder: 1,
    items: [
      { title: 'Upgraded campus internet to 1 Gbps with dedicated leased line and backup', processOwner: 'IT / Leadership', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: '35 additional Wi-Fi APs, IP-PBX, cloud digital displays, high-speed networking', processOwner: 'IT', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Upgraded Cisco Networking Academy Lab (~₹12.65 lakh)', processOwner: 'IT / CSE', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'NVIDIA DGX Spark cluster for Sovereign AI research (~₹9.50 lakh)', processOwner: 'IT / R&D', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Advanced cybersecurity — SOPHOS XGS4300, MFA, encrypted backups', processOwner: 'IT', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Centralized NAS storage for campus data security and backup', processOwner: 'IT', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'PI-360 automation of academic and administrative processes', processOwner: 'IT / IQAC', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: '25 Smart Interactive Panels for digital teaching', processOwner: 'IT / Academics', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Lab modernization — HPC workstations, AI infra, industry software', processOwner: 'IT / Departments', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Systematic e-waste disposal through authorized recyclers', processOwner: 'Facilities / IT', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Cloud-first strategy for data accessibility and security', processOwner: 'IT', phase: 'Phase 2', status: 'in_progress', documentRef: 'Strategic Plan — Digital Infrastructure' },
      { title: 'Full admissions-to-alumni lifecycle automation on PI-360', processOwner: 'IT / Leadership', phase: 'Phase 2', status: 'in_progress', documentRef: 'Strategic Plan — Automation' },
    ],
  },
  {
    id: 'plan-rdi',
    slug: 'research-development-innovation',
    name: 'Research, Development & Innovation Plan',
    description: 'PhD programs, Centres of Excellence, patents, funded projects, and research incentives.',
    documentRef: 'Strategic Plan — Appendix III: R&D and Innovation Plan',
    color: '#8B5CF6',
    icon: 'FlaskConical',
    sortOrder: 2,
    items: [
      { title: 'PhD in Engineering — commencement AY 2026-27', processOwner: 'Academic Council / R&D', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Three Centres of Excellence established (~₹45 lakh)', processOwner: 'R&D Cell', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Centre for Applied AI — NVIDIA AI workstations (~₹9.60 lakh)', processOwner: 'R&D / CSE', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Revised Research Incentive Policy for publications, patents, grants', processOwner: 'R&D Cell', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: '20 new patents filed with IPR mentoring support', processOwner: 'R&D Cell', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Annual Research Awards instituted', processOwner: 'R&D Cell', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Faculty travel grants for international conferences', processOwner: 'R&D Cell', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Externally funded projects — AICTE ATAL FDP & VAANI (~₹5.50 lakh)', processOwner: 'R&D Cell', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: '50 real-world AI projects for AI-day (Nov 2026)', processOwner: 'Centre for Applied AI', phase: 'Phase 2', status: 'in_progress', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'PI-360 AgenticAI layer for student support and mentoring', processOwner: 'IT / R&D', phase: 'Phase 2', status: 'in_progress', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
    ],
  },
  {
    id: 'plan-ld',
    slug: 'learning-development',
    name: 'Learning and Development Plan',
    description: 'Faculty upskilling, industry certifications, Coursera paths, and Teaching-Learning Centre.',
    documentRef: 'Strategic Plan — Appendix II: Learning and Development Plan',
    color: '#A78BFA',
    icon: 'GraduationCap',
    sortOrder: 3,
    items: [
      { title: 'LinkedIn Learning for UG Honours, 1st-year Engg & Law (~₹50L / 3 years)', processOwner: 'HRD', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Partnerships: NVIDIA, Cisco, UiPath, AWS, Oracle, Palo Alto', processOwner: 'HRD / Leadership', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Department-specific Coursera learning paths for faculty', processOwner: 'HRD / Dept Heads', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Teaching-Learning Center — pedagogical frameworks & faculty training', processOwner: 'HRD / TLC', phase: 'Phase 2', status: 'in_progress', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Individual Development Plans (IDPs) in PI-360', processOwner: 'HRD', phase: 'Phase 1', status: 'in_progress', documentRef: 'Table 7 — Implementation Plan' },
      { title: 'L&D calendar with half-yearly reviews and monthly progress reports', processOwner: 'HRD', phase: 'Phase 2', status: 'todo', documentRef: 'Table 7 — Track Progress' },
    ],
  },
  {
    id: 'plan-academic',
    slug: 'academic',
    name: 'Academic Plan',
    description: 'New programs, curriculum revision, industry collaborations, and emerging domains.',
    documentRef: 'Strategic Plan — Section 2: Academic and Research Excellence',
    color: '#60A5FA',
    icon: 'BookOpen',
    sortOrder: 4,
    items: [
      { title: 'B.A. (Hons.) Journalism and Mass Communication — AY 2026-27', processOwner: 'Academic Council', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Collaborations: LinkedIn, NISM, MongoDB, Zoho, Vivo, AMD, Autodesk', processOwner: 'Academics / Placements', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Curriculum revised for emerging domains, skilling & competency assessments', processOwner: 'Academic Council', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Introduce interdisciplinary programs (AI/ML, Cybersecurity, Quantum, EV)', processOwner: 'Academic Council', phase: 'Phase 2', status: 'todo', documentRef: 'Strategic Plan — Academic Programs' },
      { title: 'PhD programs in all engineering disciplines', processOwner: 'R&D / Academic Council', phase: 'Phase 2', status: 'in_progress', documentRef: 'Strategic Plan — Academic Programs' },
    ],
  },
  {
    id: 'plan-infra',
    slug: 'infrastructure',
    name: 'Infrastructure Development Plan',
    description: 'Campus expansion, amenities, library systems, and barrier-free access.',
    documentRef: 'Strategic Plan — Appendix V: Infrastructure Development Plan',
    color: '#5EEAD4',
    icon: 'Building2',
    sortOrder: 5,
    items: [
      { title: 'CLU certificate for ~62 kanals (~₹1.34 crore)', processOwner: 'Facilities / Leadership', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'New canteen facility (404.3 sq. m)', processOwner: 'Facilities', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Lifts, ramps, washrooms, pathways, signage — barrier-free upgrades', processOwner: 'Facilities', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'RFID Library Management System with Book Drop & Digital Entry', processOwner: 'Library / IT', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Centralized AC in D-Block classrooms (~13,700 sq. ft, ~₹60L)', processOwner: 'Facilities', phase: 'Phase 1', status: 'in_progress', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Two Pickle-Ball courts (~₹12 lakh)', processOwner: 'Facilities / Sports', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Two new academic blocks (1.5 lakh sq. ft)', processOwner: 'Leadership / Facilities', phase: 'Phase 3', status: 'todo', documentRef: 'GB Agenda — Fee revision justification' },
    ],
  },
  {
    id: 'plan-iqac',
    slug: 'iqac',
    name: 'IQAC Plan',
    description: 'Quality assurance, stakeholder feedback, safety, and accreditation readiness.',
    documentRef: 'Strategic Plan — Appendix VI: IQAC Plan',
    color: '#34D399',
    icon: 'ShieldCheck',
    sortOrder: 6,
    items: [
      { title: 'PI-360 governance dashboards — academic, accreditation, research, placement', processOwner: 'IQAC / IT', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Workplace safety — fire, emergency, medical, periodic audits', processOwner: 'IQAC / Admin', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Campus cleanliness, waste segregation, e-waste management', processOwner: 'IQAC / Facilities', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Stakeholder feedback system with ATR and continuous improvement', processOwner: 'IQAC', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'FDPs via PMMMNMTT, R&D Cell, and online platforms', processOwner: 'IQAC / HRD', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Structured alumni mentoring and networking programs', processOwner: 'IQAC / Alumni Cell', phase: 'Phase 2', status: 'in_progress', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
    ],
  },
  {
    id: 'plan-brand',
    slug: 'brand-enhancement',
    name: 'Brand Enhancement Plan',
    description: 'Flagship events, media visibility, national initiatives, and skilling centres.',
    documentRef: 'Strategic Plan — Appendix VII: Brand Enhancement Plan',
    color: '#FBBF24',
    icon: 'Megaphone',
    sortOrder: 7,
    items: [
      { title: 'Centre for Skill Development in Emerging Technologies (EV, Drones, CPS)', processOwner: 'Outreach / Academics', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Flagship events — intl. conferences, TEDx, hackathons, Inspire Series', processOwner: 'Outreach', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Media coverage, digital campaigns, social media engagement', processOwner: 'Outreach', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'UBA, NEP Saarthi, KAPILA, AICTE Internships, IIC mentoring', processOwner: 'Outreach / IQAC', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'SEO, PR, and reputation management (SSMF Level 4)', processOwner: 'Outreach', phase: 'Phase 3', status: 'todo', documentRef: 'Strategic Plan — Brand Amplification' },
    ],
  },
  {
    id: 'plan-sustainability',
    slug: 'sustainability',
    name: 'Sustainability Development Plan',
    description: 'SDG-aligned campus initiatives — health, education, gender, water, energy, partnerships.',
    documentRef: 'Strategic Plan — Appendix VIII: Sustainability Development Plan',
    color: '#22C55E',
    icon: 'Leaf',
    sortOrder: 8,
    items: [
      { title: 'SDG 3: Open Gym, futsal/pickleball courts, YourDost, campus counsellor', processOwner: 'Student Affairs', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'SDG 4: Smart classrooms, Coursera/LinkedIn, Teaching-Learning Center', processOwner: 'Academics / HRD', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'SDG 5: ICC strengthened, gender sensitization, 55% women faculty', processOwner: 'IQAC / HR', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'SDG 6: Rainwater harvesting (46,000 L) and new borewell (~₹22L)', processOwner: 'Facilities', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'SDG 7: Solar capacity 95 kVA (~₹24.25L); 250 kVA generator & transformer', processOwner: 'Facilities', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'SDG 17: New MoUs and Centres of Excellence partnerships', processOwner: 'Leadership / R&D', phase: 'Phase 1', status: 'done', progressSource: GB_REVIEW_SOURCE, lastReviewDate: '2026-07-18' },
      { title: 'Net-zero / energy-efficient building standards for new blocks', processOwner: 'Facilities / Leadership', phase: 'Phase 3', status: 'todo', documentRef: 'Strategic Plan — Sustainability Initiatives' },
    ],
  },
]

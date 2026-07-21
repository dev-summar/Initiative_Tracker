/**
 * Parses extracted PDF text → strategic plan seed items.
 * Uses curated strategicPlanData.ts as quality baseline, then adds table rows + GB minutes.
 * Run: npx tsx src/sync/generatePlanSeed.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { STRATEGIC_SUB_AREAS } from '../data/strategicPlanData.js'
import { getImplementationTableItems } from '../data/implementationPlanTables.js'
import { inferPlanItemPriority, type PlanPriority } from '../utils/planPriority.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const docsDir = path.join(root, 'docs')
const strategicTxt = path.join(docsDir, 'MIET STRATEGIC PLAN (2024-30) (1).txt')
const gbTxt = path.join(docsDir, '8th Governing Body Agenda Points.docx.txt')

export interface ParsedItem {
  title: string
  description: string
  processOwner: string
  phase: string
  priority?: PlanPriority
  status: 'todo' | 'in_progress' | 'done' | 'blocked'
  documentRef: string
  progressSource: string
  lastReviewDate: string
  source: 'strategic-plan' | 'gb-minutes'
  fromImplementationTable?: boolean
}

export interface ParsedPlan {
  id: string
  slug: string
  name: string
  description: string
  documentRef: string
  color: string
  icon: string
  sortOrder: number
  items: ParsedItem[]
}

const GB_SOURCE = '8th Governing Body — Item 7 (1st Strategic Review, Jul 2026)'

const PLAN_META: Record<
  string,
  {
    id: string
    slug: string
    name: string
    description: string
    documentRef: string
    color: string
    icon: string
    sortOrder: number
  }
> = {
  digital: {
    id: 'plan-digital',
    slug: 'digital-transformation',
    name: 'Digital Transformation Plan',
    description: 'Campus connectivity, cybersecurity, PI-360 automation, and smart learning infrastructure.',
    documentRef: 'Strategic Plan — Appendix IV / Table 9',
    color: '#6366F1',
    icon: 'Cpu',
    sortOrder: 1,
  },
  rdi: {
    id: 'plan-rdi',
    slug: 'research-development-innovation',
    name: 'Research, Development & Innovation Plan',
    description: 'PhD programs, Centres of Excellence, patents, funded projects, and research incentives.',
    documentRef: 'Strategic Plan — Appendix III / Table 8',
    color: '#8B5CF6',
    icon: 'FlaskConical',
    sortOrder: 2,
  },
  ld: {
    id: 'plan-ld',
    slug: 'learning-development',
    name: 'Learning and Development Plan',
    description: 'Faculty upskilling, industry certifications, Coursera paths, and Teaching-Learning Centre.',
    documentRef: 'Strategic Plan — Appendix II / Table 7',
    color: '#A78BFA',
    icon: 'GraduationCap',
    sortOrder: 3,
  },
  academic: {
    id: 'plan-academic',
    slug: 'academic',
    name: 'Academic Plan',
    description: 'New programs, curriculum revision, industry collaborations, and emerging domains.',
    documentRef: 'Strategic Plan — Section 2: Academic and Research Excellence',
    color: '#60A5FA',
    icon: 'BookOpen',
    sortOrder: 4,
  },
  infra: {
    id: 'plan-infra',
    slug: 'infrastructure',
    name: 'Infrastructure Development Plan',
    description: 'Campus expansion, amenities, library systems, and barrier-free access.',
    documentRef: 'Strategic Plan — Appendix V / Table 10',
    color: '#5EEAD4',
    icon: 'Building2',
    sortOrder: 5,
  },
  iqac: {
    id: 'plan-iqac',
    slug: 'iqac',
    name: 'IQAC Plan',
    description: 'Quality assurance, stakeholder feedback, safety, and accreditation readiness.',
    documentRef: 'Strategic Plan — Appendix VI / Table 11',
    color: '#34D399',
    icon: 'ShieldCheck',
    sortOrder: 6,
  },
  brand: {
    id: 'plan-brand',
    slug: 'brand-enhancement',
    name: 'Brand Enhancement Plan',
    description: 'Flagship events, media visibility, national initiatives, and skilling centres.',
    documentRef: 'Strategic Plan — Appendix VII / Table 12',
    color: '#FBBF24',
    icon: 'Megaphone',
    sortOrder: 7,
  },
  sustainability: {
    id: 'plan-sustainability',
    slug: 'sustainability',
    name: 'Sustainability Development Plan',
    description: 'SDG-aligned campus initiatives — health, education, gender, water, energy, partnerships.',
    documentRef: 'Strategic Plan — Appendix VIII / Table 13',
    color: '#22C55E',
    icon: 'Leaf',
    sortOrder: 8,
  },
}

const TABLE_TO_PLAN: Record<number, keyof typeof PLAN_META> = {
  7: 'ld',
  8: 'rdi',
  9: 'digital',
  10: 'infra',
  11: 'iqac',
  12: 'brand',
  13: 'sustainability',
}

const OWNER_RE =
  /(Department|Committee|Team|Council|Office|Cell|HRD|IQAC|RIC|Leadership|Facilities|Administration|NSS|Admissions|Research|R&D|Faculty|Academic|Human Resources|Outreach|Sports|Director|Principal|Admissions)/i

const DELIVERABLE_VERB =
  /^(Select|Achieve|Setup|Equip|Implement|Develop|Create|Build|Collaborate|Facilitate|Prepare|Ensure|Conduct|Launch|Organize|Offer|Host|Strengthen|Partner|Monitor|Collect|Maintain|Constitute|Set|Appoint|Publish|Participate|Focus|Explore|Design|Cleanliness|Training|Fire|Medical|Floor|Action|Meet|Comprehensive|Internal|External|Budget|Continuous|Champion|Dispose|Upgrade|Promote|Migrate|Evaluate|Adopt|Bring|Automate|Modernize|Integrate|Encourage|Provide|Recruit|Identify|Table|Go to|Install|Establish|Dispose|Perform|Table all|To table|Regular|Waste|Uniforms|Feedback|Action taken|Constitute|Set agenda|Comprehensive report|Internal\/external|Budget for|NAAC|Strategy|Championing|Mission|Alumni|Branded|Appoint a|Regular feedback|Offer skilling|Organize marquee|Host summer|Senior Citizen|Go to schools|Develop a monthly|Launch podcasts|Engage social|Participate and|Create an open|Integrate fitness|Mental Health|Improved Medical)/i

const JUNK_TIMELINE_LABELS =
  /^(Plan and implement|Execution|Regular reviews|Identify Needs|Training Sessions|Regular Updates|Data Collection|Analysis and Reporting|Continuous Improvement|Safety Audit|Implementation|Monitoring and Review|Report Preparation|Regular Presentations|Calendar and Planning|Conduct Audits|Agenda Setting|Meetings and Reviews|Plan and Design|Regular Fitness Programs|Identify Beneficiaries|Full Operationalization|Infrastructure Setup|Facility Setup|Vendor Selection|Research and Selection|Build Partnerships|Define Paths|Setup in PI-360|Create Initial Calendar|Setup|Implement|Evaluation|Monitoring|Comments)$/i

function normalize(s: string) {
  return s.replace(/\s+/g, ' ').trim()
}

export function isGarbageTitle(title: string): boolean {
  const t = normalize(title)
  if (t.length < 12) return true
  if (/:\s*$/.test(t) && t.length < 45) return true
  if (/^Comments\b/i.test(t)) return true
  if (/-- \d+ of \d+ --/.test(t)) return true
  if (/^\(Permanently Affiliated/i.test(t)) return true
  if (/MODEL INSTITUTE OF ENGINEERING/i.test(t)) return true
  if (/^Remarks\b/i.test(t)) return true
  if (/^Table \d+/i.test(t)) return true
  if (JUNK_TIMELINE_LABELS.test(t.replace(/:$/, '').trim())) return true
  if ((t.match(/:/g) || []).length >= 2 && t.length < 90) return true
  if (/^High\s*-?\s*:?\s*Speed/i.test(t)) return true
  if (/^Phase \d/i.test(t) && t.length < 50) return true
  if (/^-- \d+ of \d+/.test(t)) return true
  if (/\b(and|for|to|the|of|in|on|with)\s*$/i.test(t)) return true
  if (/Key Areas and Elements|OBJECTIVES|PLAN for MIET|INNOVATION PLAN|TRANSFORMATION PLAN/i.test(t)) return true
  if (/^Objective$/i.test(t)) return true
  if (/^Communicate back to$/i.test(t)) return true
  const words = t.split(/\s+/).filter(Boolean)
  if (words.length === 1 && !/^SDG\b/i.test(t)) return true
  if (words.length <= 2 && t.length < 22 && !/^SDG\b/i.test(t)) return true
  return false
}

function isQualityTableItem(item: ParsedItem): boolean {
  if (isGarbageTitle(item.title)) return false
  if (item.title.length < 22 && !/^SDG \d+/.test(item.title)) return false
  if (!item.description || item.description.length < 25) return false
  return true
}

function similarity(a: string, b: string) {
  const wa = new Set(a.toLowerCase().split(/\W+/).filter((w) => w.length > 3))
  const wb = b.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  if (wb.length === 0) return 0
  let hit = 0
  for (const w of wb) if (wa.has(w)) hit++
  return hit / wb.length
}

function isPageNoise(line: string): boolean {
  return (
    /^-- \d+ of \d+ --$/.test(line) ||
    /^\d{1,3}$/.test(line) ||
    /^Table \d+\s*:?\s*Implementation Plan$/i.test(line) ||
    /^Key Area Deliverables Owner/i.test(line) ||
    /^Justification\/Comments$/i.test(line) ||
    /^Comments$/i.test(line) ||
    /^Implementation Plan$/i.test(line) ||
    /^Remarks$/i.test(line) ||
    /^Appendix-/i.test(line)
  )
}

function isOwnerLine(line: string): boolean {
  if (OWNER_RE.test(line)) return true
  if (/^[A-Z][A-Za-z/& ]+\/$/.test(line)) return true
  return false
}

function isPhaseLine(line: string): boolean {
  return /^Phase \d/i.test(line)
}

function isLikelyKeyAreaLine(line: string): boolean {
  if (line.length > 65) return false
  if (isPhaseLine(line) || isOwnerLine(line)) return false
  if (DELIVERABLE_VERB.test(line)) return false
  if (/^SDG \d+/.test(line)) return true
  return /^[A-Z0-9(]/.test(line) && line.length >= 2
}

function isLikelyDeliverableLine(line: string): boolean {
  if (DELIVERABLE_VERB.test(line)) return true
  if (/^[a-z]/.test(line)) return true
  if (line.length > 70) return true
  return false
}

function parseGbItem7(text: string): Map<keyof typeof PLAN_META, ParsedItem[]> {
  const map = new Map<keyof typeof PLAN_META, ParsedItem[]>()
  const start = text.indexOf('Item No. 7')
  const end = text.indexOf('Item No. 8', start)
  const section = start >= 0 ? text.slice(start, end > start ? end : undefined) : ''

  const planBlocks: { key: keyof typeof PLAN_META; pattern: RegExp }[] = [
    { key: 'digital', pattern: /1\.\s*Digital[\s\S]*?Transformation\s*Plan([\s\S]*?)(?=2\.\s*Research)/i },
    { key: 'rdi', pattern: /2\.\s*Research[\s\S]*?Innovation Plan([\s\S]*?)(?=3\.\s*Learning)/i },
    { key: 'ld', pattern: /3\.\s*Learning[\s\S]*?Development Plan([\s\S]*?)(?=4\.\s*Academic)/i },
    { key: 'academic', pattern: /4\.\s*Academic Plan([\s\S]*?)(?=5\.\s*Infrastructure)/i },
    { key: 'infra', pattern: /5\.\s*Infrastructure[\s\S]*?Plan([\s\S]*?)(?=6\.\s*IQAC)/i },
    { key: 'iqac', pattern: /6\.\s*IQAC Plan([\s\S]*?)(?=7\.\s*Brand)/i },
    { key: 'brand', pattern: /7\.\s*Brand[\s\S]*?Plan([\s\S]*?)(?=8\.\s*Sustainability)/i },
    {
      key: 'sustainability',
      pattern: /8\.\s*Sustainability[\s\S]*?Plan([\s\S]*?)(?=The members of the Strategic Review)/i,
    },
  ]

  for (const { key, pattern } of planBlocks) {
    const m = section.match(pattern)
    if (!m) continue
    const block = m[1]
    const items: ParsedItem[] = []
    const meta = PLAN_META[key]

    const sdgParts = block.split(/(SDG \d+:[^\n]+)/g)
    let currentSdg = ''
    for (let i = 0; i < sdgParts.length; i++) {
      const part = sdgParts[i]
      if (/^SDG \d+:/.test(part)) {
        currentSdg = normalize(part)
        continue
      }
      const bullets = part.match(/[a-z]\)\s*[^\n]+(?:\n(?!\s*[a-z]\))[^\n]+)*/gi) ?? []
      for (const b of bullets) {
        const title = normalize(b.replace(/^[a-z]\)\s*/i, ''))
        if (title.length < 12 || isGarbageTitle(title)) continue
        items.push({
          title: currentSdg ? `${currentSdg}: ${title}` : title,
          description: '',
          processOwner: '',
          phase: 'Phase 1',
          status: 'done',
          documentRef: meta.documentRef,
          progressSource: GB_SOURCE,
          lastReviewDate: '2026-07-18',
          source: 'gb-minutes',
        })
      }
    }
    map.set(key, items)
  }

  return map
}

function parseTableRows(section: string, tableNum: number): ParsedItem[] {
  const planKey = TABLE_TO_PLAN[tableNum]
  const meta = planKey ? PLAN_META[planKey] : PLAN_META.ld
  const lines = section.split('\n').map((l) => l.trim()).filter((l) => l && !isPageNoise(l))

  const items: ParsedItem[] = []
  let keyArea: string[] = []
  let deliverables: string[] = []
  let owner: string[] = []
  let phases: string[] = []
  let tail: string[] = []
  let state: 'key_area' | 'deliverable' | 'owner' | 'tail' = 'key_area'

  const reset = () => {
    keyArea = []
    deliverables = []
    owner = []
    phases = []
    tail = []
    state = 'key_area'
  }

  const flush = () => {
    const area = normalize(keyArea.join(' '))
    const deliv = normalize([...deliverables, ...tail].join(' '))
    const phaseText = [...phases, ...tail].join(' ')
    const phaseMatch = phaseText.match(/Phase \d[^,;.]*/i)
    const phase = phaseMatch ? normalize(phaseMatch[0]) : 'Phase 1'
    const processOwner = normalize(owner.join(' / '))

    const title = area || deliv.slice(0, 140)
    if (!isGarbageTitle(title) && title.length >= 8) {
      items.push({
        title: title.slice(0, 220),
        description: area && deliv ? deliv.slice(0, 600) : '',
        processOwner: processOwner.replace(/\s*\/\s*$/, ''),
        phase,
        status: 'todo',
        documentRef: meta.documentRef,
        progressSource: '',
        lastReviewDate: '',
        source: 'strategic-plan',
      })
    }
    reset()
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (keyArea.length === 0 && deliverables.length === 0) {
      if (isPhaseLine(line)) continue
      if (JUNK_TIMELINE_LABELS.test(line)) continue
    }

    if (state === 'tail' && keyArea.length > 0 && (deliverables.length > 0 || owner.length > 0)) {
      if (isLikelyKeyAreaLine(line) && !isLikelyDeliverableLine(line) && !isPhaseLine(line)) {
        flush()
      }
    } else if (state === 'owner' && owner.length > 0 && phases.length === 0) {
      if (isLikelyKeyAreaLine(line) && !isOwnerLine(line) && !isLikelyDeliverableLine(line)) {
        flush()
      }
    }

    switch (state) {
      case 'key_area':
        if (isLikelyDeliverableLine(line) && keyArea.length > 0) {
          deliverables.push(line)
          state = 'deliverable'
        } else if (isOwnerLine(line) && keyArea.length > 0) {
          owner.push(line)
          state = 'owner'
        } else if (isLikelyKeyAreaLine(line)) {
          keyArea.push(line)
        } else if (keyArea.length > 0) {
          deliverables.push(line)
          state = 'deliverable'
        }
        break

      case 'deliverable':
        if (isOwnerLine(line)) {
          owner.push(line)
          state = 'owner'
        } else if (isPhaseLine(line)) {
          phases.push(line)
          state = 'tail'
        } else if (isLikelyKeyAreaLine(line) && !isLikelyDeliverableLine(line) && deliverables.length > 1) {
          flush()
          keyArea.push(line)
        } else {
          deliverables.push(line)
        }
        break

      case 'owner':
        if (isPhaseLine(line)) {
          phases.push(line)
          state = 'tail'
        } else if (isOwnerLine(line) || (owner.length > 0 && line.length < 45 && /^[A-Z]/.test(line))) {
          owner.push(line)
        } else if (isLikelyKeyAreaLine(line) && !isOwnerLine(line) && !isLikelyDeliverableLine(line)) {
          flush()
          keyArea.push(line)
        } else {
          deliverables.push(line)
          state = 'deliverable'
        }
        break

      case 'tail':
        if (isPhaseLine(line)) {
          phases.push(line)
        } else if (
          isLikelyKeyAreaLine(line) &&
          !isLikelyDeliverableLine(line) &&
          (phases.length > 0 || tail.length > 1)
        ) {
          flush()
          keyArea.push(line)
        } else {
          tail.push(line)
        }
        break
    }
  }
  flush()

  const seen = new Set<string>()
  return items.filter((item) => {
    if (isGarbageTitle(item.title)) return false
    const k = item.title.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

function extractTableContent(text: string, tableNum: number): string {
  const parts: string[] = []

  const preRe = new RegExp(
    `Implementation Plan\\s*\\n([\\s\\S]*?)\\s*Table ${tableNum}\\s*:\\s*Implementation Plan`,
    'i',
  )
  const pre = text.match(preRe)
  if (pre?.[1] && !/Key Area Deliverables Owner/i.test(pre[1].slice(0, 100))) {
    parts.push(pre[1])
  }

  const mainRe = new RegExp(
    `Table ${tableNum}\\s*:\\s*Implementation Plan([\\s\\S]*?)(?=Table ${tableNum + 1}\\s*:|Appendix-(?:VII|VIII|IX)|$)`,
    'i',
  )
  const main = text.match(mainRe)
  if (main) parts.push(main[1])

  return parts.join('\n')
}

function parseStrategicPlanTables(text: string): Map<keyof typeof PLAN_META, ParsedItem[]> {
  const map = new Map<keyof typeof PLAN_META, ParsedItem[]>()

  for (let tableNum = 7; tableNum <= 13; tableNum++) {
    const planKey = TABLE_TO_PLAN[tableNum]
    if (!planKey) continue

    const section = extractTableContent(text, tableNum)
    if (!section.trim()) continue

    const parsed = parseTableRows(section, tableNum)
    const existing = map.get(planKey) ?? []
    map.set(planKey, [...existing, ...parsed])
  }

  const academicBullets = [
    'Offer programs in emerging fields: AI/ML, Cybersecurity, Quantum Computing, Data Science, Industry 4.0, Electric Vehicles',
    'Introduce interdisciplinary and integrated programs aligned to market needs',
    'Introduce Hotel Management, Journalism, M.Tech all branches, LLM (Hons.), integrated programs',
    'Start PhD programs in all engineering disciplines',
    'Faculty Development: comprehensive L&D Plan for emerging technologies and research methodologies',
    'Establish Centers of Excellence in AI and Frontier Technologies',
    'Focus on industry-academic partnerships, IP, and startups',
  ]
  const academicItems: ParsedItem[] = academicBullets.map((title) => ({
    title,
    description: '',
    processOwner: 'Academic Council',
    phase: 'Phase 1',
    status: 'todo' as const,
    documentRef: PLAN_META.academic.documentRef,
    progressSource: '',
    lastReviewDate: '',
    source: 'strategic-plan' as const,
  }))
  map.set('academic', [...(map.get('academic') ?? []), ...academicItems])

  return map
}

function curatedToParsed(): Map<keyof typeof PLAN_META, ParsedItem[]> {
  const map = new Map<keyof typeof PLAN_META, ParsedItem[]>()
  const idToKey = Object.fromEntries(
    Object.entries(PLAN_META).map(([key, meta]) => [meta.id, key as keyof typeof PLAN_META]),
  ) as Record<string, keyof typeof PLAN_META>

  for (const seed of STRATEGIC_SUB_AREAS) {
    const key = idToKey[seed.id]
    if (!key) continue
    map.set(
      key,
      seed.items.map((item) => {
        const phase = item.phase ?? 'Phase 1'
        const status = item.status ?? 'todo'
        return {
          title: item.title,
          description: item.description ?? '',
          processOwner: item.processOwner ?? '',
          phase,
          priority: item.priority ?? inferPlanItemPriority(phase, status),
          status,
          documentRef: item.documentRef ?? seed.documentRef,
          progressSource: item.progressSource ?? '',
          lastReviewDate: item.lastReviewDate ?? '',
          source: item.progressSource ? ('gb-minutes' as const) : ('strategic-plan' as const),
        }
      }),
    )
  }
  return map
}

function tableItemsForPlan(planId: string, documentRef: string): ParsedItem[] {
  return getImplementationTableItems(planId, documentRef).map((item) => {
    const phase = item.phase ?? 'Phase 1'
    const status = item.status ?? 'todo'
    return {
      title: item.title,
      description: item.description ?? '',
      processOwner: item.processOwner ?? '',
      phase,
      priority: item.priority ?? inferPlanItemPriority(phase, status),
      status,
      documentRef: item.documentRef ?? documentRef,
      progressSource: item.progressSource ?? '',
      lastReviewDate: item.lastReviewDate ?? '',
      source: 'strategic-plan' as const,
      fromImplementationTable: true,
    }
  })
}

function mergeAll(
  table: ParsedItem[],
  curated: ParsedItem[],
  gb: ParsedItem[],
): ParsedItem[] {
  const merged: ParsedItem[] = [...table]

  const attach = (item: ParsedItem) => {
    if (isGarbageTitle(item.title)) return
    let best = -1
    let bestScore = 0
    merged.forEach((m, idx) => {
      const score = similarity(m.title, item.title)
      if (score > bestScore) {
        bestScore = score
        best = idx
      }
    })
    if (bestScore >= 0.35 && best >= 0) {
      const existing = merged[best]
      merged[best] = {
        ...existing,
        status: item.status !== 'todo' ? item.status : existing.status,
        progressSource: item.progressSource || existing.progressSource,
        lastReviewDate: item.lastReviewDate || existing.lastReviewDate,
        description:
          item.description.length > (existing.description?.length ?? 0)
            ? item.description
            : existing.description,
        processOwner: item.processOwner || existing.processOwner,
        fromImplementationTable: existing.fromImplementationTable,
      }
    } else if (!merged.some((m) => similarity(m.title, item.title) >= 0.35)) {
      merged.push(item)
    }
  }

  for (const c of curated) attach(c)
  for (const g of gb) attach(g)

  return merged
    .filter((item) => item.fromImplementationTable || !isGarbageTitle(item.title))
    .map((item) => {
      const { fromImplementationTable: _table, ...rest } = item
      return {
        ...rest,
        priority: rest.priority ?? inferPlanItemPriority(rest.phase, rest.status),
      }
    })
}

export function buildPlansFromDocs(): ParsedPlan[] {
  const strategicText = fs.readFileSync(strategicTxt, 'utf8')
  const gbText = fs.readFileSync(gbTxt, 'utf8')

  const curatedMap = curatedToParsed()
  const gbMap = parseGbItem7(gbText)
  void parseStrategicPlanTables(strategicText) // kept for future; tables are column-major in PDF text

  const plans: ParsedPlan[] = []
  const order: (keyof typeof PLAN_META)[] = [
    'digital',
    'rdi',
    'ld',
    'academic',
    'infra',
    'iqac',
    'brand',
    'sustainability',
  ]

  for (const key of order) {
    const meta = PLAN_META[key]
    const tableRows = tableItemsForPlan(meta.id, meta.documentRef)
    const items = mergeAll(tableRows, curatedMap.get(key) ?? [], gbMap.get(key) ?? [])
    plans.push({ ...meta, items })
  }

  return plans
}

if (process.argv[1]?.includes('generatePlanSeed')) {
  const plans = buildPlansFromDocs()
  let total = 0
  let suspicious = 0

  for (const p of plans) {
    const bad = p.items.filter((i) => isGarbageTitle(i.title))
    suspicious += bad.length
    console.log(`${p.name}: ${p.items.length} items${bad.length ? ` (${bad.length} suspicious)` : ''}`)
    total += p.items.length
  }
  console.log(`TOTAL: ${total} items`)
  if (suspicious > 0) console.warn(`WARNING: ${suspicious} items still have suspicious titles`)

  const outPath = path.join(root, 'backend/src/data/strategicPlanData.generated.json')
  fs.writeFileSync(outPath, JSON.stringify(plans, null, 2), 'utf8')
  console.log(`Wrote ${outPath}`)
}

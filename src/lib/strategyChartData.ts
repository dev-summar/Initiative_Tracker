import type { PlanItem, PlanItemStatus, SubArea, TaskPriority } from '../api/types'
import { PRIORITY_CHART_COLORS, STATUS_CHART_COLORS, chartSeriesColor } from './design'
import { priorityLabel, statusLabel } from './utils'

const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030] as const

const PRIORITY_SCORE: Record<TaskPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

const DELAY_SCORE: Record<PlanItemStatus, number> = {
  done: 0,
  in_progress: 1,
  todo: 2.5,
  blocked: 3.5,
}

export function simplifyPhase(phase: string): string {
  const p = phase.trim()
  if (!p) return 'Unassigned'
  if (/phase\s*3|ongoing/i.test(p)) return 'Phase 3 / Ongoing'
  if (/phase\s*2/i.test(p)) return 'Phase 2'
  if (/phase\s*1/i.test(p)) return 'Phase 1'
  return p.length > 24 ? `${p.slice(0, 22)}…` : p
}

export function planShortName(name: string) {
  return name.replace(/ Plan$/, '')
}

function planItems(items: PlanItem[], planId: string) {
  return items.filter((i) => i.subAreaId === planId)
}

export function buildPlanRings(plans: SubArea[]) {
  return [...plans]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((plan, i) => ({
      id: plan.id,
      name: planShortName(plan.name),
      pct: plan.stats?.progressPct ?? 0,
      done: plan.stats?.done ?? 0,
      total: plan.stats?.total ?? 0,
      color: chartSeriesColor(i),
    }))
}

export interface SunburstArc {
  id: string
  name: string
  value: number
  depth: number
  startAngle: number
  endAngle: number
  color: string
  path: string
}

export function buildSunburstArcs(plans: SubArea[], items: PlanItem[]): SunburstArc[] {
  type Node = { name: string; color?: string; children: Map<string, Node>; count: number }

  const root: Node = { name: 'root', children: new Map(), count: 0 }

  for (const plan of plans) {
    let planNode = root.children.get(plan.id)
    if (!planNode) {
      planNode = { name: planShortName(plan.name), color: plan.color, children: new Map(), count: 0 }
      root.children.set(plan.id, planNode)
    }
    for (const item of planItems(items, plan.id)) {
      const phaseKey = simplifyPhase(item.phase)
      let phaseNode = planNode.children.get(phaseKey)
      if (!phaseNode) {
        phaseNode = { name: phaseKey, children: new Map(), count: 0 }
        planNode.children.set(phaseKey, phaseNode)
      }
      const priKey = item.priority
      let priNode = phaseNode.children.get(priKey)
      if (!priNode) {
        priNode = {
          name: priorityLabel(priKey),
          color: PRIORITY_CHART_COLORS[priKey],
          children: new Map(),
          count: 0,
        }
        phaseNode.children.set(priKey, priNode)
      }
      const statusKey = item.status
      let statusNode = priNode.children.get(statusKey)
      if (!statusNode) {
        statusNode = {
          name: statusLabel(statusKey),
          color: STATUS_CHART_COLORS[statusKey],
          children: new Map(),
          count: 0,
        }
        priNode.children.set(statusKey, statusNode)
      }
      statusNode.count++
      priNode.count++
      phaseNode.count++
      planNode.count++
      root.count++
    }
  }

  const arcs: SunburstArc[] = []
  const cx = 150
  const cy = 150
  const innerBase = 28
  const ringWidth = 26

  function arcPath(r0: number, r1: number, start: number, end: number) {
    const large = end - start > Math.PI ? 1 : 0
    const x0 = cx + r0 * Math.cos(start)
    const y0 = cy + r0 * Math.sin(start)
    const x1 = cx + r1 * Math.cos(start)
    const y1 = cy + r1 * Math.sin(start)
    const x2 = cx + r1 * Math.cos(end)
    const y2 = cy + r1 * Math.sin(end)
    const x3 = cx + r0 * Math.cos(end)
    const y3 = cy + r0 * Math.sin(end)
    return `M ${x0} ${y0} L ${x1} ${y1} A ${r1} ${r1} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r0} ${r0} 0 ${large} 0 ${x0} ${y0} Z`
  }

  function walk(node: Node, depth: number, startAngle: number, endAngle: number, idPrefix: string) {
    if (node.count === 0) return
    const r0 = innerBase + depth * ringWidth
    const r1 = r0 + ringWidth - 2
    if (depth > 0) {
      arcs.push({
        id: idPrefix,
        name: node.name,
        value: node.count,
        depth,
        startAngle,
        endAngle,
        color: node.color ?? chartSeriesColor(depth),
        path: arcPath(r0, r1, startAngle, endAngle),
      })
    }
    const children = [...node.children.entries()].sort((a, b) => b[1].count - a[1].count)
    let cursor = startAngle
    const span = endAngle - startAngle
    for (const [key, child] of children) {
      const slice = (child.count / node.count) * span
      walk(child, depth + 1, cursor, cursor + slice, `${idPrefix}-${key}`)
      cursor += slice
    }
  }

  walk(root, 0, 0, Math.PI * 2, 'root')
  return arcs.filter((a) => a.depth > 0)
}

export interface SankeyLink {
  source: string
  target: string
  value: number
}

export function buildSankeyData(plans: SubArea[], items: PlanItem[]) {
  const linkMap = new Map<string, number>()

  const add = (source: string, target: string) => {
    const key = `${source}→${target}`
    linkMap.set(key, (linkMap.get(key) ?? 0) + 1)
  }

  for (const plan of plans) {
    const planLabel = planShortName(plan.name)
    for (const item of planItems(items, plan.id)) {
      add(planLabel, simplifyPhase(item.phase))
      add(simplifyPhase(item.phase), priorityLabel(item.priority))
      add(priorityLabel(item.priority), statusLabel(item.status))
    }
  }

  const links: SankeyLink[] = []
  for (const [key, value] of linkMap) {
    const [source, target] = key.split('→')
    links.push({ source, target, value })
  }

  const planNames = plans.map((p) => planShortName(p.name))
  const phases = [
    ...new Set(
      links
        .map((l) => l.target)
        .filter((t) => t.startsWith('Phase') || t === 'Unassigned'),
    ),
  ]
  const priorities = ['Critical', 'High', 'Medium', 'Low']
  const statuses = ['Not started', 'In progress', 'Completed', 'Blocked']

  const columns = [
    planNames,
    phases.length ? phases : ['Phase 1', 'Phase 2', 'Phase 3 / Ongoing'],
    priorities,
    statuses,
  ]

  return { links, columns }
}

export function buildBubbleData(plans: SubArea[]) {
  return plans.map((plan, i) => {
    const total = plan.stats?.total ?? 0
    const pct = plan.stats?.progressPct ?? 0
    const done = plan.stats?.done ?? 0
    return {
      id: plan.id,
      name: planShortName(plan.name),
      x: (i % 4) * 25 + 12,
      y: Math.floor(i / 4) * 35 + 20,
      size: Math.max(total * 80, 400),
      total,
      done,
      pct,
      color: chartSeriesColor(i),
    }
  })
}

export function buildHeatmapData(plans: SubArea[], items: PlanItem[]) {
  return plans.map((plan) => {
    const planItemsList = planItems(items, plan.id)
    const cells = YEARS.map((year) => {
      const inYear = planItemsList.filter((item) => phaseTargetsYear(item.phase, year))
      if (inYear.length === 0) return { year, pct: null, count: 0 }
      const done = inYear.filter((i) => i.status === 'done').length
      return { year, pct: Math.round((done / inYear.length) * 100), count: inYear.length }
    })
    return {
      planId: plan.id,
      planName: planShortName(plan.name),
      color: plan.color,
      cells,
    }
  })
}

function phaseTargetsYear(phase: string, year: number): boolean {
  const s = simplifyPhase(phase)
  if (s === 'Phase 1') return year >= 2024 && year <= 2025
  if (s === 'Phase 2') return year >= 2025 && year <= 2027
  if (s === 'Phase 3 / Ongoing') return year >= 2027 && year <= 2030
  if (year === 2026) return true
  return year >= 2024 && year <= 2030
}

export function buildRiskPoints(items: PlanItem[], plans: SubArea[]) {
  const planMap = new Map(plans.map((p) => [p.id, p]))
  return items.map((item) => {
    const plan = planMap.get(item.subAreaId)
    const completion = item.status === 'done' ? 100 : item.status === 'in_progress' ? 50 : 0
    return {
      id: item.id,
      name: item.title.length > 32 ? `${item.title.slice(0, 30)}…` : item.title,
      priority: PRIORITY_SCORE[item.priority],
      priorityLabel: priorityLabel(item.priority),
      delay: DELAY_SCORE[item.status],
      completion,
      status: item.status,
      planColor: plan?.color ?? '#6366F1',
    }
  })
}

export function buildTimelineRace(plans: SubArea[]) {
  const currentYear = 2026
  return YEARS.map((year) => {
    const row: Record<string, number | string> = { year: String(year) }
    for (const plan of plans) {
      const key = planShortName(plan.name)
      const actual = plan.stats?.progressPct ?? 0
      if (year < currentYear) {
        row[key] = Math.round(actual * ((year - 2023) / (currentYear - 2023)) * 0.85)
      } else if (year === currentYear) {
        row[key] = actual
      } else {
        const remaining = 100 - actual
        const yearsLeft = 2030 - currentYear
        row[key] = Math.min(100, Math.round(actual + (remaining * (year - currentYear)) / yearsLeft))
      }
    }
    return row
  })
}

export function overallCompletion(plans: SubArea[]) {
  const done = plans.reduce((n, p) => n + (p.stats?.done ?? 0), 0)
  const total = plans.reduce((n, p) => n + (p.stats?.total ?? 0), 0)
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) }
}

/** Table key areas only — excludes long GB progress bullet items */
export function tableKeyAreaItems(items: PlanItem[]) {
  return items.filter((item) => !(item.progressSource && item.title.length > 50))
}

export function buildKeyAreaProgress(items: PlanItem[], accent: string) {
  return tableKeyAreaItems(items).map((item) => {
    const pct =
      item.status === 'done' ? 100 : item.status === 'in_progress' ? 55 : item.status === 'blocked' ? 15 : 0
    return {
      id: item.id,
      title: item.title.length > 36 ? `${item.title.slice(0, 34)}…` : item.title,
      fullTitle: item.title,
      phase: simplifyPhase(item.phase),
      priority: item.priority,
      status: item.status,
      pct,
      accent,
    }
  })
}

export function buildPhasePriorityMatrix(items: PlanItem[]) {
  const phases = ['Phase 1', 'Phase 2', 'Phase 3 / Ongoing', 'Unassigned'] as const
  const priorities: TaskPriority[] = ['critical', 'high', 'medium', 'low']
  return phases.map((phase) => {
    const row: Record<string, number | string> = { phase }
    for (const pri of priorities) {
      const count = tableKeyAreaItems(items).filter(
        (i) => simplifyPhase(i.phase) === phase && i.priority === pri,
      ).length
      row[pri] = count
    }
    return row
  })
}

export function buildPlanSankey(items: PlanItem[]) {
  const linkMap = new Map<string, number>()
  const add = (source: string, target: string) => {
    const key = `${source}→${target}`
    linkMap.set(key, (linkMap.get(key) ?? 0) + 1)
  }
  for (const item of tableKeyAreaItems(items)) {
    add(simplifyPhase(item.phase), priorityLabel(item.priority))
    add(priorityLabel(item.priority), statusLabel(item.status))
  }
  const links: SankeyLink[] = []
  for (const [key, value] of linkMap) {
    const [source, target] = key.split('→')
    links.push({ source, target, value })
  }
  const phases = [
    ...new Set(
      links
        .map((l) => l.source)
        .filter((s) => s.startsWith('Phase') || s === 'Unassigned'),
    ),
  ]
  const columns = [
    phases.length ? phases : ['Phase 1', 'Phase 2', 'Phase 3 / Ongoing'],
    ['Critical', 'High', 'Medium', 'Low'],
    ['Not started', 'In progress', 'Completed', 'Blocked'],
  ]
  return { links, columns }
}

export function buildPlanRiskPoints(items: PlanItem[], accent: string) {
  return tableKeyAreaItems(items).map((item) => ({
    id: item.id,
    name: item.title.length > 28 ? `${item.title.slice(0, 26)}…` : item.title,
    priority: PRIORITY_SCORE[item.priority],
    delay: DELAY_SCORE[item.status],
    status: item.status,
    planColor: accent,
  }))
}

export function planItemCompletion(items: PlanItem[]) {
  const keyAreas = tableKeyAreaItems(items)
  const done = keyAreas.filter((i) => i.status === 'done').length
  const total = keyAreas.length
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) }
}

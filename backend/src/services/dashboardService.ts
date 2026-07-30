import { AreaModel, formatArea } from '../models/Area.js'
import { KpiModel, formatKpi } from '../models/Kpi.js'
import { TaskModel, formatTask, isOverdue } from '../models/Task.js'
import { recentActivity } from './activityService.js'

const STATUS_COLORS: Record<string, string> = {
  todo: '#EF4444',
  in_progress: '#EAB308',
  blocked: '#EF4444',
  done: '#22C55E',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#22C55E',
  medium: '#EAB308',
  high: '#EF4444',
  critical: '#EF4444',
}

const AREA_CHART_COLORS = ['#22C55E', '#EAB308', '#EF4444'] as const

export async function getDashboardOverview(filters?: {
  statuses?: string[]
  priorities?: string[]
  areaIds?: string[]
}) {
  const [areas, taskDocs, kpiDocs, activity] = await Promise.all([
    AreaModel.find().sort({ sortOrder: 1, name: 1 }).lean(),
    TaskModel.find({ deletedAt: null }).sort({ updatedAt: -1 }).lean(),
    KpiModel.find({ deletedAt: null }).sort({ updatedAt: -1 }).lean(),
    recentActivity(20),
  ])

  const areasFormatted = areas.map((a) => formatArea(a as Record<string, unknown>))
  let tasks = taskDocs.map((t) => formatTask(t as Record<string, unknown>))
  let kpis = kpiDocs.map((k) => formatKpi(k as Record<string, unknown>))

  const statuses = filters?.statuses?.filter(Boolean) ?? []
  const priorities = filters?.priorities?.filter(Boolean) ?? []
  const areaIds = filters?.areaIds?.filter(Boolean) ?? []

  if (filters?.areaIds !== undefined) {
    tasks = tasks.filter((t) => areaIds.includes(t.areaId))
    kpis = kpis.filter((k) => areaIds.includes(k.areaId))
  } else if (areaIds.length) {
    tasks = tasks.filter((t) => areaIds.includes(t.areaId))
    kpis = kpis.filter((k) => areaIds.includes(k.areaId))
  }

  const areasForStats =
    filters?.areaIds !== undefined || areaIds.length
      ? areasFormatted.filter((a) => areaIds.includes(a.id))
      : areasFormatted

  if (statuses.length) {
    tasks = tasks.filter((t) => statuses.includes(t.status))
  }
  if (priorities.length) {
    tasks = tasks.filter((t) => priorities.includes(t.priority))
  }

  const stats = computeStats(tasks, kpis, areasForStats)
  const areaSummaries = computeAreaSummaries(tasks, kpis, areasForStats)
  const needsAttention = computeNeedsAttention(tasks)

  const statusKeys = ['todo', 'in_progress', 'blocked', 'done']
  const statusDistribution = statusKeys.map((s) => ({
    name: s,
    value: tasks.filter((t) => t.status === s).length,
    color: STATUS_COLORS[s],
  }))

  const priorityKeys = ['low', 'medium', 'high', 'critical']
  const priorityDistribution = priorityKeys.map((p) => ({
    name: p,
    value: tasks.filter((t) => t.priority === p && t.status !== 'done').length,
    color: PRIORITY_COLORS[p],
  }))

  const areaProgress = areasForStats.map((area, i) => {
    const areaTasks = tasks.filter((t) => t.areaId === area.id)
    return {
      name: area.name,
      completed: areaTasks.filter((t) => t.status === 'done').length,
      total: areaTasks.length,
      color: AREA_CHART_COLORS[i % AREA_CHART_COLORS.length],
    }
  })

  return {
    stats,
    areaSummaries,
    needsAttention,
    recentActivity:
      filters?.areaIds !== undefined || areaIds.length
        ? activity.filter((a) => areaIds.includes(a.areaId))
        : activity,
    statusDistribution,
    priorityDistribution,
    areaProgress,
  }
}

function computeStats(
  tasks: ReturnType<typeof formatTask>[],
  kpis: ReturnType<typeof formatKpi>[],
  areas: ReturnType<typeof formatArea>[],
) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length
  const blockedTasks = tasks.filter((t) => t.status === 'blocked').length
  const overdueTasks = tasks.filter((t) => isOverdue(t)).length
  const criticalItems = tasks.filter(
    (t) => t.priority === 'critical' && t.status !== 'done',
  ).length

  let avgKpiProgress = 0
  if (kpis.length > 0) {
    const sum = kpis.reduce((acc, k) => {
      const target = Math.max(1, k.target)
      return acc + Math.min(100, (k.value / target) * 100)
    }, 0)
    avgKpiProgress = Math.round(sum / kpis.length)
  }

  let areasOnTrack = 0
  for (const area of areas) {
    const areaTasks = tasks.filter((t) => t.areaId === area.id)
    if (areaTasks.length === 0) {
      areasOnTrack++
      continue
    }
    const done = areaTasks.filter((t) => t.status === 'done').length
    const overdue = areaTasks.filter((t) => isOverdue(t)).length
    if (done / areaTasks.length >= 0.5 && overdue === 0) {
      areasOnTrack++
    }
  }

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    blockedTasks,
    overdueTasks,
    avgKpiProgress,
    areasOnTrack,
    criticalItems,
  }
}

function computeAreaSummaries(
  tasks: ReturnType<typeof formatTask>[],
  kpis: ReturnType<typeof formatKpi>[],
  areas: ReturnType<typeof formatArea>[],
) {
  return areas.map((area) => {
    const areaTasks = tasks.filter((t) => t.areaId === area.id)
    const areaKpis = kpis.filter((k) => k.areaId === area.id)

    let kpiProgress = 0
    if (areaKpis.length > 0) {
      const sum = areaKpis.reduce((acc, k) => {
        const target = Math.max(1, k.target)
        return acc + Math.min(100, (k.value / target) * 100)
      }, 0)
      kpiProgress = Math.round(sum / areaKpis.length)
    }

    return {
      area,
      totalTasks: areaTasks.length,
      completedTasks: areaTasks.filter((t) => t.status === 'done').length,
      inProgressTasks: areaTasks.filter((t) => t.status === 'in_progress').length,
      blockedTasks: areaTasks.filter((t) => t.status === 'blocked').length,
      overdueTasks: areaTasks.filter((t) => isOverdue(t)).length,
      kpiProgress,
      criticalCount: areaTasks.filter(
        (t) => t.priority === 'critical' && t.status !== 'done',
      ).length,
    }
  })
}

function computeNeedsAttention(tasks: ReturnType<typeof formatTask>[]) {
  const filtered = tasks.filter(
    (t) =>
      t.status !== 'done' &&
      (t.priority === 'critical' || isOverdue(t) || t.status === 'blocked'),
  )

  const score = (t: ReturnType<typeof formatTask>) => {
    let s = 0
    if (t.priority === 'critical') s += 4
    else if (t.priority === 'high') s += 3
    else if (t.priority === 'medium') s += 2
    else s += 1
    if (isOverdue(t)) s += 5
    if (t.status === 'blocked') s += 3
    return s
  }

  return filtered.sort((a, b) => score(b) - score(a)).slice(0, 8)
}

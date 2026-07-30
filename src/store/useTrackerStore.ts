import { create } from 'zustand'
import type {
  ActivityItem,
  AreaSummary,
  CreateKpiInput,
  CreateTaskInput,
  DashboardOverview,
  DashboardStats,
  FilterState,
  Kpi,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateKpiInput,
  UpdateTaskInput,
} from '../api/types'
import {
  AREAS,
  INITIAL_ACTIVITY,
  INITIAL_KPIS,
  INITIAL_TASKS,
  PRIORITY_COLORS,
  STATUS_COLORS,
} from '../data/mockData'
import { chartSeriesColor } from '../lib/design'

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function isOverdue(task: Task) {
  if (task.status === 'done') return false
  return new Date(task.dueDate) < new Date(new Date().toDateString())
}

function computeStats(tasks: Task[], kpis: Kpi[]): DashboardStats {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length
  const blockedTasks = tasks.filter((t) => t.status === 'blocked').length
  const overdueTasks = tasks.filter(isOverdue).length
  const criticalItems = tasks.filter(
    (t) => t.priority === 'critical' && t.status !== 'done',
  ).length

  const avgKpiProgress =
    kpis.length === 0
      ? 0
      : Math.round(
          kpis.reduce((sum, k) => sum + Math.min(100, (k.value / Math.max(k.target, 1)) * 100), 0) /
            kpis.length,
        )

  const areaIds = AREAS.map((a) => a.id)
  const areasOnTrack = areaIds.filter((id) => {
    const areaTasks = tasks.filter((t) => t.areaId === id)
    if (areaTasks.length === 0) return true
    const done = areaTasks.filter((t) => t.status === 'done').length
    return done / areaTasks.length >= 0.5 && areaTasks.filter(isOverdue).length === 0
  }).length

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

function computeAreaSummaries(tasks: Task[], kpis: Kpi[]): AreaSummary[] {
  return AREAS.map((area) => {
    const areaTasks = tasks.filter((t) => t.areaId === area.id)
    const areaKpis = kpis.filter((k) => k.areaId === area.id)
    const kpiProgress =
      areaKpis.length === 0
        ? 0
        : Math.round(
            areaKpis.reduce(
              (sum, k) => sum + Math.min(100, (k.value / Math.max(k.target, 1)) * 100),
              0,
            ) / areaKpis.length,
          )

    return {
      area,
      totalTasks: areaTasks.length,
      completedTasks: areaTasks.filter((t) => t.status === 'done').length,
      inProgressTasks: areaTasks.filter((t) => t.status === 'in_progress').length,
      blockedTasks: areaTasks.filter((t) => t.status === 'blocked').length,
      overdueTasks: areaTasks.filter(isOverdue).length,
      kpiProgress,
      criticalCount: areaTasks.filter((t) => t.priority === 'critical' && t.status !== 'done')
        .length,
    }
  })
}

function buildOverview(tasks: Task[], kpis: Kpi[], activity: ActivityItem[]): DashboardOverview {
  const stats = computeStats(tasks, kpis)
  const areaSummaries = computeAreaSummaries(tasks, kpis)

  const needsAttention = [...tasks]
    .filter((t) => t.status !== 'done' && (t.priority === 'critical' || isOverdue(t) || t.status === 'blocked'))
    .sort((a, b) => {
      const score = (t: Task) =>
        (t.priority === 'critical' ? 4 : t.priority === 'high' ? 3 : t.priority === 'medium' ? 2 : 1) +
        (isOverdue(t) ? 5 : 0) +
        (t.status === 'blocked' ? 3 : 0)
      return score(b) - score(a)
    })
    .slice(0, 8)

  const statusKeys: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done']
  const statusDistribution = statusKeys.map((s) => ({
    name: s,
    value: tasks.filter((t) => t.status === s).length,
    color: STATUS_COLORS[s],
  }))

  const priorityKeys: TaskPriority[] = ['low', 'medium', 'high', 'critical']
  const priorityDistribution = priorityKeys.map((p) => ({
    name: p,
    value: tasks.filter((t) => t.priority === p && t.status !== 'done').length,
    color: PRIORITY_COLORS[p],
  }))

  const areaProgress = AREAS.map((area, i) => {
    const areaTasks = tasks.filter((t) => t.areaId === area.id)
    return {
      name: area.name,
      completed: areaTasks.filter((t) => t.status === 'done').length,
      total: areaTasks.length,
      color: chartSeriesColor(i),
    }
  })

  return {
    stats,
    areaSummaries,
    needsAttention,
    recentActivity: [...activity].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
    statusDistribution,
    priorityDistribution,
    areaProgress,
  }
}

const defaultFilters: FilterState = {
  statuses: [],
  priorities: [],
  areaIds: [],
  search: '',
}

interface TrackerState {
  tasks: Task[]
  kpis: Kpi[]
  activity: ActivityItem[]
  filters: FilterState
  sidebarCollapsed: boolean
  loading: boolean

  setLoading: (v: boolean) => void
  setSidebarCollapsed: (v: boolean) => void
  setFilters: (partial: Partial<FilterState>) => void
  resetFilters: () => void

  getOverview: () => DashboardOverview
  getTasksByArea: (areaId: string) => Task[]
  getKpisByArea: (areaId: string) => Kpi[]
  getFilteredTasks: (areaId?: string) => Task[]
  getAreaBySlug: (slug: string) => (typeof AREAS)[number] | undefined

  addTask: (input: CreateTaskInput) => Task
  updateTask: (id: string, input: UpdateTaskInput) => Task | null
  deleteTask: (id: string) => void
  setTaskStatus: (id: string, status: TaskStatus) => Task | null

  addKpi: (input: CreateKpiInput) => Kpi
  updateKpi: (id: string, input: UpdateKpiInput) => Kpi | null
  deleteKpi: (id: string) => void

  importTasks: (rows: CreateTaskInput[]) => number
  pushActivity: (item: Omit<ActivityItem, 'id' | 'createdAt'> & { createdAt?: string }) => void
}

export const useTrackerStore = create<TrackerState>((set, get) => ({
  tasks: INITIAL_TASKS,
  kpis: INITIAL_KPIS,
  activity: INITIAL_ACTIVITY,
  filters: { ...defaultFilters },
  sidebarCollapsed: false,
  loading: false,

  setLoading: (v) => set({ loading: v }),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial } })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),

  getOverview: () => {
    const { tasks, kpis, activity } = get()
    return buildOverview(tasks, kpis, activity)
  },

  getTasksByArea: (areaId) => get().tasks.filter((t) => t.areaId === areaId),

  getKpisByArea: (areaId) => get().kpis.filter((k) => k.areaId === areaId),

  getAreaBySlug: (slug) => AREAS.find((a) => a.slug === slug),

  getFilteredTasks: (areaId) => {
    const { tasks, filters } = get()
    return tasks.filter((t) => {
      if (areaId && t.areaId !== areaId) return false
      if (filters.areaIds.length && !filters.areaIds.includes(t.areaId)) return false
      if (filters.statuses.length && !filters.statuses.includes(t.status)) return false
      if (filters.priorities.length && !filters.priorities.includes(t.priority)) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.description.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  },

  pushActivity: (item) => {
    const entry: ActivityItem = {
      id: uid('act'),
      createdAt: item.createdAt ?? new Date().toISOString(),
      areaId: item.areaId,
      type: item.type,
      message: item.message,
      actor: item.actor,
    }
    set((s) => ({ activity: [entry, ...s.activity].slice(0, 50) }))
  },

  addTask: (input) => {
    const now = new Date().toISOString()
    const task: Task = {
      id: uid('task'),
      ...input,
      createdAt: now,
      updatedAt: now,
    }
    set((s) => ({ tasks: [task, ...s.tasks] }))
    get().pushActivity({
      areaId: input.areaId,
      type: 'task_created',
      message: `Created "${input.title}"`,
      actor: 'You',
    })
    return task
  },

  updateTask: (id, input) => {
    const existing = get().tasks.find((t) => t.id === id)
    if (!existing) return null
    const updated: Task = { ...existing, ...input, updatedAt: new Date().toISOString() }
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) }))
    get().pushActivity({
      areaId: updated.areaId,
      type: 'task_updated',
      message: `Updated "${updated.title}"`,
      actor: 'You',
    })
    return updated
  },

  deleteTask: (id) => {
    const task = get().tasks.find((t) => t.id === id)
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
    if (task) {
      get().pushActivity({
        areaId: task.areaId,
        type: 'task_updated',
        message: `Deleted task "${task.title}"`,
        actor: 'System',
      })
    }
  },

  setTaskStatus: (id, status) => {
    const existing = get().tasks.find((t) => t.id === id)
    if (!existing) return null
    const updated: Task = { ...existing, status, updatedAt: new Date().toISOString() }
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) }))
    get().pushActivity({
      areaId: updated.areaId,
      type: status === 'done' ? 'task_completed' : 'status_change',
      message: `Set "${updated.title}" to ${status.replace('_', ' ')}`,
      actor: 'You',
    })
    return updated
  },

  addKpi: (input) => {
    const kpi: Kpi = {
      id: uid('kpi'),
      ...input,
      updatedAt: new Date().toISOString(),
    }
    set((s) => ({ kpis: [kpi, ...s.kpis] }))
    get().pushActivity({
      areaId: input.areaId,
      type: 'kpi_updated',
      message: `Added KPI "${input.name}"`,
      actor: 'System',
    })
    return kpi
  },

  updateKpi: (id, input) => {
    const existing = get().kpis.find((k) => k.id === id)
    if (!existing) return null
    const updated: Kpi = { ...existing, ...input, updatedAt: new Date().toISOString() }
    set((s) => ({ kpis: s.kpis.map((k) => (k.id === id ? updated : k)) }))
    get().pushActivity({
      areaId: updated.areaId,
      type: 'kpi_updated',
      message: `Updated KPI "${updated.name}" to ${updated.value}`,
      actor: 'System',
    })
    return updated
  },

  deleteKpi: (id) => {
    const kpi = get().kpis.find((k) => k.id === id)
    set((s) => ({ kpis: s.kpis.filter((k) => k.id !== id) }))
    if (kpi) {
      get().pushActivity({
        areaId: kpi.areaId,
        type: 'kpi_updated',
        message: `Deleted KPI "${kpi.name}"`,
        actor: 'System',
      })
    }
  },

  importTasks: (rows) => {
    const now = new Date().toISOString()
    const newTasks: Task[] = rows.map((row) => ({
      id: uid('task'),
      ...row,
      createdAt: now,
      updatedAt: now,
    }))
    set((s) => ({ tasks: [...newTasks, ...s.tasks] }))
    if (newTasks.length) {
      get().pushActivity({
        areaId: newTasks[0].areaId,
        type: 'task_created',
        message: `Imported ${newTasks.length} task(s) via CSV`,
        actor: 'System',
      })
    }
    return newTasks.length
  },
}))

export { AREAS }

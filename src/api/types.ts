export interface ApiResponse<T = unknown> {
  status: 'success' | 'error'
  response_code: number
  message: string
  data?: T
}

export interface Pi360User {
  usercode?: number
  name?: string
  email?: string
  username?: string
  avatar?: string
  account_type?: string
  dept_name?: string
  designation?: string
  [key: string]: unknown
}

/** Session user — from auth/me when API is live, or PI-360 login payload as fallback */
export interface AuthMeData {
  pi360: Pi360User | null
  name: string
  email: string
  avatar?: string
  role?: string
  designation?: string
}

export type AreaSlug =
  | 'strategy'
  | 'quality-assurance'
  | 'recruitment'
  | 'operational'
  | 'special-initiatives'
  | 'admissions'

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Area {
  id: string
  slug: AreaSlug
  name: string
  description: string
  color: string
  icon: string
}

export interface Task {
  id: string
  areaId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  createdAt: string
  updatedAt: string
}

export interface Kpi {
  id: string
  areaId: string
  name: string
  value: number
  target: number
  unit: string
  trend: number
  updatedAt: string
}

export interface ActivityItem {
  id: string
  areaId: string
  type: 'task_created' | 'task_updated' | 'task_completed' | 'kpi_updated' | 'status_change'
  message: string
  actor: string
  createdAt: string
}

export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  blockedTasks: number
  overdueTasks: number
  avgKpiProgress: number
  areasOnTrack: number
  criticalItems: number
}

export interface AreaSummary {
  area: Area
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  blockedTasks: number
  overdueTasks: number
  kpiProgress: number
  criticalCount: number
}

export interface DashboardOverview {
  stats: DashboardStats
  areaSummaries: AreaSummary[]
  needsAttention: Task[]
  recentActivity: ActivityItem[]
  statusDistribution: { name: string; value: number; color: string }[]
  priorityDistribution: { name: string; value: number; color: string }[]
  areaProgress: { name: string; completed: number; total: number; color: string }[]
}

export interface CreateTaskInput {
  areaId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
}

export type UpdateTaskInput = Partial<CreateTaskInput>

export interface CreateKpiInput {
  areaId: string
  name: string
  value: number
  target: number
  unit: string
  trend: number
}

export type UpdateKpiInput = Partial<CreateKpiInput>

export interface FilterState {
  statuses: TaskStatus[]
  priorities: TaskPriority[]
  areaIds: string[]
  search: string
}

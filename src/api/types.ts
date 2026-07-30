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
  /** Area ids the user may access (from API). Omit or empty = all areas (legacy). */
  allowedAreaIds?: string[]
}

export type PlanItemStatus = 'todo' | 'in_progress' | 'done' | 'blocked'

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface PlanItemStats {
  total: number
  done: number
  inProgress: number
  blocked: number
  progressPct: number
}

export interface SubArea {
  id: string
  areaId: string
  slug: string
  name: string
  description: string
  documentRef: string
  color: string
  icon: string
  sortOrder: number
  stats?: PlanItemStats
}

export interface SubAreaDetail extends SubArea {
  items: PlanItem[]
  stats: PlanItemStats
}

export interface PlanItem {
  id: string
  areaId: string
  subAreaId: string
  title: string
  description: string
  processOwner: string
  phase: string
  priority: TaskPriority
  status: PlanItemStatus
  targetDate: string
  documentRef: string
  checklist: ChecklistItem[]
  progressSource: string
  lastReviewDate: string
  sortOrder: number
  createdAt: string
  updatedAt: string
  updates?: ProgressUpdate[]
}

export interface ProgressUpdate {
  id: string
  planItemId: string
  meetingDate: string
  meetingSource: string
  status: PlanItemStatus
  notes: string
  checklist: ChecklistItem[]
  reportedBy: number | null
  reportedByName: string
  createdAt: string
}

export interface UpdatePlanItemInput {
  id: string
  title?: string
  description?: string
  processOwner?: string
  phase?: string
  priority?: TaskPriority
  status?: PlanItemStatus
  targetDate?: string
  checklist?: ChecklistItem[]
}

export interface RecordProgressInput {
  planItemId: string
  meetingDate?: string
  meetingSource?: string
  status: PlanItemStatus
  notes?: string
  checklist?: ChecklistItem[]
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

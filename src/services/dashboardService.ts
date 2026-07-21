import type { DashboardOverview, FilterState } from '../api/types'
import { api } from '../api/client'

export const dashboardService = {
  async getOverview(filters?: Partial<FilterState>): Promise<DashboardOverview> {
    const params: Record<string, string | undefined> = {}
    if (filters?.statuses?.length) params.statuses = filters.statuses.join(',')
    if (filters?.priorities?.length) params.priorities = filters.priorities.join(',')
    if (filters?.areaIds?.length) params.area_ids = filters.areaIds.join(',')
    if (filters?.search?.trim()) params.search = filters.search.trim()
    return api.get<DashboardOverview>('dashboard/overview', params)
  },
}

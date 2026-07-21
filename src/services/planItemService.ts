import type { PlanItem, RecordProgressInput, UpdatePlanItemInput } from '../api/types'
import { api } from '../api/client'

export const planItemService = {
  async list(subAreaId?: string, areaId?: string): Promise<PlanItem[]> {
    const params: Record<string, string> = {}
    if (subAreaId) params.sub_area_id = subAreaId
    if (areaId) params.area_id = areaId
    return api.get<PlanItem[]>('plan-items', params)
  },

  async getDetail(id: string) {
    return api.get<PlanItem>('plan-items/detail', { id })
  },

  async update(input: UpdatePlanItemInput): Promise<PlanItem> {
    return api.put<PlanItem>('plan-items/update', input)
  },

  async recordProgress(input: RecordProgressInput) {
    return api.post<{ item: PlanItem }>('plan-items/progress', input)
  },
}

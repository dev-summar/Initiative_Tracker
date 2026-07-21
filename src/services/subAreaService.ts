import type { SubArea, SubAreaDetail } from '../api/types'
import { api } from '../api/client'

export const subAreaService = {
  async list(areaId?: string): Promise<SubArea[]> {
    return api.get<SubArea[]>('sub-areas', areaId ? { area_id: areaId } : undefined)
  },

  async getBySlug(slug: string, areaId?: string): Promise<SubAreaDetail> {
    return api.get<SubAreaDetail>('sub-areas/detail', {
      slug,
      ...(areaId ? { area_id: areaId } : {}),
    })
  },
}

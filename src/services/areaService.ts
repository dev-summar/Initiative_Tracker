import type { Area, AreaSlug } from '../api/types'
import { api } from '../api/client'
import { AREAS } from '../data/mockData'

export const areaService = {
  async list(): Promise<Area[]> {
    try {
      return await api.get<Area[]>('areas')
    } catch {
      return AREAS
    }
  },

  async getBySlug(slug: AreaSlug | string): Promise<Area | undefined> {
    try {
      return await api.get<Area>('areas/detail', { slug })
    } catch {
      return AREAS.find((a) => a.slug === slug)
    }
  },
}

export { AREAS }

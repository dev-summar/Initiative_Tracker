import type { CreateKpiInput, Kpi, UpdateKpiInput } from '../api/types'
import { api } from '../api/client'

export const kpiService = {
  async list(areaId?: string): Promise<Kpi[]> {
    return api.get<Kpi[]>('kpis', areaId ? { area_id: areaId } : undefined)
  },

  async create(input: CreateKpiInput): Promise<Kpi> {
    return api.post<Kpi>('kpis', input)
  },

  async update(id: string, input: UpdateKpiInput): Promise<Kpi> {
    return api.put<Kpi>('kpis/update', { id, ...input })
  },

  async remove(id: string): Promise<void> {
    await api.delete<void>('kpis/delete', { id })
  },

  async importCsv(rows: CreateKpiInput[]): Promise<number> {
    const res = await api.post<{ count: number }>('kpis/import', { rows })
    return res.count
  },
}

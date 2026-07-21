import type { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from '../api/types'
import { api } from '../api/client'

export const taskService = {
  async list(areaId?: string): Promise<Task[]> {
    return api.get<Task[]>('tasks', areaId ? { area_id: areaId } : undefined)
  },

  async getFiltered(areaId?: string, filters?: {
    statuses?: string[]
    priorities?: string[]
    areaIds?: string[]
    search?: string
  }): Promise<Task[]> {
    const params: Record<string, string | undefined> = {}
    if (areaId) params.area_id = areaId
    if (filters?.search) params.search = filters.search
    if (filters?.statuses?.length) params.statuses = filters.statuses.join(',')
    if (filters?.priorities?.length) params.priorities = filters.priorities.join(',')
    if (filters?.areaIds?.length) params.area_ids = filters.areaIds.join(',')
    return api.get<Task[]>('tasks/filtered', params)
  },

  async create(input: CreateTaskInput): Promise<Task> {
    return api.post<Task>('tasks', input)
  },

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    return api.put<Task>('tasks/update', { id, ...input })
  },

  async remove(id: string): Promise<void> {
    await api.delete<void>('tasks/delete', { id })
  },

  async setStatus(id: string, status: TaskStatus): Promise<Task> {
    return api.put<Task>('tasks/status', { id, status })
  },

  async importCsv(rows: CreateTaskInput[]): Promise<number> {
    const res = await api.post<{ count: number }>('tasks/import', { rows })
    return res.count
  },
}

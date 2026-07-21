import { ActivityModel, formatActivity } from '../models/Activity.js'
import { newId } from '../utils/id.js'

export async function logActivity(
  areaId: string,
  type: string,
  message: string,
  actor = 'System',
) {
  await ActivityModel.create({
    id: newId('act'),
    areaId,
    type,
    message,
    actor,
  })
}

export async function recentActivity(limit = 20) {
  const capped = Math.max(1, Math.min(50, limit))
  const rows = await ActivityModel.find().sort({ createdAt: -1 }).limit(capped).lean()
  return rows.map((row) => formatActivity(row as Record<string, unknown>))
}

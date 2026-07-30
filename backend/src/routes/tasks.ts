import { Router } from 'express'
import { AreaModel } from '../models/Area.js'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TaskModel,
  formatTask,
  isOverdue,
} from '../models/Task.js'
import { actorName } from '../middleware/auth.js'
import { denyUnlessAreaAccess, resolveAreaScope, userAllowedAreaIds } from '../middleware/areaAccess.js'
import { logActivity } from '../services/activityService.js'
import { newId } from '../utils/id.js'
import { sendError, sendSuccess } from '../utils/response.js'

const router = Router()

async function getTaskById(id: string) {
  const doc = await TaskModel.findOne({ id, deletedAt: null }).lean()
  if (!doc) return null
  return formatTask(doc as Record<string, unknown>)
}

router.get('/', async (req, res) => {
  const areaId = String(req.query.area_id ?? '').trim()
  const scope = resolveAreaScope(req, res, areaId || undefined)
  if (!scope) return

  const filter: Record<string, unknown> = { deletedAt: null, areaId: { $in: scope } }

  const rows = await TaskModel.find(filter).sort({ updatedAt: -1 }).lean()
  const data = rows.map((t) => formatTask(t as Record<string, unknown>))
  return sendSuccess(res, 200, 'OK', data)
})

router.get('/filtered', async (req, res) => {
  const areaId = String(req.query.area_id ?? '').trim()
  const search = String(req.query.search ?? '').trim().toLowerCase()
  const statuses = String(req.query.statuses ?? '')
    .split(',')
    .filter(Boolean)
  const priorities = String(req.query.priorities ?? '')
    .split(',')
    .filter(Boolean)
  const requestedAreaIds = String(req.query.area_ids ?? '')
    .split(',')
    .filter(Boolean)

  const scope = resolveAreaScope(req, res, areaId || undefined)
  if (!scope) return

  const filter: Record<string, unknown> = { deletedAt: null, areaId: { $in: scope } }

  const rows = await TaskModel.find(filter).sort({ updatedAt: -1 }).lean()
  let tasks = rows.map((t) => formatTask(t as Record<string, unknown>))

  if (statuses.length) {
    tasks = tasks.filter((t) => statuses.includes(t.status))
  }
  if (priorities.length) {
    tasks = tasks.filter((t) => priorities.includes(t.priority))
  }
  if (requestedAreaIds.length) {
    const allowed = userAllowedAreaIds(req)
    const scoped = requestedAreaIds.filter((id) => allowed.includes(id))
    tasks = tasks.filter((t) => scoped.includes(t.areaId))
  }
  if (search) {
    tasks = tasks.filter((t) => {
      const hay = `${t.title} ${t.description}`.toLowerCase()
      return hay.includes(search)
    })
  }

  return sendSuccess(res, 200, 'OK', tasks)
})

router.post('/', async (req, res) => {
  const body = req.body ?? {}
  const title = String(body.title ?? '').trim()
  if (!title) return sendError(res, 422, 'Task title is required.')
  if (!body.areaId) return sendError(res, 422, 'Area is required.')

  const area = await AreaModel.findOne({ id: body.areaId }).lean()
  if (!area) return sendError(res, 422, 'Invalid area.')
  if (denyUnlessAreaAccess(req, res, body.areaId)) return

  const status = body.status ?? 'todo'
  const priority = body.priority ?? 'medium'
  if (!TASK_STATUSES.includes(status)) return sendError(res, 422, 'Invalid status.')
  if (!TASK_PRIORITIES.includes(priority)) return sendError(res, 422, 'Invalid priority.')

  const id = newId('task')
  const dueDate = String(body.dueDate ?? new Date().toISOString().slice(0, 10)).slice(0, 10)
  const actor = actorName(req.user!)

  await TaskModel.create({
    id,
    areaId: body.areaId,
    title,
    description: String(body.description ?? ''),
    status,
    priority,
    dueDate,
    createdBy: req.user!.usercode,
  })

  await logActivity(body.areaId, 'task_created', `${actor} created "${title}"`, actor)

  const task = await getTaskById(id)
  return sendSuccess(res, 201, 'Task created.', task)
})

router.put('/update', async (req, res) => {
  const body = req.body ?? {}
  const id = String(body.id ?? '')
  if (!id) return sendError(res, 422, 'id is required.')

  const existing = await TaskModel.findOne({ id, deletedAt: null })
  if (!existing) return sendError(res, 404, 'Task not found.')
  if (denyUnlessAreaAccess(req, res, existing.areaId)) return

  const merged = {
    areaId: body.areaId ?? existing.areaId,
    title: body.title ?? existing.title,
    description: body.description ?? existing.description,
    status: body.status ?? existing.status,
    priority: body.priority ?? existing.priority,
    dueDate: String(body.dueDate ?? existing.dueDate).slice(0, 10),
  }

  if (!String(merged.title).trim()) return sendError(res, 422, 'Task title is required.')
  if (!TASK_STATUSES.includes(merged.status)) return sendError(res, 422, 'Invalid status.')
  if (!TASK_PRIORITIES.includes(merged.priority)) return sendError(res, 422, 'Invalid priority.')
  if (merged.areaId !== existing.areaId && denyUnlessAreaAccess(req, res, merged.areaId)) return

  existing.areaId = merged.areaId
  existing.title = merged.title
  existing.description = merged.description
  existing.status = merged.status
  existing.priority = merged.priority
  existing.dueDate = merged.dueDate
  await existing.save()

  const actor = actorName(req.user!)
  await logActivity(
    merged.areaId,
    'task_updated',
    `${actor} updated "${merged.title}"`,
    actor,
  )

  const task = await getTaskById(id)
  return sendSuccess(res, 200, 'Task updated.', task)
})

router.put('/status', async (req, res) => {
  const body = req.body ?? {}
  const id = String(body.id ?? '')
  const status = String(body.status ?? '')
  if (!id || !status) return sendError(res, 422, 'id and status are required.')
  if (!TASK_STATUSES.includes(status as (typeof TASK_STATUSES)[number])) {
    return sendError(res, 422, 'Invalid status.')
  }

  const existing = await TaskModel.findOne({ id, deletedAt: null })
  if (!existing) return sendError(res, 404, 'Task not found.')
  if (denyUnlessAreaAccess(req, res, existing.areaId)) return

  existing.status = status
  await existing.save()

  const actor = actorName(req.user!)
  const type = status === 'done' ? 'task_completed' : 'status_change'
  await logActivity(
    existing.areaId,
    type,
    `${actor} set "${existing.title}" to ${status.replace('_', ' ')}`,
    actor,
  )

  const task = await getTaskById(id)
  return sendSuccess(res, 200, 'Status updated.', task)
})

router.delete('/delete', async (req, res) => {
  const id = String(req.query.id ?? req.body?.id ?? '').trim()
  if (!id) return sendError(res, 422, 'id is required.')

  const existing = await TaskModel.findOne({ id, deletedAt: null })
  if (!existing) return sendError(res, 404, 'Task not found.')
  if (denyUnlessAreaAccess(req, res, existing.areaId)) return

  existing.deletedAt = new Date()
  await existing.save()

  const actor = actorName(req.user!)
  await logActivity(
    existing.areaId,
    'task_updated',
    `Deleted task "${existing.title}"`,
    actor,
  )

  return sendSuccess(res, 200, 'Task deleted.')
})

router.post('/import', async (req, res) => {
  const rows = req.body?.rows
  if (!Array.isArray(rows)) return sendError(res, 422, 'rows must be an array.')

  let count = 0
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    const title = String(row.title ?? '').trim()
    if (!title || !row.areaId) continue

    const area = await AreaModel.findOne({ id: row.areaId }).lean()
    if (!area) continue
    if (!userAllowedAreaIds(req).includes(row.areaId)) continue

    const id = newId('task')
    const dueDate = String(row.dueDate ?? new Date().toISOString().slice(0, 10)).slice(0, 10)
    const actor = actorName(req.user!)

    await TaskModel.create({
      id,
      areaId: row.areaId,
      title,
      description: String(row.description ?? ''),
      status: row.status ?? 'todo',
      priority: row.priority ?? 'medium',
      dueDate,
      createdBy: req.user!.usercode,
    })

    await logActivity(row.areaId, 'task_created', `${actor} created "${title}"`, actor)
    count++
  }

  return sendSuccess(res, 200, 'Tasks imported.', { count })
})

export { isOverdue }
export default router

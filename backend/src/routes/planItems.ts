import { Router } from 'express'
import { PLAN_PRIORITIES, PLAN_STATUSES, PlanItemModel, formatPlanItem } from '../models/PlanItem.js'
import { ProgressUpdateModel, formatProgressUpdate } from '../models/ProgressUpdate.js'
import { actorName } from '../middleware/auth.js'
import { newId } from '../utils/id.js'
import { sendError, sendSuccess } from '../utils/response.js'

const router = Router()

async function getPlanItemById(id: string) {
  const doc = await PlanItemModel.findOne({ id, deletedAt: null }).lean()
  if (!doc) return null
  return formatPlanItem(doc as Record<string, unknown>)
}

router.get('/', async (req, res) => {
  const subAreaId = String(req.query.sub_area_id ?? '').trim()
  const areaId = String(req.query.area_id ?? '').trim()
  const filter: Record<string, unknown> = { deletedAt: null }
  if (subAreaId) filter.subAreaId = subAreaId
  if (areaId) filter.areaId = areaId

  const rows = await PlanItemModel.find(filter).sort({ sortOrder: 1, updatedAt: -1 }).lean()
  const data = rows.map((r) => formatPlanItem(r as Record<string, unknown>))
  return sendSuccess(res, 200, 'OK', data)
})

router.get('/detail', async (req, res) => {
  const id = String(req.query.id ?? '').trim()
  if (!id) return sendError(res, 422, 'id is required.')

  const item = await getPlanItemById(id)
  if (!item) return sendError(res, 404, 'Plan item not found.')

  const updates = await ProgressUpdateModel.find({ planItemId: id })
    .sort({ meetingDate: -1, createdAt: -1 })
    .lean()

  return sendSuccess(res, 200, 'OK', {
    ...item,
    updates: updates.map((u) => formatProgressUpdate(u as Record<string, unknown>)),
  })
})

router.put('/update', async (req, res) => {
  const body = req.body ?? {}
  const id = String(body.id ?? '').trim()
  if (!id) return sendError(res, 422, 'Plan item id is required.')

  const doc = await PlanItemModel.findOne({ id, deletedAt: null })
  if (!doc) return sendError(res, 404, 'Plan item not found.')

  if (body.title !== undefined) {
    const title = String(body.title).trim()
    if (!title) return sendError(res, 422, 'Title cannot be empty.')
    doc.title = title
  }
  if (body.description !== undefined) doc.description = String(body.description)
  if (body.processOwner !== undefined) doc.processOwner = String(body.processOwner).trim()
  if (body.phase !== undefined) doc.phase = String(body.phase).trim()

  if (body.priority !== undefined) {
    if (!PLAN_PRIORITIES.includes(body.priority)) {
      return sendError(res, 422, `Invalid priority. Use: ${PLAN_PRIORITIES.join(', ')}`)
    }
    doc.priority = body.priority
  }

  if (body.targetDate !== undefined) doc.targetDate = String(body.targetDate).trim()
  if (body.documentRef !== undefined) doc.documentRef = String(body.documentRef).trim()

  if (body.status !== undefined) {
    if (!PLAN_STATUSES.includes(body.status)) {
      return sendError(res, 422, `Invalid status. Use: ${PLAN_STATUSES.join(', ')}`)
    }
    doc.status = body.status
  }

  if (Array.isArray(body.checklist)) {
    doc.checklist = body.checklist.map((c: Record<string, unknown>, i: number) => ({
      id: String(c.id ?? `chk-${i}`),
      label: String(c.label ?? ''),
      done: Boolean(c.done),
    }))
  }

  await doc.save()
  return sendSuccess(res, 200, 'Plan item updated.', formatPlanItem(doc.toObject() as Record<string, unknown>))
})

router.post('/progress', async (req, res) => {
  const body = req.body ?? {}
  const planItemId = String(body.planItemId ?? '').trim()
  if (!planItemId) return sendError(res, 422, 'planItemId is required.')

  const doc = await PlanItemModel.findOne({ id: planItemId, deletedAt: null })
  if (!doc) return sendError(res, 404, 'Plan item not found.')

  const meetingDate = String(body.meetingDate ?? new Date().toISOString().slice(0, 10)).trim()
  const status = body.status ?? doc.status
  if (!PLAN_STATUSES.includes(status)) {
    return sendError(res, 422, `Invalid status. Use: ${PLAN_STATUSES.join(', ')}`)
  }

  const checklist = Array.isArray(body.checklist)
    ? body.checklist.map((c: Record<string, unknown>, i: number) => ({
        id: String(c.id ?? `chk-${i}`),
        label: String(c.label ?? ''),
        done: Boolean(c.done),
      }))
    : doc.checklist

  const update = await ProgressUpdateModel.create({
    id: newId('prog'),
    planItemId,
    meetingDate,
    meetingSource: String(body.meetingSource ?? 'Manual update').trim(),
    status,
    notes: String(body.notes ?? '').trim(),
    checklist,
    reportedBy: req.user?.usercode ?? null,
    reportedByName: req.user ? actorName(req.user) : '',
  })

  doc.status = status
  doc.checklist = checklist
  doc.lastReviewDate = meetingDate
  if (body.progressSource) doc.progressSource = String(body.progressSource)
  await doc.save()

  return sendSuccess(res, 201, 'Progress recorded.', {
    item: formatPlanItem(doc.toObject() as Record<string, unknown>),
    update: formatProgressUpdate(update.toObject() as Record<string, unknown>),
  })
})

export default router

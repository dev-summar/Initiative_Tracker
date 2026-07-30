import { Router } from 'express'
import { SubAreaModel, formatSubArea } from '../models/SubArea.js'
import { PlanItemModel, formatPlanItem } from '../models/PlanItem.js'
import { denyUnlessAreaAccess, resolveAreaScope } from '../middleware/areaAccess.js'
import { sendError, sendSuccess } from '../utils/response.js'

const router = Router()

router.get('/', async (req, res) => {
  const areaId = String(req.query.area_id ?? '').trim()
  const scope = resolveAreaScope(req, res, areaId || undefined)
  if (!scope) return

  const filter: Record<string, unknown> = { areaId: { $in: scope } }

  const rows = await SubAreaModel.find(filter).sort({ sortOrder: 1, name: 1 }).lean()
  const subAreas = rows.map((r) => formatSubArea(r as Record<string, unknown>))

  const subAreaIds = subAreas.map((s) => s.id)
  const itemCounts = await PlanItemModel.aggregate([
    { $match: { subAreaId: { $in: subAreaIds }, deletedAt: null } },
    {
      $group: {
        _id: '$subAreaId',
        total: { $sum: 1 },
        done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        blocked: { $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] } },
      },
    },
  ])

  const countMap = new Map(itemCounts.map((c) => [c._id, c]))
  const data = subAreas.map((s) => {
    const c = countMap.get(s.id)
    const total = c?.total ?? 0
    const done = c?.done ?? 0
    return {
      ...s,
      stats: {
        total,
        done,
        inProgress: c?.inProgress ?? 0,
        blocked: c?.blocked ?? 0,
        progressPct: total === 0 ? 0 : Math.round((done / total) * 100),
      },
    }
  })

  return sendSuccess(res, 200, 'OK', data)
})

router.get('/detail', async (req, res) => {
  const slug = String(req.query.slug ?? '').trim()
  const areaId = String(req.query.area_id ?? '').trim()
  if (!slug) return sendError(res, 422, 'slug is required.')

  const filter: Record<string, unknown> = { slug }
  if (areaId) filter.areaId = areaId

  const row = await SubAreaModel.findOne(filter).lean()
  if (!row) return sendError(res, 404, 'Plan not found.')

  const subArea = formatSubArea(row as Record<string, unknown>)
  if (denyUnlessAreaAccess(req, res, subArea.areaId)) return

  const items = await PlanItemModel.find({ subAreaId: subArea.id, deletedAt: null })
    .sort({ sortOrder: 1, updatedAt: -1 })
    .lean()

  const formatted = items.map((i) => formatPlanItem(i as Record<string, unknown>))
  const total = formatted.length
  const done = formatted.filter((i) => i.status === 'done').length

  return sendSuccess(res, 200, 'OK', {
    ...subArea,
    stats: {
      total,
      done,
      inProgress: formatted.filter((i) => i.status === 'in_progress').length,
      blocked: formatted.filter((i) => i.status === 'blocked').length,
      progressPct: total === 0 ? 0 : Math.round((done / total) * 100),
    },
    items: formatted,
  })
})

export default router

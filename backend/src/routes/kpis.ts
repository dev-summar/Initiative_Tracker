import { Router } from 'express'
import { AreaModel } from '../models/Area.js'
import { KpiModel, formatKpi } from '../models/Kpi.js'
import { actorName } from '../middleware/auth.js'
import { denyUnlessAreaAccess, resolveAreaScope, userAllowedAreaIds } from '../middleware/areaAccess.js'
import { logActivity } from '../services/activityService.js'
import { newId } from '../utils/id.js'
import { sendError, sendSuccess } from '../utils/response.js'

const router = Router()

async function getKpiById(id: string) {
  const doc = await KpiModel.findOne({ id, deletedAt: null }).lean()
  if (!doc) return null
  return formatKpi(doc as Record<string, unknown>)
}

router.get('/', async (req, res) => {
  const areaId = String(req.query.area_id ?? '').trim()
  const scope = resolveAreaScope(req, res, areaId || undefined)
  if (!scope) return

  const filter: Record<string, unknown> = { deletedAt: null, areaId: { $in: scope } }

  const rows = await KpiModel.find(filter).sort({ updatedAt: -1 }).lean()
  const data = rows.map((k) => formatKpi(k as Record<string, unknown>))
  return sendSuccess(res, 200, 'OK', data)
})

router.post('/', async (req, res) => {
  const body = req.body ?? {}
  const name = String(body.name ?? '').trim()
  if (!name) return sendError(res, 422, 'KPI name is required.')
  if (!body.areaId) return sendError(res, 422, 'Area is required.')

  const area = await AreaModel.findOne({ id: body.areaId }).lean()
  if (!area) return sendError(res, 422, 'Invalid area.')
  if (denyUnlessAreaAccess(req, res, body.areaId)) return

  const id = newId('kpi')
  const actor = actorName(req.user!)

  await KpiModel.create({
    id,
    areaId: body.areaId,
    name,
    value: Number(body.value ?? 0),
    target: Number(body.target ?? 100),
    unit: String(body.unit ?? '%'),
    trend: Number(body.trend ?? 0),
    period: String(body.period ?? ''),
  })

  await logActivity(body.areaId, 'kpi_updated', `Added KPI "${name}"`, actor)

  const kpi = await getKpiById(id)
  return sendSuccess(res, 201, 'KPI created.', kpi)
})

router.put('/update', async (req, res) => {
  const body = req.body ?? {}
  const id = String(body.id ?? '')
  if (!id) return sendError(res, 422, 'id is required.')

  const existing = await KpiModel.findOne({ id, deletedAt: null })
  if (!existing) return sendError(res, 404, 'KPI not found.')
  if (denyUnlessAreaAccess(req, res, existing.areaId)) return

  const nextAreaId = body.areaId ?? existing.areaId
  if (nextAreaId !== existing.areaId && denyUnlessAreaAccess(req, res, nextAreaId)) return

  existing.areaId = nextAreaId
  existing.name = body.name ?? existing.name
  existing.value = body.value !== undefined ? Number(body.value) : existing.value
  existing.target = body.target !== undefined ? Number(body.target) : existing.target
  existing.unit = body.unit ?? existing.unit
  existing.trend = body.trend !== undefined ? Number(body.trend) : existing.trend
  existing.period = body.period ?? existing.period

  if (!String(existing.name).trim()) return sendError(res, 422, 'KPI name is required.')
  await existing.save()

  const actor = actorName(req.user!)
  await logActivity(
    existing.areaId,
    'kpi_updated',
    `Updated KPI "${existing.name}" to ${existing.value}`,
    actor,
  )

  const kpi = await getKpiById(id)
  return sendSuccess(res, 200, 'KPI updated.', kpi)
})

router.delete('/delete', async (req, res) => {
  const id = String(req.query.id ?? req.body?.id ?? '').trim()
  if (!id) return sendError(res, 422, 'id is required.')

  const existing = await KpiModel.findOne({ id, deletedAt: null })
  if (!existing) return sendError(res, 404, 'KPI not found.')
  if (denyUnlessAreaAccess(req, res, existing.areaId)) return

  existing.deletedAt = new Date()
  await existing.save()

  const actor = actorName(req.user!)
  await logActivity(
    existing.areaId,
    'kpi_updated',
    `Deleted KPI "${existing.name}"`,
    actor,
  )

  return sendSuccess(res, 200, 'KPI deleted.')
})

router.post('/import', async (req, res) => {
  const rows = req.body?.rows
  if (!Array.isArray(rows)) return sendError(res, 422, 'rows must be an array.')

  let count = 0
  const actor = actorName(req.user!)

  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    const name = String(row.name ?? '').trim()
    if (!name || !row.areaId) continue

    const area = await AreaModel.findOne({ id: row.areaId }).lean()
    if (!area) continue
    if (!userAllowedAreaIds(req).includes(row.areaId)) continue

    const id = newId('kpi')
    await KpiModel.create({
      id,
      areaId: row.areaId,
      name,
      value: Number(row.value ?? 0),
      target: Number(row.target ?? 100),
      unit: String(row.unit ?? '%'),
      trend: Number(row.trend ?? 0),
      period: String(row.period ?? ''),
    })

    await logActivity(row.areaId, 'kpi_updated', `Added KPI "${name}"`, actor)
    count++
  }

  return sendSuccess(res, 200, 'KPIs imported.', { count })
})

export default router

import { Router } from 'express'
import { AreaModel, formatArea } from '../models/Area.js'
import { sendError, sendSuccess } from '../utils/response.js'

const router = Router()

router.get('/', async (_req, res) => {
  const rows = await AreaModel.find().sort({ sortOrder: 1, name: 1 }).lean()
  const data = rows.map((a) => formatArea(a as Record<string, unknown>))
  return sendSuccess(res, 200, 'OK', data)
})

router.get('/detail', async (req, res) => {
  const slug = String(req.query.slug ?? '').trim()
  if (!slug) {
    return sendError(res, 422, 'slug is required.')
  }
  const row = await AreaModel.findOne({ slug }).lean()
  if (!row) {
    return sendError(res, 404, 'Area not found.')
  }
  return sendSuccess(res, 200, 'OK', formatArea(row as Record<string, unknown>))
})

export default router

import { Router } from 'express'
import { getDashboardOverview } from '../services/dashboardService.js'
import { sendSuccess } from '../utils/response.js'

const router = Router()

function csvParam(value: unknown): string[] {
  return String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

router.get('/overview', async (req, res) => {
  const data = await getDashboardOverview({
    statuses: csvParam(req.query.statuses),
    priorities: csvParam(req.query.priorities),
    areaIds: csvParam(req.query.area_ids),
  })
  return sendSuccess(res, 200, 'OK', data)
})

export default router

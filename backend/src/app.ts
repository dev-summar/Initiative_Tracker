import express, { type Express } from 'express'
import { connectDb } from './config/db.js'
import { corsMiddleware } from './middleware/cors.js'
import { requireAuth, requireManager } from './middleware/auth.js'
import authRoutes from './routes/auth.js'
import areasRoutes from './routes/areas.js'
import subAreasRoutes from './routes/subAreas.js'
import planItemsRoutes from './routes/planItems.js'
import tasksRoutes from './routes/tasks.js'
import kpisRoutes from './routes/kpis.js'
import dashboardRoutes from './routes/dashboard.js'
import { sendError } from './utils/response.js'

export function createApp(): Express {
  const app = express()

  app.use(corsMiddleware)
  app.use(express.json({ limit: '1mb' }))

  app.use(async (_req, _res, next) => {
    try {
      await connectDb()
      next()
    } catch (err) {
      next(err)
    }
  })

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'success',
      response_code: 200,
      message: 'Initiative Tracker API is running.',
      data: { version: '1.0.0' },
    })
  })

  const api = express.Router()
  api.use(requireAuth)
  api.use(requireManager)

  api.use('/auth', authRoutes)
  api.use('/areas', areasRoutes)
  api.use('/sub-areas', subAreasRoutes)
  api.use('/plan-items', planItemsRoutes)
  api.use('/tasks', tasksRoutes)
  api.use('/kpis', kpisRoutes)
  api.use('/dashboard', dashboardRoutes)

  app.use('/api', api)

  app.use((_req, res) => {
    sendError(res, 404, 'Route not found.')
  })

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('API error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error.'
    sendError(res, 500, message)
  })

  return app
}

import type { Request, Response, NextFunction } from 'express'

export function corsMiddleware(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Accept, X-Requested-With, X-Requested-By',
  )
  res.setHeader('Access-Control-Expose-Headers', 'X-Refreshed-Token, Content-Disposition')
  res.setHeader('Access-Control-Max-Age', '86400')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Vary', 'Authorization')

  if (_req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  next()
}

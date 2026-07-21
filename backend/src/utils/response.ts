import type { Response } from 'express'

export interface ApiEnvelope<T = unknown> {
  status: 'success' | 'error'
  response_code: number
  message: string
  data?: T
}

export function sendSuccess<T>(res: Response, code: number, message: string, data?: T) {
  const body: ApiEnvelope<T> = { status: 'success', response_code: code, message }
  if (data !== undefined) body.data = data
  return res.status(code).json(body)
}

export function sendError(res: Response, code: number, message: string, data?: unknown) {
  const body: ApiEnvelope = { status: 'error', response_code: code, message }
  if (data !== undefined) body.data = data
  return res.status(code).json(body)
}

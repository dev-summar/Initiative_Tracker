import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config()

const PI360_JWT_SECRET = 'auth@pi360.net#54321!!'

/** dotenv treats `#` as a comment unless the value is quoted. */
function resolveJwtSecret(): string {
  const fromEnv = process.env.JWT_SECRET?.trim()
  if (!fromEnv) return PI360_JWT_SECRET
  if (fromEnv === 'auth@pi360.net') return PI360_JWT_SECRET
  return fromEnv.replace(/^["']|["']$/g, '')
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  mongodbUri: process.env.MONGODB_URI ?? '',
  jwtSecret: resolveJwtSecret(),
  jwtIssuer: process.env.JWT_ISSUER ?? 'https://pi360.net',
  jwtAudience: process.env.JWT_AUDIENCE ?? 'Pi360-User',
  nodeEnv: process.env.NODE_ENV ?? 'development',
}

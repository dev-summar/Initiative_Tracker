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

const DEFAULT_ALLOWED_EMAILS = [
  'sahil@mietjammu.in',
  'rohin.adm@mietjammu.in',
  'summar.adm@mietjammu.in',
]

function resolveAllowedEmails(): Set<string> {
  const raw = process.env.ALLOWED_LOGIN_EMAILS?.trim()
  const list = raw
    ? raw.split(/[,;\s]+/).map((e) => e.trim().toLowerCase()).filter(Boolean)
    : DEFAULT_ALLOWED_EMAILS
  return new Set(list)
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  mongodbUri: process.env.MONGODB_URI ?? '',
  jwtSecret: resolveJwtSecret(),
  jwtIssuer: process.env.JWT_ISSUER ?? 'https://pi360.net',
  jwtAudience: process.env.JWT_AUDIENCE ?? 'Pi360-User',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  allowedLoginEmails: resolveAllowedEmails(),
}

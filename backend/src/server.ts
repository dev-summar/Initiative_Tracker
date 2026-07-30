import { createApp } from './app.js'
import { env } from './config/env.js'
import { connectDb } from './config/db.js'

const app = createApp()

async function start() {
  await connectDb()
  app.listen(env.port, '127.0.0.1', () => {
    console.log(`Initiative Tracker API listening on http://127.0.0.1:${env.port}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})

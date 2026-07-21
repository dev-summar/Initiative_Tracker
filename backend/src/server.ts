import { createApp } from './app.js'
import { env } from './config/env.js'
import { connectDb } from './config/db.js'

const app = createApp()

async function start() {
  await connectDb()
  app.listen(env.port, () => {
    console.log(`Initiative Tracker API listening on http://localhost:${env.port}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})

import { connectDb } from './config/db.js'
import { ActivityModel } from './models/Activity.js'
import { KpiModel } from './models/Kpi.js'
import { TaskModel } from './models/Task.js'
import { DEMO_ID_PREFIX } from './demo/demoData.js'

const demoFilter = { id: { $regex: `^${DEMO_ID_PREFIX}` } }

async function clearDemo() {
  await connectDb()

  const [tasks, kpis, activity] = await Promise.all([
    TaskModel.deleteMany(demoFilter),
    KpiModel.deleteMany(demoFilter),
    ActivityModel.deleteMany(demoFilter),
  ])

  console.log('Demo data removed:')
  console.log(`  ${tasks.deletedCount} tasks`)
  console.log(`  ${kpis.deletedCount} KPIs`)
  console.log(`  ${activity.deletedCount} activity rows`)
  console.log('\nAreas were not touched. Re-seed demo with: npm run seed:demo')
  process.exit(0)
}

clearDemo().catch((err) => {
  console.error('Clear demo failed:', err)
  process.exit(1)
})

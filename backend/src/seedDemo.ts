import { connectDb } from './config/db.js'
import { ActivityModel } from './models/Activity.js'
import { KpiModel } from './models/Kpi.js'
import { TaskModel } from './models/Task.js'
import { DEMO_ACTIVITY, DEMO_KPIS, DEMO_TASKS } from './demo/demoData.js'

async function seedDemo() {
  await connectDb()

  let tasks = 0
  let kpis = 0
  let activity = 0

  for (const task of DEMO_TASKS) {
    await TaskModel.findOneAndUpdate(
      { id: task.id },
      { ...task, deletedAt: null, createdBy: null },
      { upsert: true, new: true },
    )
    tasks++
    console.log(`  task: ${task.title}`)
  }

  for (const kpi of DEMO_KPIS) {
    await KpiModel.findOneAndUpdate(
      { id: kpi.id },
      { ...kpi, deletedAt: null },
      { upsert: true, new: true },
    )
    kpis++
    console.log(`  kpi: ${kpi.name}`)
  }

  for (const item of DEMO_ACTIVITY) {
    await ActivityModel.findOneAndUpdate(
      { id: item.id },
      item,
      { upsert: true, new: true },
    )
    activity++
    console.log(`  activity: ${item.message}`)
  }

  console.log(`\nDone — demo data seeded: ${tasks} tasks, ${kpis} KPIs, ${activity} activity rows.`)
  console.log('Remove anytime with: npm run clear:demo')
  process.exit(0)
}

seedDemo().catch((err) => {
  console.error('Demo seed failed:', err)
  process.exit(1)
})

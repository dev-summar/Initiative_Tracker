import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectDb } from './config/db.js'
import { AreaModel } from './models/Area.js'
import { SubAreaModel } from './models/SubArea.js'
import { PlanItemModel } from './models/PlanItem.js'
import { STRATEGY_AREA } from './data/strategicPlanData.js'
import { LEGACY_AREAS } from './data/legacyAreas.js'
import { buildPlansFromDocs } from './sync/generatePlanSeed.js'
import { inferPlanItemPriority } from './utils/planPriority.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const generatedPath = path.join(__dirname, 'data/strategicPlanData.generated.json')

function loadPlans() {
  if (fs.existsSync(generatedPath)) {
    return JSON.parse(fs.readFileSync(generatedPath, 'utf8')) as Array<{
      id: string
      slug: string
      name: string
      description: string
      documentRef: string
      color: string
      icon: string
      sortOrder: number
      items: Array<{
        title: string
        description?: string
        processOwner?: string
        phase?: string
        priority?: string
        status?: string
        documentRef?: string
        progressSource?: string
        lastReviewDate?: string
      }>
    }>
  }
  console.log('No generated JSON — building from PDF text...')
  return buildPlansFromDocs()
}

async function seedStrategicPlan() {
  await connectDb()

  await AreaModel.findOneAndUpdate({ id: STRATEGY_AREA.id }, STRATEGY_AREA, { upsert: true, new: true })
  console.log(`Seeded area: ${STRATEGY_AREA.name}`)

  for (const area of LEGACY_AREAS) {
    await AreaModel.findOneAndUpdate({ id: area.id }, area, { upsert: true, new: true })
    console.log(`Seeded area: ${area.name}`)
  }

  const STRATEGIC_SUB_AREAS = loadPlans()
  const validIds: string[] = []
  let itemCount = 0

  for (const plan of STRATEGIC_SUB_AREAS) {
    const { items, ...subArea } = plan
    await SubAreaModel.findOneAndUpdate(
      { id: subArea.id },
      { ...subArea, areaId: STRATEGY_AREA.id },
      { upsert: true, new: true },
    )
    console.log(`  Plan: ${subArea.name} (${items.length} items)`)

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const id = `pi-${subArea.id}-${String(i + 1).padStart(4, '0')}`
      validIds.push(id)

      const phase = item.phase ?? 'Phase 1'
      const status = item.status ?? 'todo'

      await PlanItemModel.findOneAndUpdate(
        { id },
        {
          id,
          areaId: STRATEGY_AREA.id,
          subAreaId: subArea.id,
          title: item.title,
          description: item.description ?? '',
          processOwner: item.processOwner ?? '',
          phase,
          priority: item.priority ?? inferPlanItemPriority(phase, status),
          status,
          documentRef: item.documentRef ?? subArea.documentRef,
          progressSource: item.progressSource ?? '',
          lastReviewDate: item.lastReviewDate ?? '',
          checklist: [],
          sortOrder: i + 1,
          deletedAt: null,
        },
        { upsert: true, new: true },
      )
      itemCount++
    }
  }

  await PlanItemModel.deleteMany({ areaId: STRATEGY_AREA.id, id: { $nin: validIds } })

  console.log(`Done — ${STRATEGIC_SUB_AREAS.length} plans, ${itemCount} plan items seeded.`)
  process.exit(0)
}

seedStrategicPlan().catch((err) => {
  console.error('Strategic plan seed failed:', err)
  process.exit(1)
})

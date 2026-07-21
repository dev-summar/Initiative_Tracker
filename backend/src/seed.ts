import { connectDb } from './config/db.js'
import { AreaModel } from './models/Area.js'
import { STRATEGY_AREA } from './data/strategicPlanData.js'
import { LEGACY_AREAS } from './data/legacyAreas.js'

async function seed() {
  await connectDb()

  await AreaModel.findOneAndUpdate({ id: STRATEGY_AREA.id }, STRATEGY_AREA, { upsert: true, new: true })
  console.log(`Seeded area: ${STRATEGY_AREA.name}`)

  for (const area of LEGACY_AREAS) {
    await AreaModel.findOneAndUpdate({ id: area.id }, area, { upsert: true, new: true })
    console.log(`Seeded area: ${area.name}`)
  }

  console.log('Run npm run seed:strategic for full strategic plan data from PDFs.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})

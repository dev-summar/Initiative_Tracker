import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const kpiSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    areaId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    value: { type: Number, default: 0 },
    target: { type: Number, default: 100 },
    unit: { type: String, default: '%' },
    trend: { type: Number, default: 0 },
    period: { type: String, default: '' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export type KpiDoc = InferSchemaType<typeof kpiSchema> & {
  _id: mongoose.Types.ObjectId
  updatedAt: Date
}

export const KpiModel = mongoose.models.Kpi ?? mongoose.model('Kpi', kpiSchema)

export function formatKpi(doc: Record<string, unknown>) {
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt ?? '')
  return {
    id: String(doc.id),
    areaId: String(doc.areaId),
    name: String(doc.name),
    value: Number(doc.value ?? 0),
    target: Number(doc.target ?? 100),
    unit: String(doc.unit ?? '%'),
    trend: Number(doc.trend ?? 0),
    period: String(doc.period ?? ''),
    updatedAt,
  }
}

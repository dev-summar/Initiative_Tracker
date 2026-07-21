import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const areaSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    color: { type: String, default: '#A78BFA' },
    icon: { type: String, default: 'Compass' },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export type AreaDoc = InferSchemaType<typeof areaSchema> & { _id: mongoose.Types.ObjectId }

export const AreaModel = mongoose.models.Area ?? mongoose.model('Area', areaSchema)

export function formatArea(doc: Record<string, unknown>) {
  return {
    id: String(doc.id),
    slug: String(doc.slug),
    name: String(doc.name),
    description: String(doc.description ?? ''),
    color: String(doc.color ?? '#A78BFA'),
    icon: String(doc.icon ?? 'Compass'),
  }
}

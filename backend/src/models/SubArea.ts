import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const subAreaSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    areaId: { type: String, required: true, index: true },
    slug: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    documentRef: { type: String, default: '' },
    color: { type: String, default: '#A78BFA' },
    icon: { type: String, default: 'FileText' },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
)

subAreaSchema.index({ areaId: 1, slug: 1 }, { unique: true })

export type SubAreaDoc = InferSchemaType<typeof subAreaSchema> & { _id: mongoose.Types.ObjectId }

export const SubAreaModel = mongoose.models.SubArea ?? mongoose.model('SubArea', subAreaSchema)

export function formatSubArea(doc: Record<string, unknown>) {
  return {
    id: String(doc.id),
    areaId: String(doc.areaId),
    slug: String(doc.slug),
    name: String(doc.name),
    description: String(doc.description ?? ''),
    documentRef: String(doc.documentRef ?? ''),
    color: String(doc.color ?? '#A78BFA'),
    icon: String(doc.icon ?? 'FileText'),
    sortOrder: Number(doc.sortOrder ?? 0),
  }
}

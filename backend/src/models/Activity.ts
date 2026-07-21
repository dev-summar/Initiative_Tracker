import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const ACTIVITY_TYPES = [
  'task_created',
  'task_updated',
  'task_completed',
  'kpi_updated',
  'status_change',
] as const

const activitySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    areaId: { type: String, required: true, index: true },
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    message: { type: String, required: true },
    actor: { type: String, default: 'System' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

export type ActivityDoc = InferSchemaType<typeof activitySchema> & {
  _id: mongoose.Types.ObjectId
  createdAt: Date
}

export const ActivityModel =
  mongoose.models.Activity ?? mongoose.model('Activity', activitySchema)

export function formatActivity(doc: Record<string, unknown>) {
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt ?? '')
  return {
    id: String(doc.id),
    areaId: String(doc.areaId),
    type: String(doc.type),
    message: String(doc.message),
    actor: String(doc.actor ?? 'System'),
    createdAt,
  }
}

export { ACTIVITY_TYPES }

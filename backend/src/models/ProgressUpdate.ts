import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const checklistItemSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { _id: false },
)

const progressUpdateSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    planItemId: { type: String, required: true, index: true },
    meetingDate: { type: String, required: true },
    meetingSource: { type: String, default: '' },
    status: { type: String, default: 'in_progress' },
    notes: { type: String, default: '' },
    checklist: { type: [checklistItemSchema], default: [] },
    reportedBy: { type: Number, default: null },
    reportedByName: { type: String, default: '' },
  },
  { timestamps: true },
)

export type ProgressUpdateDoc = InferSchemaType<typeof progressUpdateSchema> & {
  _id: mongoose.Types.ObjectId
  createdAt: Date
}

export const ProgressUpdateModel =
  mongoose.models.ProgressUpdate ?? mongoose.model('ProgressUpdate', progressUpdateSchema)

export function formatProgressUpdate(doc: Record<string, unknown>) {
  const checklist = Array.isArray(doc.checklist)
    ? doc.checklist.map((c: Record<string, unknown>) => ({
        id: String(c.id),
        label: String(c.label),
        done: Boolean(c.done),
      }))
    : []

  const createdAt = doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt ?? '')

  return {
    id: String(doc.id),
    planItemId: String(doc.planItemId),
    meetingDate: String(doc.meetingDate),
    meetingSource: String(doc.meetingSource ?? ''),
    status: String(doc.status),
    notes: String(doc.notes ?? ''),
    checklist,
    reportedBy: doc.reportedBy != null ? Number(doc.reportedBy) : null,
    reportedByName: String(doc.reportedByName ?? ''),
    createdAt,
  }
}

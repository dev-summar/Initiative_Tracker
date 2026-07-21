import mongoose, { Schema, type InferSchemaType } from 'mongoose'
import { inferPlanItemPriority, PLAN_PRIORITIES } from '../utils/planPriority.js'

const PLAN_STATUSES = ['todo', 'in_progress', 'done', 'blocked'] as const

const checklistItemSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { _id: false },
)

const planItemSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    areaId: { type: String, required: true, index: true },
    subAreaId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    processOwner: { type: String, default: '' },
    phase: { type: String, default: '' },
    priority: { type: String, enum: PLAN_PRIORITIES, default: 'medium', index: true },
    status: { type: String, enum: PLAN_STATUSES, default: 'todo', index: true },
    targetDate: { type: String, default: '' },
    documentRef: { type: String, default: '' },
    checklist: { type: [checklistItemSchema], default: [] },
    progressSource: { type: String, default: '' },
    lastReviewDate: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export type PlanItemDoc = InferSchemaType<typeof planItemSchema> & {
  _id: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export const PlanItemModel = mongoose.models.PlanItem ?? mongoose.model('PlanItem', planItemSchema)

export function formatPlanItem(doc: Record<string, unknown>) {
  const checklist = Array.isArray(doc.checklist)
    ? doc.checklist.map((c: Record<string, unknown>) => ({
        id: String(c.id),
        label: String(c.label),
        done: Boolean(c.done),
      }))
    : []

  const createdAt = doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt ?? '')
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt ?? '')

  return {
    id: String(doc.id),
    areaId: String(doc.areaId),
    subAreaId: String(doc.subAreaId),
    title: String(doc.title),
    description: String(doc.description ?? ''),
    processOwner: String(doc.processOwner ?? ''),
    phase: String(doc.phase ?? ''),
    priority: String(
      doc.priority ??
        inferPlanItemPriority(String(doc.phase ?? ''), String(doc.status ?? 'todo')),
    ),
    status: String(doc.status),
    targetDate: String(doc.targetDate ?? ''),
    documentRef: String(doc.documentRef ?? ''),
    checklist,
    progressSource: String(doc.progressSource ?? ''),
    lastReviewDate: String(doc.lastReviewDate ?? ''),
    sortOrder: Number(doc.sortOrder ?? 0),
    createdAt,
    updatedAt,
  }
}

export { PLAN_STATUSES, PLAN_PRIORITIES }

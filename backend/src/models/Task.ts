import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const TASK_STATUSES = ['todo', 'in_progress', 'blocked', 'done'] as const
const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const

const taskSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    areaId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: TASK_STATUSES, default: 'todo', index: true },
    priority: { type: String, enum: TASK_PRIORITIES, default: 'medium' },
    dueDate: { type: String, required: true },
    createdBy: { type: Number, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export type TaskDoc = InferSchemaType<typeof taskSchema> & {
  _id: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export const TaskModel = mongoose.models.Task ?? mongoose.model('Task', taskSchema)

export function formatTask(doc: Record<string, unknown>) {
  const createdAt = doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt ?? '')
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt ?? '')
  return {
    id: String(doc.id),
    areaId: String(doc.areaId),
    title: String(doc.title),
    description: String(doc.description ?? ''),
    status: String(doc.status),
    priority: String(doc.priority),
    dueDate: String(doc.dueDate),
    createdAt,
    updatedAt,
  }
}

export function isOverdue(task: { dueDate: string; status: string }) {
  if (task.status === 'done') return false
  return new Date(task.dueDate) < new Date(new Date().toDateString())
}

export { TASK_STATUSES, TASK_PRIORITIES }

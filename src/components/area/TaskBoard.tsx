import { useState } from 'react'
import { toast } from 'sonner'
import { Calendar, LayoutGrid, List, Pencil, Plus, Trash2 } from 'lucide-react'
import type { CreateTaskInput, Task, TaskPriority, TaskStatus } from '../../api/types'
import { taskService } from '../../services/taskService'
import { Modal } from '../common/Modal'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { EmptyState } from '../common/EmptyState'
import { StatusBadge, PriorityBadge } from '../common/StatusBadge'
import { formatDate, isOverdue, statusLabel, priorityLabel, cn } from '../../lib/utils'

interface TaskBoardProps {
  areaId: string
  tasks: Task[]
  accent: string
  onChanged: () => void
}

const emptyForm: Omit<CreateTaskInput, 'areaId'> = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: new Date().toISOString().slice(0, 10),
}

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done']
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical']

const priorityAccent: Record<TaskPriority, string> = {
  low: '#A1A1AA',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
}

const statusAccent: Record<TaskStatus, string> = {
  todo: '#A1A1AA',
  in_progress: '#3B82F6',
  blocked: '#EF4444',
  done: '#14B8A6',
}

export function TaskBoard({ areaId, tasks, accent, onChanged }: TaskBoardProps) {
  const [view, setView] = useState<'table' | 'cards'>('table')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditing(task)
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate.slice(0, 10),
    })
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setBusy(true)
    try {
      if (editing) {
        await taskService.update(editing.id, form)
        toast.success('Task updated')
      } else {
        await taskService.create({ ...form, areaId })
        toast.success('Task created')
      }
      setModalOpen(false)
      onChanged()
    } catch {
      toast.error('Failed to save task')
    } finally {
      setBusy(false)
    }
  }

  const changeStatus = async (id: string, status: TaskStatus) => {
    try {
      await taskService.setStatus(id, status)
      toast.success('Status updated')
      onChanged()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await taskService.remove(deleteId)
      toast.success('Task deleted')
      setDeleteId(null)
      onChanged()
    } catch {
      toast.error('Failed to delete task')
    }
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">Tasks & Initiatives</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            {tasks.length} task{tasks.length === 1 ? '' : 's'} in this area
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-white p-0.5">
            <button
              type="button"
              onClick={() => setView('table')}
              className={cn(
                'rounded-md px-2.5 py-1.5 transition',
                view === 'table' ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink',
              )}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('cards')}
              className={cn(
                'rounded-md px-2.5 py-1.5 transition',
                view === 'cards' ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink',
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <button type="button" onClick={openCreate} className="btn-pill btn-primary">
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks match"
          description="Create a task or adjust your filters."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              Add Task
            </button>
          }
        />
      ) : view === 'table' ? (
        <div className="overflow-hidden rounded-[1.25rem] border border-border bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-gradient-to-r from-zinc-50 to-white text-[11px] uppercase tracking-wider text-ink-subtle">
                  <th className="px-5 py-3.5 font-semibold">Task</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold">Priority</th>
                  <th className="px-4 py-3.5 font-semibold">Due</th>
                  <th className="px-4 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const overdue = isOverdue(task.dueDate, task.status)
                  return (
                    <tr
                      key={task.id}
                      className="group border-b border-border/70 transition hover:bg-zinc-50/80"
                    >
                      <td className="relative px-5 py-4">
                        <div
                          className="absolute inset-y-3 left-0 w-1 rounded-r-full opacity-80"
                          style={{ backgroundColor: priorityAccent[task.priority] }}
                        />
                        <div className="pl-2">
                          <div className="font-semibold text-ink">{task.title}</div>
                          <div className="mt-1 line-clamp-1 text-xs leading-relaxed text-ink-muted">
                            {task.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <StatusBadge status={task.status} />
                          <select
                            value={task.status}
                            onChange={(e) => changeStatus(task.id, e.target.value as TaskStatus)}
                            className="w-full max-w-[9rem] rounded-lg border border-border bg-white px-2 py-1.5 text-xs outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {statusLabel(s)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium',
                            overdue ? 'bg-rose-50 text-rose-700' : 'bg-zinc-50 text-ink-muted',
                          )}
                        >
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          {formatDate(task.dueDate)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1 opacity-70 transition group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => openEdit(task)}
                            className="rounded-lg border border-transparent p-2 text-ink-muted hover:border-border hover:bg-white hover:text-ink"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(task.id)}
                            className="rounded-lg border border-transparent p-2 text-ink-muted hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => {
            const overdue = isOverdue(task.dueDate, task.status)
            return (
              <div
                key={task.id}
                className="group relative overflow-hidden rounded-[1.25rem] border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
              >
                <div
                  className="absolute inset-y-0 left-0 w-1.5"
                  style={{ backgroundColor: statusAccent[task.status] }}
                />
                <div className="mb-3 flex items-start justify-between gap-2 pl-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold leading-snug text-ink">{task.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                      {task.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-0.5 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => openEdit(task)}
                      className="rounded-lg p-1.5 text-ink-muted hover:bg-zinc-100"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(task.id)}
                      className="rounded-lg p-1.5 text-ink-muted hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mb-4 flex flex-wrap gap-2 pl-2">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
                <select
                  value={task.status}
                  onChange={(e) => changeStatus(task.id, e.target.value as TaskStatus)}
                  className="mb-3 w-full rounded-xl border border-border bg-zinc-50/50 px-3 py-2 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>
                <div
                  className={cn(
                    'flex items-center justify-between rounded-xl px-3 py-2 pl-2 text-xs',
                    overdue ? 'bg-rose-50 text-rose-700' : 'bg-zinc-50 text-ink-muted',
                  )}
                >
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    Due {formatDate(task.dueDate)}
                  </span>
                  {overdue && <span className="font-bold">Overdue</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit task' : 'Add task'}
        description={
          editing
            ? 'Update details for this initiative.'
            : 'Create a new initiative for this area.'
        }
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-pill btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy || !form.title.trim()}
              onClick={save}
              className="btn-pill btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Create task'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Title</span>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void save()
              }}
              placeholder="e.g. Finalize FY26 institutional OKRs"
              className="field-input"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Optional details…"
              className="field-input resize-none"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Status</span>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => {
                  const active = form.status === s
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className={cn(
                        'rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition',
                        active
                          ? 'border-transparent text-white'
                          : 'border-border bg-white text-ink-muted hover:border-zinc-300 hover:text-ink',
                      )}
                      style={active ? { backgroundColor: statusAccent[s] } : undefined}
                    >
                      {statusLabel(s)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Priority</span>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITIES.map((p) => {
                  const active = form.priority === p
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p })}
                      className={cn(
                        'rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition',
                        active
                          ? 'border-transparent text-white'
                          : 'border-border bg-white text-ink-muted hover:border-zinc-300 hover:text-ink',
                      )}
                      style={active ? { backgroundColor: priorityAccent[p] } : undefined}
                    >
                      {priorityLabel(p)}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <label className="block sm:max-w-[14rem]">
            <span className="mb-1.5 block text-sm font-medium text-ink">Due date</span>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="field-input pl-10"
              />
            </div>
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Task"
        message="Are you sure you want to delete this task? This cannot be undone."
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </section>
  )
}

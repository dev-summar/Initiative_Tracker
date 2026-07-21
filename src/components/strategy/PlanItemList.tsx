import { useState } from 'react'
import { Calendar, CheckCircle2, Circle, Loader2, User } from 'lucide-react'
import { toast } from 'sonner'
import type { PlanItem, PlanItemStatus, TaskPriority } from '../../api/types'
import { planItemService } from '../../services/planItemService'
import { Modal } from '../common/Modal'
import { StatusBadge, PriorityBadge, ProcessOwnerVerifiedBadge } from '../common/StatusBadge'
import { cn } from '../../lib/utils'

const STATUS_OPTIONS: { value: PlanItemStatus; label: string }[] = [
  { value: 'todo', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
]

interface PlanItemListProps {
  items: PlanItem[]
  accent: string
  onChanged: () => void
}

export function PlanItemList({ items, accent, onChanged }: PlanItemListProps) {
  const [selected, setSelected] = useState<PlanItem | null>(null)

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Implementation items</h2>
          <span className="text-sm text-ink-muted">{items.length} items</span>
        </div>

        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-zinc-50/80 px-4 py-8 text-center text-sm text-ink-muted">
            No plan items yet. Run <code className="text-xs">npm run seed:strategic</code> to load data.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-border bg-white p-4 shadow-sm transition hover:border-zinc-300"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={item.status} />
                      <PriorityBadge priority={item.priority} />
                      <ProcessOwnerVerifiedBadge item={item} />
                      {item.phase && (
                        <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                          {item.phase}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-medium text-ink">{item.title}</h3>
                    {item.description && (
                      <p className="mt-2 text-sm text-ink-muted line-clamp-3">{item.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-muted sm:gap-4">
                      {item.processOwner && (
                        <span className="inline-flex max-w-full items-center gap-1">
                          <User className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{item.processOwner}</span>
                        </span>
                      )}
                      {item.lastReviewDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Last review: {item.lastReviewDate}
                        </span>
                      )}
                    </div>
                    {item.progressSource && (
                      <p className="mt-2 text-[11px] text-ink-muted">Source: {item.progressSource}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="w-full rounded-lg px-3 py-2 text-sm font-medium text-white sm:w-auto sm:py-1.5"
                    style={{ backgroundColor: accent }}
                  >
                    Update
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <UpdatePlanItemModal
          item={selected}
          accent={accent}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null)
            onChanged()
          }}
        />
      )}
    </>
  )
}

export function UpdatePlanItemModal({
  item,
  accent,
  onClose,
  onSaved,
}: {
  item: PlanItem
  accent: string
  onClose: () => void
  onSaved: () => void
}) {
  const [status, setStatus] = useState<PlanItemStatus>(item.status)
  const [priority, setPriority] = useState<TaskPriority>(item.priority)
  const [processOwner, setProcessOwner] = useState(item.processOwner)
  const [notes, setNotes] = useState('')
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10))
  const [checklist, setChecklist] = useState(
    item.checklist.length > 0
      ? item.checklist
      : [
          { id: 'main', label: item.title, done: item.status === 'done' },
          { id: 'verify', label: 'Verified by process owner', done: false },
        ],
  )
  const [saving, setSaving] = useState(false)

  const toggleCheck = (id: string) => {
    setChecklist((list) => list.map((c) => (c.id === id ? { ...c, done: !c.done } : c)))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await planItemService.recordProgress({
        planItemId: item.id,
        status,
        meetingDate,
        meetingSource: 'Manual update via Initiative Tracker',
        notes,
        checklist,
      })
      if (processOwner !== item.processOwner || priority !== item.priority) {
        await planItemService.update({ id: item.id, processOwner, priority })
      }
      toast.success('Progress saved')
      onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save update')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Record progress update" size="lg">
      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium text-ink">{item.title}</p>
          <p className="mt-1 text-xs text-ink-muted">Update status, checklist, and review date.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          <label className="block text-sm sm:col-span-1">
            <span className="mb-1 block font-medium text-ink">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PlanItemStatus)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm sm:py-2"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Priority</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm sm:py-2"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label className="block text-sm sm:col-span-2 lg:col-span-1">
            <span className="mb-1 block font-medium text-ink">Review date</span>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm sm:py-2"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Process owner</span>
          <input
            value={processOwner}
            onChange={(e) => setProcessOwner(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            placeholder="Department / person responsible"
          />
        </label>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Checklist</p>
          <ul className="space-y-2">
            {checklist.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => toggleCheck(c.id)}
                  className={cn(
                    'flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition',
                    c.done ? 'border-teal-200 bg-teal-50/50' : 'border-border bg-zinc-50/50',
                  )}
                >
                  {c.done ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                  )}
                  <span className={c.done ? 'text-ink-muted line-through' : 'text-ink'}>{c.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            placeholder="What was achieved? What is pending?"
          />
        </label>

        <div className="flex flex-col-reverse justify-end gap-2 border-t border-border pt-4 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink-muted hover:bg-zinc-50 sm:py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60 sm:py-2"
            style={{ backgroundColor: accent }}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save update
          </button>
        </div>
      </div>
    </Modal>
  )
}

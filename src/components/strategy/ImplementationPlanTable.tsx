import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PlanItem, PlanItemStatus } from '../../api/types'
import { planItemService } from '../../services/planItemService'
import { PlanItemList } from './PlanItemList'
import { PriorityBadge } from '../common/StatusBadge'
import { cn, statusLabel } from '../../lib/utils'

const STATUS_OPTIONS: { value: PlanItemStatus; label: string }[] = [
  { value: 'todo', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
]

const statusSelectStyles: Record<PlanItemStatus, string> = {
  todo: 'bg-zinc-100 text-zinc-700',
  in_progress: 'bg-[#DBEAFE] text-[#2563EB]',
  blocked: 'bg-[#FEE2E2] text-[#DC2626]',
  done: 'bg-[#D1FAE5] text-[#059669]',
}

function TableStatusSelect({
  item,
  onChanged,
}: {
  item: PlanItem
  onChanged: () => void
}) {
  const [status, setStatus] = useState(item.status)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setStatus(item.status)
  }, [item.status])

  const handleChange = async (next: PlanItemStatus) => {
    if (next === item.status) return
    const previous = item.status
    setStatus(next)
    setSaving(true)
    try {
      await planItemService.recordProgress({
        planItemId: item.id,
        status: next,
        meetingDate: new Date().toISOString().slice(0, 10),
        meetingSource: 'Implementation table update',
        notes: `Status changed to ${statusLabel(next)}`,
        checklist:
          item.checklist.length > 0
            ? item.checklist.map((c) => ({ ...c, done: next === 'done' ? true : c.done }))
            : [{ id: 'main', label: item.title, done: next === 'done' }],
      })
      toast.success('Status updated')
      onChanged()
    } catch (err) {
      setStatus(previous)
      toast.error(err instanceof Error ? err.message : 'Could not update status')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={status}
        disabled={saving}
        onChange={(e) => void handleChange(e.target.value as PlanItemStatus)}
        aria-label={`Update status for ${item.title}`}
        className={cn(
          'appearance-none rounded-full border-0 py-1 pl-2.5 pr-7 text-[11px] font-semibold shadow-sm ring-1 ring-inset ring-black/5 transition hover:ring-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-wait disabled:opacity-70',
          statusSelectStyles[status],
        )}
        style={{ backgroundImage: 'none' }}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {statusLabel(o.value)}
          </option>
        ))}
      </select>
      {saving ? (
        <Loader2 className="pointer-events-none absolute right-1.5 h-3 w-3 animate-spin opacity-70" />
      ) : (
        <span className="pointer-events-none absolute right-1.5 text-[10px] opacity-60">▾</span>
      )}
    </div>
  )
}

interface ImplementationPlanTableProps {
  items: PlanItem[]
  accent: string
  onChanged: () => void
}

export function ImplementationPlanTable({ items, accent, onChanged }: ImplementationPlanTableProps) {
  const [view, setView] = useState<'table' | 'cards'>('table')
  const progressItems = items.filter((item) => item.progressSource && item.title.length > 50)
  const tableItems = items.filter((item) => !progressItems.some((p) => p.id === item.id))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Implementation Plan</h2>
          <p className="text-sm text-ink-muted">
            Key areas from the strategic plan table — deliverables, owner, and timelines.
          </p>
        </div>
        <div className="flex rounded-lg border border-border bg-zinc-50 p-0.5 text-sm">
          <button
            type="button"
            onClick={() => setView('table')}
            className={cn(
              'rounded-md px-3 py-1.5 font-medium transition',
              view === 'table' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
            )}
          >
            Table view
          </button>
          <button
            type="button"
            onClick={() => setView('cards')}
            className={cn(
              'rounded-md px-3 py-1.5 font-medium transition',
              view === 'cards' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
            )}
          >
            Card view
          </button>
        </div>
      </div>

      {view === 'cards' ? (
        <PlanItemList items={items} accent={accent} onChanged={onChanged} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-zinc-50/80">
                  <th className="px-4 py-3 font-semibold text-ink">Key Area</th>
                  <th className="min-w-[220px] px-4 py-3 font-semibold text-ink">Deliverables</th>
                  <th className="px-4 py-3 font-semibold text-ink">Owner</th>
                  <th className="min-w-[160px] px-4 py-3 font-semibold text-ink">Timelines</th>
                  <th className="px-4 py-3 font-semibold text-ink">Priority</th>
                  <th className="px-4 py-3 font-semibold text-ink">
                    Status
                    <span className="ml-1 text-[10px] font-normal text-ink-muted">(editable)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(tableItems.length > 0 ? tableItems : items).map((item) => (
                  <tr key={item.id} className="border-b border-border/70 align-top last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">{item.title}</td>
                    <td className="px-4 py-3 text-ink-muted">{item.description || '—'}</td>
                    <td className="px-4 py-3 text-ink-muted">{item.processOwner || '—'}</td>
                    <td className="px-4 py-3 text-ink-muted">{item.phase || '—'}</td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <TableStatusSelect item={item} onChanged={onChanged} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {progressItems.length > 0 && (
            <section className="space-y-3">
              <div>
                <h3 className="text-base font-semibold text-ink">Progress updates (GB minutes)</h3>
                <p className="text-sm text-ink-muted">
                  Accomplishments from governing body reviews, linked to implementation areas.
                </p>
              </div>
              <PlanItemList items={progressItems} accent={accent} onChanged={onChanged} />
            </section>
          )}
        </>
      )}
    </div>
  )
}

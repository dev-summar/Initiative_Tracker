import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PlanItem, PlanItemStatus } from '../../api/types'
import { planItemService } from '../../services/planItemService'
import { PlanItemList, UpdatePlanItemModal } from './PlanItemList'
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
  const [view, setView] = useState<'table' | 'cards'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table',
  )
  const [selected, setSelected] = useState<PlanItem | null>(null)
  const progressItems = items.filter((item) => item.progressSource && item.title.length > 50)
  const tableItems = items.filter((item) => !progressItems.some((p) => p.id === item.id))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink sm:text-lg">Implementation Plan</h2>
          <p className="text-xs text-ink-muted sm:text-sm">
            Key areas from the strategic plan table — deliverables, owner, and timelines.
          </p>
        </div>
        <div className="flex w-full rounded-lg border border-border bg-zinc-50 p-0.5 text-sm sm:w-auto">
          <button
            type="button"
            onClick={() => setView('table')}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 font-medium transition sm:flex-none',
              view === 'table' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
            )}
          >
            Table
          </button>
          <button
            type="button"
            onClick={() => setView('cards')}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 font-medium transition sm:flex-none',
              view === 'cards' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
            )}
          >
            Cards
          </button>
        </div>
      </div>

      {view === 'cards' ? (
        <PlanItemList items={items} accent={accent} onChanged={onChanged} />
      ) : (
        <>
          <div className="-mx-1 overflow-x-auto rounded-xl border border-border bg-white shadow-sm scrollbar-thin sm:mx-0">
            <table className="min-w-[880px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-zinc-50/80">
                  <th className="sticky left-0 z-[1] bg-zinc-50 px-3 py-3 font-semibold text-ink sm:px-4">
                    Key Area
                  </th>
                  <th className="min-w-[200px] px-3 py-3 font-semibold text-ink sm:px-4">Deliverables</th>
                  <th className="px-3 py-3 font-semibold text-ink sm:px-4">Owner</th>
                  <th className="min-w-[140px] px-3 py-3 font-semibold text-ink sm:px-4">Timelines</th>
                  <th className="px-3 py-3 font-semibold text-ink sm:px-4">Priority</th>
                  <th className="px-3 py-3 font-semibold text-ink sm:px-4">
                    Status
                    <span className="ml-1 hidden text-[10px] font-normal text-ink-muted sm:inline">
                      (editable)
                    </span>
                  </th>
                  <th className="px-3 py-3 font-semibold text-ink sm:px-4" />
                </tr>
              </thead>
              <tbody>
                {(tableItems.length > 0 ? tableItems : items).map((item) => (
                  <tr key={item.id} className="border-b border-border/70 align-top last:border-0">
                    <td className="sticky left-0 z-[1] max-w-[140px] bg-white px-3 py-3 font-medium text-ink sm:max-w-none sm:px-4">
                      {item.title}
                    </td>
                    <td className="px-3 py-3 text-ink-muted sm:px-4">{item.description || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-muted sm:px-4">
                      {item.processOwner || '—'}
                    </td>
                    <td className="px-3 py-3 text-ink-muted sm:px-4">{item.phase || '—'}</td>
                    <td className="px-3 py-3 sm:px-4">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <TableStatusSelect item={item} onChanged={onChanged} />
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: accent }}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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

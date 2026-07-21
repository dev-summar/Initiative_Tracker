import { Filter, X } from 'lucide-react'
import type { TaskPriority, TaskStatus } from '../../api/types'
import { AREAS } from '../../data/mockData'
import { useTrackerStore } from '../../store/useTrackerStore'
import { priorityLabel, statusLabel, cn } from '../../lib/utils'

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done']
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical']

interface FilterPanelProps {
  open: boolean
  onClose: () => void
  showAreaFilter?: boolean
}

export function FilterPanel({ open, onClose, showAreaFilter = true }: FilterPanelProps) {
  const filters = useTrackerStore((s) => s.filters)
  const setFilters = useTrackerStore((s) => s.setFilters)
  const resetFilters = useTrackerStore((s) => s.resetFilters)

  if (!open) return null

  const toggle = <T extends string>(key: 'statuses' | 'priorities' | 'areaIds', value: T) => {
    const current = filters[key] as T[]
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    setFilters({ [key]: next })
  }

  const activeCount =
    filters.statuses.length + filters.priorities.length + filters.areaIds.length

  return (
    <aside className="animate-fade-up rounded-[1.25rem] border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-brand" />
          <h3 className="font-display text-sm font-semibold">Filters</h3>
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-medium text-ink-muted hover:text-ink"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-ink-muted hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
          Status
        </span>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggle('statuses', s)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition',
                filters.statuses.includes(s)
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-border text-ink-muted hover:border-border-strong',
              )}
            >
              {statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
          Priority
        </span>
        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => toggle('priorities', p)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition',
                filters.priorities.includes(p)
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-border text-ink-muted hover:border-border-strong',
              )}
            >
              {priorityLabel(p)}
            </button>
          ))}
        </div>
      </div>

      {showAreaFilter && (
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            Area
          </span>
          <div className="flex flex-wrap gap-2">
            {AREAS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => toggle('areaIds', a.id)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition',
                  filters.areaIds.includes(a.id)
                    ? 'border-transparent text-white'
                    : 'border-border text-ink-muted hover:border-border-strong',
                )}
                style={
                  filters.areaIds.includes(a.id) ? { backgroundColor: a.color } : undefined
                }
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

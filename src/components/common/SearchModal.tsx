import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { AREAS } from '../../data/mockData'
import { taskService } from '../../services/taskService'
import { Modal } from './Modal'
import { StatusBadge, PriorityBadge } from './StatusBadge'
import { getAreaIcon } from '../../lib/icons'

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [tasks, setTasks] = useState<Awaited<ReturnType<typeof taskService.list>>>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    setQuery('')
    taskService.list().then(setTasks).catch(() => setTasks([]))
  }, [open])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tasks.slice(0, 8)
    return tasks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      )
      .slice(0, 12)
  }, [query, tasks])

  const areaMap = Object.fromEntries(AREAS.map((a) => [a.id, a]))

  return (
    <Modal open={open} onClose={onClose} title="Search tasks" size="lg">
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or description…"
          className="w-full rounded-xl border border-border bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none ring-brand/30 transition focus:border-brand focus:bg-white focus:ring-2"
        />
      </div>
      <div className="space-y-2">
        {results.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">No tasks match your search.</p>
        ) : (
          results.map((task) => {
            const area = areaMap[task.areaId]
            const Icon = getAreaIcon(area?.icon ?? 'Compass')
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => {
                  onClose()
                  if (area) navigate(`/area/${area.slug}`)
                }}
                className="flex w-full items-start gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-border hover:bg-slate-50"
              >
                <div
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${area?.color ?? '#6366F1'}18`, color: area?.color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{task.title}</div>
                  <div className="mt-0.5 truncate text-xs text-ink-muted">
                    {area?.name}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </Modal>
  )
}

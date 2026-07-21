import { useCallback, useEffect, useState } from 'react'
import { Navigate, useOutletContext, useParams } from 'react-router-dom'
import type { Area, Kpi, Task } from '../api/types'
import { areaService } from '../services/areaService'
import { kpiService } from '../services/kpiService'
import { taskService } from '../services/taskService'
import { useTrackerStore } from '../store/useTrackerStore'
import type { AppOutletContext } from '../components/layout/AppLayout'
import { Topbar } from '../components/layout/Topbar'
import { KpiCards } from '../components/area/KpiCards'
import { TaskBoard } from '../components/area/TaskBoard'
import { FilterPanel } from '../components/common/FilterPanel'
import { StatCardSkeleton, TableSkeleton } from '../components/common/LoadingSkeleton'
import { cn } from '../lib/utils'

export function AreaDetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { openMobileMenu } = useOutletContext<AppOutletContext>()
  const [area, setArea] = useState<Area | null | undefined>(undefined)
  const [kpis, setKpis] = useState<Kpi[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filters = useTrackerStore((s) => s.filters)

  const load = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    try {
      const found = await areaService.getBySlug(slug)
      setArea(found ?? null)
      if (found) {
        const [k, t] = await Promise.all([
          kpiService.list(found.id),
          taskService.getFiltered(found.id, {
            statuses: filters.statuses,
            priorities: filters.priorities,
            search: filters.search,
          }),
        ])
        setKpis(k)
        setTasks(t)
      }
    } finally {
      setLoading(false)
    }
  }, [slug, filters])

  useEffect(() => {
    void load()
  }, [load])

  if (area === null) {
    return <Navigate to="/" replace />
  }

  const filtersActive = filters.statuses.length + filters.priorities.length > 0

  const completed = tasks.filter((t) => t.status === 'done').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const blocked = tasks.filter((t) => t.status === 'blocked').length
  const todo = Math.max(0, tasks.length - completed - inProgress - blocked)
  const completionPct = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100)

  const stats = [
    { label: 'Total', value: tasks.length },
    { label: 'Done', value: completed },
    { label: 'Active', value: inProgress },
    { label: 'Blocked', value: blocked, alert: blocked > 0 },
    { label: 'Complete', value: `${completionPct}%` },
  ]

  return (
    <div className="min-h-full">
      <Topbar
        title={area?.name ?? 'Area'}
        subtitle={area?.description}
        onMobileMenu={openMobileMenu}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
        filtersActive={filtersActive || filtersOpen}
        defaultAreaId={area?.id}
        onImported={load}
      />

      <main className="space-y-6 p-4 md:p-6 lg:p-8">
        {area && (
          <section className="rounded-2xl border border-border bg-zinc-50/60 p-4 md:p-5">
            <div className="flex flex-wrap items-center gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className={cn(
                    'min-w-[4.75rem] flex-1 rounded-xl border bg-white px-3 py-2.5 text-center sm:flex-none',
                    s.alert ? 'border-rose-200' : 'border-border',
                  )}
                >
                  <div className="text-lg font-bold tabular-nums text-ink">{s.value}</div>
                  <div className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {tasks.length > 0 && (
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-[11px] text-ink-muted">
                  <span>Pipeline</span>
                  <span>
                    {completed}/{tasks.length} done
                  </span>
                </div>
                <div className="flex h-2 overflow-hidden rounded-full bg-zinc-200/80">
                  {[
                    { value: completed, color: '#14B8A6' },
                    { value: inProgress, color: '#3B82F6' },
                    { value: blocked, color: '#F43F5E' },
                    { value: todo, color: '#D4D4D8' },
                  ].map(
                    (seg, i) =>
                      seg.value > 0 && (
                        <div
                          key={i}
                          className="h-full"
                          style={{
                            width: `${(seg.value / tasks.length) * 100}%`,
                            backgroundColor: seg.color,
                          }}
                        />
                      ),
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {filtersOpen && (
          <FilterPanel open={filtersOpen} onClose={() => setFiltersOpen(false)} showAreaFilter={false} />
        )}

        {loading || !area ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
            <TableSkeleton rows={6} />
          </>
        ) : (
          <>
            <KpiCards areaId={area.id} kpis={kpis} accent={area.color} onChanged={load} />
            <TaskBoard areaId={area.id} tasks={tasks} accent={area.color} onChanged={load} />
          </>
        )}
      </main>
    </div>
  )
}

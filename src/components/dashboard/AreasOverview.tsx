import { Link } from 'react-router-dom'
import type { AreaSummary } from '../../api/types'
import { getAreaIcon } from '../../lib/icons'
import { cardClass } from '../../lib/design'

interface AreasOverviewProps {
  summaries: AreaSummary[]
}

export function AreasOverview({ summaries }: AreasOverviewProps) {
  return (
    <section className={cardClass + ' p-4 sm:p-6'}>
      <div className="mb-5">
        <h2 className="text-base font-bold text-ink sm:text-lg">Areas Overview</h2>
        <p className="text-sm text-ink-muted">Progress across all six operational areas</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {summaries.map((s) => {
          const Icon = getAreaIcon(s.area.icon)
          const pct =
            s.totalTasks === 0 ? 0 : Math.round((s.completedTasks / s.totalTasks) * 100)
          return (
            <Link
              key={s.area.id}
              to={s.area.slug === 'strategy' ? '/area/strategy' : `/area/${s.area.slug}`}
              className="group min-w-0 rounded-[1.25rem] border border-border bg-zinc-50/50 p-4 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-5"
            >
              <div className="mb-4 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                    style={{ backgroundColor: s.area.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-semibold text-ink group-hover:underline">
                      {s.area.name}
                    </div>
                    <p className="text-xs text-ink-muted">
                      {s.completedTasks}/{s.totalTasks} completed
                    </p>
                  </div>
                </div>
                {s.criticalCount > 0 && (
                  <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold text-[#D97706]">
                    {s.criticalCount} critical
                  </span>
                )}
              </div>
              <div className="mb-2 h-2 overflow-hidden rounded-full bg-zinc-200/80">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: s.area.color }}
                />
              </div>
              <div className="flex justify-between text-xs text-ink-muted">
                <span>{pct}% complete</span>
                <span>{s.kpiProgress}% KPI</span>
                {s.overdueTasks > 0 && (
                  <span className="font-semibold text-[#FB7185]">{s.overdueTasks} overdue</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

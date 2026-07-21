import { Link } from 'react-router-dom'
import { ArrowRight, FileText } from 'lucide-react'
import type { SubArea } from '../../api/types'
import { getAreaIcon } from '../../lib/icons'

export function StrategyPlanGrid({ plans }: { plans: SubArea[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan) => {
        const Icon = getAreaIcon(plan.icon)
        const pct = plan.stats?.progressPct ?? 0
        return (
          <Link
            key={plan.id}
            to={`/area/strategy/${plan.slug}`}
            className="group flex flex-col rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${plan.color}18`, color: plan.color }}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="text-2xl font-bold tabular-nums text-ink">{pct}%</span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-ink">{plan.name}</h3>
            <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-ink-muted">{plan.description}</p>
            {plan.documentRef && (
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-muted">
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">{plan.documentRef}</span>
              </p>
            )}
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-[11px] text-ink-muted">
                <span>
                  {plan.stats?.done ?? 0}/{plan.stats?.total ?? 0} completed
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-ink">
                  View plan
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: plan.color }}
                />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import type { AppOutletContext } from '../components/layout/AppLayout'
import { Topbar } from '../components/layout/Topbar'
import { ImplementationPlanTable } from '../components/strategy/ImplementationPlanTable'
import { PlanAnalytics } from '../components/strategy/PlanAnalytics'
import { TableSkeleton } from '../components/common/LoadingSkeleton'
import { subAreaService } from '../services/subAreaService'
import type { SubAreaDetail } from '../api/types'
import { getAreaIcon } from '../lib/icons'

export function PlanDetailPage() {
  const { planSlug } = useParams<{ planSlug: string }>()
  const { openMobileMenu } = useOutletContext<AppOutletContext>()
  const [plan, setPlan] = useState<SubAreaDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!planSlug) return
    setLoading(true)
    try {
      const data = await subAreaService.getBySlug(planSlug)
      setPlan(data)
    } catch {
      setPlan(null)
    } finally {
      setLoading(false)
    }
  }, [planSlug])

  useEffect(() => {
    void load()
  }, [load])

  const Icon = plan ? getAreaIcon(plan.icon) : FileText

  return (
    <div className="min-h-full">
      <Topbar
        title={plan?.name ?? 'Implementation plan'}
        subtitle={plan?.documentRef}
        onMobileMenu={openMobileMenu}
      />

      <main className="space-y-6 p-4 md:p-6 lg:p-8">
        <Link
          to="/area/strategy"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Strategy
        </Link>

        {loading || !plan ? (
          <TableSkeleton rows={6} />
        ) : (
          <>
            <section
              className="rounded-2xl border border-border bg-white p-5"
              style={{ borderTopColor: plan.color, borderTopWidth: 3 }}
            >
              <div className="flex flex-wrap items-start gap-4">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${plan.color}18`, color: plan.color }}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-semibold text-ink">{plan.name}</h1>
                  <p className="mt-1 text-sm text-ink-muted">{plan.description}</p>
                  <p className="mt-2 text-xs text-ink-muted">{plan.documentRef}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold tabular-nums text-ink">{plan.stats.progressPct}%</p>
                  <p className="text-xs text-ink-muted">
                    {plan.stats.done}/{plan.stats.total} done
                  </p>
                </div>
              </div>
            </section>

            <PlanAnalytics items={plan.items} planName={plan.name} accent={plan.color} />

            <ImplementationPlanTable items={plan.items} accent={plan.color} onChanged={load} />
          </>
        )}
      </main>
    </div>
  )
}

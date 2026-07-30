import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import type { AppOutletContext } from '../components/layout/AppLayout'
import { useCanAccessArea } from '../lib/areaAccess'
import { Topbar } from '../components/layout/Topbar'
import { ImplementationPlanTable } from '../components/strategy/ImplementationPlanTable'
import { PlanAnalytics } from '../components/strategy/PlanAnalytics'
import { TableSkeleton } from '../components/common/LoadingSkeleton'
import { subAreaService } from '../services/subAreaService'
import type { SubAreaDetail } from '../api/types'
import { getAreaIcon } from '../lib/icons'

export function PlanDetailPage() {
  const { planSlug } = useParams<{ planSlug: string }>()
  const canAccess = useCanAccessArea('strategy')
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

  if (!canAccess) {
    return <Navigate to="/" replace />
  }

  const Icon = plan ? getAreaIcon(plan.icon) : FileText

  return (
    <div className="min-h-full">
      <Topbar
        title={plan?.name ?? 'Implementation plan'}
        subtitle="MIET Strategic Plan 2024–2030"
        onMobileMenu={openMobileMenu}
      />

      <main className="space-y-6 overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
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
              className="rounded-2xl border border-border bg-white p-4 sm:p-5"
              style={{ borderTopColor: plan.color, borderTopWidth: 3 }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12"
                  style={{ backgroundColor: `${plan.color}18`, color: plan.color }}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold text-ink sm:text-xl">{plan.name}</h1>
                  <p className="mt-1 text-sm text-ink-muted">{plan.description}</p>
                </div>
                <div className="text-left sm:ml-auto sm:text-right">
                  <p className="text-2xl font-bold tabular-nums text-ink sm:text-3xl">
                    {plan.stats.progressPct}%
                  </p>
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

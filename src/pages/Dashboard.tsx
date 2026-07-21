import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import type { AppOutletContext } from '../components/layout/AppLayout'
import { Topbar } from '../components/layout/Topbar'
import { StrategyPlanGrid } from '../components/strategy/StrategyPlanGrid'
import { AreasOverview } from '../components/dashboard/AreasOverview'
import { subAreaService } from '../services/subAreaService'
import { dashboardService } from '../services/dashboardService'
import type { AreaSummary, SubArea } from '../api/types'
import { getGreeting } from '../lib/design'
import { TableSkeleton } from '../components/common/LoadingSkeleton'
import { AREAS } from '../data/mockData'

export function DashboardPage() {
  const { openMobileMenu } = useOutletContext<AppOutletContext>()
  const [plans, setPlans] = useState<SubArea[]>([])
  const [areaSummaries, setAreaSummaries] = useState<AreaSummary[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [planList, overview] = await Promise.all([
        subAreaService.list('area-strategy'),
        dashboardService.getOverview().catch(() => null),
      ])
      setPlans(planList)
      if (overview?.areaSummaries?.length) {
        setAreaSummaries(overview.areaSummaries)
      } else {
        setAreaSummaries(
          AREAS.filter((a) => a.slug !== 'strategy').map((area) => ({
            area,
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            blockedTasks: 0,
            overdueTasks: 0,
            kpiProgress: 0,
            criticalCount: 0,
          })),
        )
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const totalDone = plans.reduce((n, p) => n + (p.stats?.done ?? 0), 0)
  const totalItems = plans.reduce((n, p) => n + (p.stats?.total ?? 0), 0)
  const overallPct = totalItems === 0 ? 0 : Math.round((totalDone / totalItems) * 100)

  return (
    <div className="min-h-full">
      <Topbar
        title="Overview"
        subtitle="Strategic plan progress and operational areas"
        onMobileMenu={openMobileMenu}
      />

      <main className="space-y-6 overflow-x-hidden p-3 sm:space-y-8 sm:p-4 md:p-6 lg:p-8">
        <section>
          <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{getGreeting()}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            MIET Strategic Plan 2024–2030 plus day-to-day initiative tracking by area.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-ink">Strategic implementation plans</h3>
              {!loading && totalItems > 0 && (
                <p className="mt-1 text-sm text-ink-muted">
                  {overallPct}% complete — {totalDone} of {totalItems} items (synced from PDFs)
                </p>
              )}
            </div>
            <Link to="/area/strategy" className="text-sm font-medium text-violet-600 hover:underline">
              View all →
            </Link>
          </div>
          {loading ? <TableSkeleton rows={4} /> : <StrategyPlanGrid plans={plans} />}
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-ink">Operational areas</h3>
          {loading ? (
            <TableSkeleton rows={3} />
          ) : (
            <AreasOverview summaries={areaSummaries} />
          )}
        </section>
      </main>
    </div>
  )
}

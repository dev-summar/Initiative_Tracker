import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import type { AppOutletContext } from '../components/layout/AppLayout'
import { Topbar } from '../components/layout/Topbar'
import { StrategyPlanGrid } from '../components/strategy/StrategyPlanGrid'
import { subAreaService } from '../services/subAreaService'
import type { SubArea } from '../api/types'
import { getGreeting } from '../lib/design'
import { TableSkeleton } from '../components/common/LoadingSkeleton'

export function DashboardPage() {
  const { openMobileMenu } = useOutletContext<AppOutletContext>()
  const [plans, setPlans] = useState<SubArea[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const planList = await subAreaService.list('area-strategy')
      setPlans(planList)
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
        subtitle="MIET Strategic Plan 2024–2030"
        onMobileMenu={openMobileMenu}
      />

      <main className="space-y-6 overflow-x-hidden p-3 sm:space-y-8 sm:p-4 md:p-6 lg:p-8">
        <section>
          <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{getGreeting()}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Track implementation progress across all strategic plans.
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
      </main>
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import type { AppOutletContext } from '../components/layout/AppLayout'
import { Topbar } from '../components/layout/Topbar'
import { StrategyPlanGrid } from '../components/strategy/StrategyPlanGrid'
import { StatCards } from '../components/dashboard/StatCards'
import { AreasOverview } from '../components/dashboard/AreasOverview'
import { subAreaService } from '../services/subAreaService'
import { dashboardService } from '../services/dashboardService'
import type { Area, DashboardOverview, SubArea } from '../api/types'
import { getGreeting } from '../lib/design'
import { useAllowedAreas } from '../lib/areaAccess'
import { StatCardSkeleton, TableSkeleton } from '../components/common/LoadingSkeleton'

const STRATEGY_AREA_ID = 'area-strategy'

function overviewCopy(areas: Area[]) {
  const names = areas.map((a) => a.name)
  if (names.length === 0) {
    return {
      subtitle: 'Overview',
      greeting: 'Welcome to Initiative Tracker.',
      areasHeading: 'Your areas',
    }
  }
  if (names.length === 1) {
    return {
      subtitle: names[0],
      greeting: `Track tasks and KPIs for ${names[0]}.`,
      areasHeading: `${names[0]} overview`,
    }
  }
  if (areas.some((a) => a.id === STRATEGY_AREA_ID) && areas.length > 1) {
    return {
      subtitle: 'MIET Strategic Plan 2024–2030',
      greeting: 'Track implementation progress across your assigned areas.',
      areasHeading: 'Your areas',
    }
  }
  return {
    subtitle: names.join(' · '),
    greeting: `Track progress across ${names.join(', ')}.`,
    areasHeading: 'Your areas',
  }
}

export function DashboardPage() {
  const { openMobileMenu } = useOutletContext<AppOutletContext>()
  const visibleAreas = useAllowedAreas()
  const copy = useMemo(() => overviewCopy(visibleAreas), [visibleAreas])

  const hasStrategy = visibleAreas.some((a) => a.id === STRATEGY_AREA_ID)
  const showAreaDashboard = visibleAreas.some((a) => a.id !== STRATEGY_AREA_ID)

  const [plans, setPlans] = useState<SubArea[]>([])
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [loadingStrategy, setLoadingStrategy] = useState(hasStrategy)
  const [loadingOverview, setLoadingOverview] = useState(showAreaDashboard)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (hasStrategy) {
      setLoadingStrategy(true)
      try {
        const planList = await subAreaService.list(STRATEGY_AREA_ID)
        setPlans(planList)
      } catch {
        setPlans([])
      } finally {
        setLoadingStrategy(false)
      }
    } else {
      setPlans([])
      setLoadingStrategy(false)
    }

    if (showAreaDashboard) {
      setLoadingOverview(true)
      setOverviewError(null)
      try {
        const data = await dashboardService.getOverview()
        setOverview(data)
      } catch (err) {
        setOverview(null)
        setOverviewError(err instanceof Error ? err.message : 'Could not load dashboard data.')
      } finally {
        setLoadingOverview(false)
      }
    } else {
      setOverview(null)
      setOverviewError(null)
      setLoadingOverview(false)
    }
  }, [hasStrategy, showAreaDashboard])

  useEffect(() => {
    void load()
  }, [load])

  const totalDone = plans.reduce((n, p) => n + (p.stats?.done ?? 0), 0)
  const totalItems = plans.reduce((n, p) => n + (p.stats?.total ?? 0), 0)
  const overallPct = totalItems === 0 ? 0 : Math.round((totalDone / totalItems) * 100)
  const trackerAreaCount = visibleAreas.filter((a) => a.id !== STRATEGY_AREA_ID).length

  return (
    <div className="min-h-full">
      <Topbar title="Overview" subtitle={copy.subtitle} onMobileMenu={openMobileMenu} />

      <main className="space-y-6 overflow-x-hidden p-3 sm:space-y-8 sm:p-4 md:p-6 lg:p-8">
        <section>
          <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{getGreeting()}</h2>
          <p className="mt-1 text-sm text-ink-muted">{copy.greeting}</p>
        </section>

        {showAreaDashboard && (
          <>
            {loadingOverview ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
            ) : overviewError ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {overviewError}
                {(overviewError.includes('HTTP 500') ||
                  overviewError.includes('Could not reach') ||
                  overviewError.includes('ECONNREFUSED')) && (
                  <>
                    {' '}
                    Start the API in a second terminal with{' '}
                    <code className="rounded bg-white/70 px-1.5 py-0.5">npm run dev:api</code>, then
                    refresh this page.
                  </>
                )}
              </div>
            ) : overview?.stats ? (
              <>
                <StatCards stats={overview.stats} areaCount={trackerAreaCount || 1} />
                {overview.areaSummaries.length > 0 && (
                  <AreasOverview summaries={overview.areaSummaries} heading={copy.areasHeading} />
                )}
              </>
            ) : null}
          </>
        )}

        {hasStrategy && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-ink">Strategic implementation plans</h3>
                {!loadingStrategy && totalItems > 0 && (
                  <p className="mt-1 text-sm text-ink-muted">
                    {overallPct}% complete — {totalDone} of {totalItems} items (synced from PDFs)
                  </p>
                )}
              </div>
              <Link to="/area/strategy" className="text-sm font-medium text-violet-600 hover:underline">
                View all →
              </Link>
            </div>
            {loadingStrategy ? <TableSkeleton rows={4} /> : <StrategyPlanGrid plans={plans} />}
          </section>
        )}

        {!showAreaDashboard && !hasStrategy && (
          <div className="rounded-2xl border border-border bg-zinc-50 px-4 py-6 text-sm text-ink-muted">
            No areas are assigned to your account yet. Contact your administrator.
          </div>
        )}
      </main>
    </div>
  )
}

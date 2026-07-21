import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { DashboardOverview } from '../api/types'
import { dashboardService } from '../services/dashboardService'
import { useTrackerStore } from '../store/useTrackerStore'
import type { AppOutletContext } from '../components/layout/AppLayout'
import { Topbar } from '../components/layout/Topbar'
import { StatCards } from '../components/dashboard/StatCards'
import { NeedsAttention } from '../components/dashboard/NeedsAttention'
import { AreasOverview } from '../components/dashboard/AreasOverview'
import { Charts } from '../components/dashboard/Charts'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { FilterPanel } from '../components/common/FilterPanel'
import { getGreeting } from '../lib/design'
import {
  ChartSkeleton,
  StatCardSkeleton,
  TableSkeleton,
} from '../components/common/LoadingSkeleton'

export function DashboardPage() {
  const { openMobileMenu } = useOutletContext<AppOutletContext>()
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filters = useTrackerStore((s) => s.filters)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await dashboardService.getOverview(filters)
      setOverview(data)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void load()
  }, [load, filters])

  const filtersActive =
    filters.statuses.length + filters.priorities.length + filters.areaIds.length > 0

  return (
    <div className="min-h-full">
      <Topbar
        title="Overview"
        subtitle="Monitor initiatives, performance and priorities"
        onMobileMenu={openMobileMenu}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
        filtersActive={filtersActive || filtersOpen}
        onImported={load}
      />

      <main className="space-y-6 p-4 md:p-6 lg:p-8">
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-ink">
            {getGreeting()}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Here&apos;s what&apos;s happening across your initiatives.
          </p>
        </section>

        {filtersOpen && (
          <FilterPanel open={filtersOpen} onClose={() => setFiltersOpen(false)} />
        )}

        {loading || !overview ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <TableSkeleton />
              <ChartSkeleton />
            </div>
          </>
        ) : (
          <>
            <StatCards stats={overview.stats} />
            <div className="grid gap-4 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <NeedsAttention tasks={overview.needsAttention} />
              </div>
              <div className="lg:col-span-2">
                <RecentActivity items={overview.recentActivity} />
              </div>
            </div>
            <AreasOverview summaries={overview.areaSummaries} />
            <Charts overview={overview} />
          </>
        )}
      </main>
    </div>
  )
}

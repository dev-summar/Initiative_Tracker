import { useCallback, useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import type { AppOutletContext } from '../components/layout/AppLayout'
import { Topbar } from '../components/layout/Topbar'
import { StrategyPlanGrid } from '../components/strategy/StrategyPlanGrid'
import { TableSkeleton } from '../components/common/LoadingSkeleton'
import { areaService } from '../services/areaService'
import { subAreaService } from '../services/subAreaService'
import type { Area, SubArea } from '../api/types'

const STRATEGY_AREA_ID = 'area-strategy'

export function StrategyPage() {
  const { openMobileMenu } = useOutletContext<AppOutletContext>()
  const [area, setArea] = useState<Area | null>(null)
  const [plans, setPlans] = useState<SubArea[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [found, planList] = await Promise.all([
        areaService.getBySlug('strategy'),
        subAreaService.list(STRATEGY_AREA_ID),
      ])
      setArea(found ?? null)
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
        title={area?.name ?? 'Strategy'}
        subtitle="MIET Strategic Plan 2024–2030"
        onMobileMenu={openMobileMenu}
      />

      <main className="space-y-6 overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
        <section className="rounded-2xl border border-border bg-gradient-to-br from-violet-50/80 via-sky-50/40 to-white p-4 sm:p-5 md:p-6">
          <p className="text-sm text-ink-muted">
            Eight implementation plans from the strategic document. Progress is updated from governing body
            reviews and process-owner submissions.
          </p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <div>
              <p className="text-3xl font-bold tabular-nums text-ink">{overallPct}%</p>
              <p className="text-xs text-ink-muted">Overall completion</p>
            </div>
            <p className="text-sm text-ink-muted">
              {totalDone} of {totalItems} items completed across {plans.length} plans
            </p>
            <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:flex-wrap">
              <a
                href="/MIET STRATEGIC PLAN (2024-30) (1).pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-zinc-50 sm:py-1.5"
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                Strategic Plan PDF
              </a>
              <a
                href="/8th Governing Body Agenda Points.docx.pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-zinc-50 sm:py-1.5"
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                GB Minutes PDF
              </a>
            </div>
          </div>
        </section>

        {loading ? <TableSkeleton rows={6} /> : <StrategyPlanGrid plans={plans} />}
      </main>
    </div>
  )
}

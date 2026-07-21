import { useMemo } from 'react'
import type { PlanItem, SubArea } from '../../api/types'
import {
  buildBubbleData,
  buildHeatmapData,
  buildPlanRings,
  overallCompletion,
} from '../../lib/strategyChartData'
import { ChartCard } from './charts/chartShared'

interface ExecutiveDashboardProps {
  plans: SubArea[]
  items: PlanItem[]
}

function CompletionGauge({ pct }: { pct: number }) {
  const cx = 140
  const cy = 130
  const r = 100
  const startAngle = Math.PI
  const endAngle = 0
  const needleAngle = Math.PI - (pct / 100) * Math.PI

  const bgX1 = cx + r * Math.cos(startAngle)
  const bgY1 = cy - r * Math.sin(startAngle)
  const bgX2 = cx + r * Math.cos(endAngle)
  const bgY2 = cy - r * Math.sin(endAngle)

  const fgAngle = startAngle - (pct / 100) * Math.PI
  const fgX = cx + r * Math.cos(fgAngle)
  const fgY = cy - r * Math.sin(fgAngle)

  const needleX = cx + (r - 18) * Math.cos(needleAngle)
  const needleY = cy - (r - 18) * Math.sin(needleAngle)

  const milestones = [0, 25, 50, 75, 100]

  return (
    <svg viewBox="0 0 280 160" className="mx-auto w-full max-w-[320px]">
      <path
        d={`M ${bgX1} ${bgY1} A ${r} ${r} 0 0 1 ${bgX2} ${bgY2}`}
        fill="none"
        stroke="#e4e4e7"
        strokeWidth={18}
        strokeLinecap="round"
      />
      {pct > 0 && (
        <path
          d={`M ${bgX1} ${bgY1} A ${r} ${r} 0 0 1 ${fgX} ${fgY}`}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={18}
          strokeLinecap="round"
        />
      )}
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#18181b" strokeWidth={3} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={8} fill="#18181b" />
      <text x={cx} y={cy - 28} textAnchor="middle" className="fill-ink text-3xl font-bold" fontSize={32}>
        {pct}%
      </text>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#71717a" fontSize={11}>
        Overall completion
      </text>
      {milestones.map((m) => {
        const a = Math.PI - (m / 100) * Math.PI
        const tx = cx + (r + 14) * Math.cos(a)
        const ty = cy - (r + 14) * Math.sin(a)
        return (
          <text key={m} x={tx} y={ty} textAnchor="middle" fill="#a1a1aa" fontSize={9}>
            {m}%
          </text>
        )
      })}
    </svg>
  )
}

function MultiRingChart({ rings }: { rings: ReturnType<typeof buildPlanRings> }) {
  const size = 300
  const center = size / 2
  const ringWidth = 11
  const gap = 5

  return (
    <div className="flex flex-col items-center gap-4 lg:flex-row">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="aspect-square h-auto w-full max-w-[220px] shrink-0 sm:max-w-[260px] lg:max-w-[280px]"
      >
        {rings.map((ring, i) => {
          const radius = center - 16 - i * (ringWidth + gap)
          const circumference = 2 * Math.PI * radius
          const offset = circumference * (1 - ring.pct / 100)
          return (
            <g key={ring.id}>
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#f4f4f5"
                strokeWidth={ringWidth}
              />
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={ringWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
                opacity={0.92}
              />
            </g>
          )
        })}
        <text x={center} y={center - 6} textAnchor="middle" className="fill-ink text-xl font-bold" fontSize={22}>
          8
        </text>
        <text x={center} y={center + 14} textAnchor="middle" fill="#71717a" fontSize={11}>
          Plans
        </text>
      </svg>
      <ul className="grid flex-1 gap-1.5 sm:grid-cols-2">
        {rings.map((ring) => (
          <li key={ring.id} className="flex items-center gap-2 rounded-lg bg-zinc-50/80 px-2.5 py-1.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: ring.color }} />
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink">{ring.name}</span>
            <span className="text-xs font-bold tabular-nums" style={{ color: ring.color }}>
              {ring.pct}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BubbleMatrix({ bubbles }: { bubbles: ReturnType<typeof buildBubbleData> }) {
  return (
    <div className="relative h-[220px] w-full sm:h-[280px] md:h-[300px]">
      <svg viewBox="0 0 100 80" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {bubbles.map((b) => {
          const radius = Math.sqrt(b.size) / 3.2
          return (
            <g key={b.id}>
              <circle
                cx={b.x}
                cy={b.y}
                r={radius}
                fill={b.color}
                fillOpacity={0.22}
                stroke={b.color}
                strokeWidth={0.6}
              />
              <circle cx={b.x} cy={b.y} r={radius * (b.pct / 100)} fill={b.color} fillOpacity={0.75} />
              <text x={b.x} y={b.y - 1} textAnchor="middle" fill="#18181b" fontSize={3.2} fontWeight={600}>
                {b.pct}%
              </text>
              <text x={b.x} y={b.y + 3.5} textAnchor="middle" fill="#52525b" fontSize={2.4}>
                {b.name.length > 14 ? `${b.name.slice(0, 12)}…` : b.name}
              </text>
              <title>{`${b.name}: ${b.done}/${b.total} done`}</title>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function ProgressHeatmap({ rows }: { rows: ReturnType<typeof buildHeatmapData> }) {
  const years = rows[0]?.cells.map((c) => c.year) ?? []

  function cellColor(pct: number | null) {
    if (pct === null) return '#f4f4f5'
    if (pct >= 75) return '#10B981'
    if (pct >= 50) return '#34D399'
    if (pct >= 25) return '#FBBF24'
    if (pct > 0) return '#FB923C'
    return '#FECACA'
  }

  return (
    <div className="-mx-1 overflow-x-auto scrollbar-thin">
      <table className="min-w-[520px] w-full text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 z-[1] bg-white px-2 py-2 text-left font-semibold text-ink">
              Plan
            </th>
            {years.map((y) => (
              <th key={y} className="px-2 py-2 text-center font-medium text-ink-muted">
                {y}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.planId} className="border-t border-border/60">
              <td className="sticky left-0 z-[1] max-w-[100px] truncate bg-white px-2 py-2 font-medium text-ink sm:max-w-[140px]">
                {row.planName}
              </td>
              {row.cells.map((cell) => (
                <td key={cell.year} className="px-1 py-1">
                  <div
                    className="flex h-8 min-w-[36px] items-center justify-center rounded-md text-[10px] font-semibold text-white/90 sm:h-9 sm:min-w-[44px]"
                    style={{ backgroundColor: cellColor(cell.pct) }}
                    title={
                      cell.pct === null
                        ? 'No items in this period'
                        : `${cell.pct}% complete (${cell.count} items)`
                    }
                  >
                    {cell.pct === null ? '—' : `${cell.pct}%`}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ExecutiveDashboard({ plans, items }: ExecutiveDashboardProps) {
  const rings = useMemo(() => buildPlanRings(plans), [plans])
  const bubbles = useMemo(() => buildBubbleData(plans), [plans])
  const heatmap = useMemo(() => buildHeatmapData(plans, items), [plans, items])
  const overall = useMemo(() => overallCompletion(plans), [plans])

  if (items.length === 0) return null

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Executive dashboard</h2>
        <p className="text-sm text-ink-muted">
          Overview across {items.length} implementation items and {plans.length} strategic plans
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-1"
          title="Strategic completion gauge"
          subtitle="Overall progress toward 2030 targets"
        >
          <CompletionGauge pct={overall.pct} />
          <p className="mt-2 text-center text-xs text-ink-muted">
            {overall.done} of {overall.total} items completed
          </p>
        </ChartCard>

        <ChartCard
          className="lg:col-span-2"
          title="Multi-ring plan progress"
          subtitle="Each ring = one strategic plan completion %"
        >
          <MultiRingChart rings={rings} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Bubble matrix"
          subtitle="Bubble size = item count · fill = completion %"
        >
          <BubbleMatrix bubbles={bubbles} />
        </ChartCard>

        <ChartCard
          title="Progress heatmap"
          subtitle="Plans × years (2024–2030) — where are we falling behind?"
        >
          <ProgressHeatmap rows={heatmap} />
        </ChartCard>
      </div>
    </section>
  )
}

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PlanItem, TaskPriority } from '../../api/types'
import { cardClass, PRIORITY_CHART_COLORS, STATUS_CHART_COLORS } from '../../lib/design'
import { priorityLabel, statusLabel } from '../../lib/utils'

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e4e4e7',
  background: '#ffffff',
  color: '#0f0f0f',
  fontSize: 12,
  padding: '8px 12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}

function formatCount(value: unknown) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return '0'
  return String(Math.round(n))
}

function CountTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value?: number | string; name?: string; payload?: { owner?: string; label?: string } }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const row = payload[0]
  const title = row.payload?.owner || row.payload?.label || label || row.name || ''
  const count = formatCount(row.value)
  return (
    <div style={tooltipStyle}>
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-0.5 text-ink-muted">
        Items: <span className="font-semibold text-ink">{count}</span>
      </p>
    </div>
  )
}

const PRIORITY_ORDER: TaskPriority[] = ['critical', 'high', 'medium', 'low']

function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`${cardClass} p-4 sm:p-5 md:p-6 ${className ?? ''}`}>
      <div className="mb-3 sm:mb-4">
        <h2 className="text-sm font-bold text-ink sm:text-base md:text-lg">{title}</h2>
        <p className="text-[11px] text-ink-muted sm:text-xs md:text-sm">{subtitle}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

interface PlanAnalyticsProps {
  items: PlanItem[]
  planName: string
  accent: string
}

export function PlanAnalytics({ items, planName, accent }: PlanAnalyticsProps) {
  const analytics = useMemo(() => {
    const statusCounts = { todo: 0, in_progress: 0, done: 0, blocked: 0 }
    const priorityCounts: Record<TaskPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    }
    const ownerCounts: Record<string, number> = {}

    for (const item of items) {
      statusCounts[item.status]++
      priorityCounts[item.priority] = (priorityCounts[item.priority] ?? 0) + 1
      const owner = item.processOwner?.trim() || 'Unassigned'
      ownerCounts[owner] = (ownerCounts[owner] ?? 0) + 1
    }

    const statusData = (Object.keys(statusCounts) as (keyof typeof statusCounts)[])
      .filter((k) => statusCounts[k] > 0)
      .map((k) => ({
        name: k,
        label: statusLabel(k),
        value: statusCounts[k],
        color: STATUS_CHART_COLORS[k],
      }))

    const priorityData = PRIORITY_ORDER.filter((p) => priorityCounts[p] > 0).map((p) => ({
      name: p,
      label: priorityLabel(p),
      value: priorityCounts[p],
      color: PRIORITY_CHART_COLORS[p],
    }))

    const ownerData = Object.entries(ownerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([owner, count], i) => ({
        owner: owner.length > 22 ? `${owner.slice(0, 20)}…` : owner,
        count,
        fill: [accent, '#8B5CF6', '#60A5FA', '#34D399', '#FBBF24', '#FB7185'][i % 6],
      }))

    const done = statusCounts.done
    const total = items.length
    const pct = total === 0 ? 0 : Math.round((done / total) * 100)
    const openHighPriority = items.filter(
      (i) => i.status !== 'done' && (i.priority === 'high' || i.priority === 'critical'),
    ).length

    return {
      statusData,
      priorityData,
      ownerData,
      done,
      total,
      pct,
      openHighPriority,
    }
  }, [items, accent])

  if (items.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-ink">Plan analytics</h2>
          <p className="text-sm text-ink-muted">
            {analytics.done}/{analytics.total} completed ({analytics.pct}%) — {planName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRIORITY_ORDER.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: `${PRIORITY_CHART_COLORS[p]}22`,
                color: PRIORITY_CHART_COLORS[p],
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: PRIORITY_CHART_COLORS[p] }}
              />
              {priorityLabel(p)}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ChartCard title="Status breakdown" subtitle="Implementation items by current status">
          <div className="h-44 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={44}
                  outerRadius={72}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {analytics.statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CountTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {analytics.statusData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.label} ({d.value})
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Priority distribution" subtitle="Phase 1 → High · Phase 2 → Medium · Phase 3 → Low">
          <div className="h-44 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.priorityData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={44}
                  outerRadius={72}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {analytics.priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CountTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-xs text-ink-muted">
            <span className="font-semibold text-orange-600">{analytics.openHighPriority}</span> open
            high/critical items
          </p>
        </ChartCard>

        <ChartCard title="By owner" subtitle="Items assigned per process owner">
          <div className="h-44 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.ownerData} layout="vertical" margin={{ left: 4, right: 28, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  domain={[0, (max: number) => Math.max(1, Math.ceil(max))]}
                  tickCount={Math.min(6, Math.max(...analytics.ownerData.map((d) => d.count), 1) + 1)}
                  tickFormatter={formatCount}
                  tick={{ fontSize: 10, fill: '#a1a1aa' }}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="owner"
                  width={88}
                  tick={{ fontSize: 10, fill: '#52525b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CountTooltip />} cursor={{ fill: '#f4f4f5' }} />
                <Bar dataKey="count" name="Items" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 11, fill: '#52525b', formatter: formatCount }}>
                  {analytics.ownerData.map((entry) => (
                    <Cell key={entry.owner} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </section>
  )
}

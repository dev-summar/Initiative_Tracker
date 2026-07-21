import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PlanItem, SubArea, TaskPriority } from '../../api/types'
import { cardClass, PRIORITY_CHART_COLORS, STATUS_CHART_COLORS } from '../../lib/design'
import { priorityLabel, statusLabel } from '../../lib/utils'

interface StrategyAnalyticsProps {
  plans: SubArea[]
  items: PlanItem[]
}

const tooltipStyle = {
  borderRadius: 12,
  border: 'none',
  background: '#0f0f0f',
  color: '#fff',
  fontSize: 12,
  padding: '8px 12px',
}

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
    <div className={`${cardClass} p-5 md:p-6 ${className ?? ''}`}>
      <div className="mb-4">
        <h2 className="text-base font-bold text-ink md:text-lg">{title}</h2>
        <p className="text-xs text-ink-muted md:text-sm">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

const PRIORITY_ORDER: TaskPriority[] = ['critical', 'high', 'medium', 'low']

export function StrategyAnalytics({ plans, items }: StrategyAnalyticsProps) {
  const analytics = useMemo(() => {
    const statusCounts = { todo: 0, in_progress: 0, done: 0, blocked: 0 }
    const priorityCounts: Record<TaskPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    }
    const phaseCounts: Record<string, number> = {}

    for (const item of items) {
      statusCounts[item.status]++
      priorityCounts[item.priority] = (priorityCounts[item.priority] ?? 0) + 1
      const phaseKey = item.phase?.trim() || 'Unassigned'
      phaseCounts[phaseKey] = (phaseCounts[phaseKey] ?? 0) + 1
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

    const planProgress = plans.map((plan) => {
      const planItems = items.filter((i) => i.subAreaId === plan.id)
      const done = planItems.filter((i) => i.status === 'done').length
      const inProgress = planItems.filter((i) => i.status === 'in_progress').length
      const todo = planItems.filter((i) => i.status === 'todo').length
      const blocked = planItems.filter((i) => i.status === 'blocked').length
      const total = planItems.length
      const pct = total === 0 ? 0 : Math.round((done / total) * 100)
      const shortName = plan.name.replace(/ Plan$/, '').split(' ').slice(0, 2).join(' ')
      return {
        name: shortName,
        fullName: plan.name,
        done,
        inProgress,
        todo,
        blocked,
        total,
        pct,
        color: plan.color,
      }
    })

    const phaseData = Object.entries(phaseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([phase, count], i) => ({
        phase: phase.length > 28 ? `${phase.slice(0, 26)}…` : phase,
        count,
        fill: ['#6366F1', '#8B5CF6', '#A78BFA', '#60A5FA', '#34D399', '#FBBF24'][i % 6],
      }))

    const openHighPriority = items.filter(
      (i) => i.status !== 'done' && (i.priority === 'high' || i.priority === 'critical'),
    ).length

    return { statusData, priorityData, planProgress, phaseData, openHighPriority }
  }, [plans, items])

  if (items.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-ink">Strategic analytics</h2>
          <p className="text-sm text-ink-muted">
            Live from {items.length} plan items — priority derived from PDF phase timelines
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

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Status breakdown" subtitle="All implementation items by status">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={48}
                  outerRadius={76}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {analytics.statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v ?? 0, String(n)]} contentStyle={tooltipStyle} />
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
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.priorityData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={48}
                  outerRadius={76}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {analytics.priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v ?? 0, String(n)]} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-xs text-ink-muted">
            <span className="font-semibold text-orange-600">{analytics.openHighPriority}</span> open
            high/critical items need attention
          </p>
        </ChartCard>

        <ChartCard title="Phase timeline" subtitle="Items grouped by PDF implementation phase">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.phaseData} layout="vertical" margin={{ left: 4, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="phase"
                  width={100}
                  tick={{ fontSize: 9, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Items" radius={[0, 6, 6, 0]}>
                  {analytics.phaseData.map((entry) => (
                    <Cell key={entry.phase} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard
        className="lg:col-span-3"
        title="Progress by implementation plan"
        subtitle="Completed vs in-progress vs pending across all 8 plans"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.planProgress} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#a1a1aa' }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-18}
                textAnchor="end"
                height={56}
              />
              <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fullName ? String(payload[0].payload.fullName) : ''
                }
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="done" name="Done" stackId="a" fill="#10B981" />
              <Bar dataKey="inProgress" name="In progress" stackId="a" fill="#3B82F6" />
              <Bar dataKey="todo" name="To do" stackId="a" fill="#D4D4D8" />
              <Bar dataKey="blocked" name="Blocked" stackId="a" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {analytics.planProgress.map((p) => (
            <div
              key={p.fullName}
              className="rounded-xl border border-border bg-zinc-50/60 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-medium text-ink">{p.name}</span>
                <span className="text-sm font-bold tabular-nums" style={{ color: p.color }}>
                  {p.pct}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${p.pct}%`, backgroundColor: p.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </section>
  )
}

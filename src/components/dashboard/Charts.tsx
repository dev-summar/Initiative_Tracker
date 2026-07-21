import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import type { DashboardOverview } from '../../api/types'
import { priorityLabel, statusLabel } from '../../lib/utils'
import { cardClass, CHART_COLORS } from '../../lib/design'

interface ChartsProps {
  overview: DashboardOverview
}

function ChartCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className={cardClass + ' p-6'}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <p className="text-sm text-ink-muted">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="h-64">{children}</div>
    </div>
  )
}

const tooltipStyle = {
  borderRadius: 12,
  border: 'none',
  background: '#0f0f0f',
  color: '#fff',
  fontSize: 12,
  padding: '8px 12px',
}

export function Charts({ overview }: ChartsProps) {
  const statusData = overview.statusDistribution.map((d) => ({
    ...d,
    label: statusLabel(d.name),
  }))
  const priorityData = overview.priorityDistribution.map((d) => ({
    ...d,
    label: priorityLabel(d.name),
  }))

  const trendData = overview.areaProgress.map((a, i) => ({
    name: a.name.split(' ')[0],
    value: a.total === 0 ? 0 : Math.round((a.completed / a.total) * 100),
    fill: a.color,
    index: i,
  }))

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <ChartCard title="Task Status Distribution" subtitle="Breakdown by current status">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="label"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={4}
              strokeWidth={0}
            >
              {statusData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value ?? 0, String(name)]} contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="-mt-2 flex flex-wrap justify-center gap-3">
          {statusData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
              {d.label} ({d.value})
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard
        title="Tasks by Area"
        subtitle="Completed vs total across areas"
        action={
          <span className="text-xs font-semibold text-ink-muted">See details</span>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={overview.areaProgress} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="completed" name="Completed" radius={[8, 8, 0, 0]}>
              {overview.areaProgress.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Priority Distribution" subtitle="Open tasks by priority">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="lavenderGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.lavender} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLORS.lavender} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={CHART_COLORS.lavender}
              strokeWidth={2.5}
              fill="url(#lavenderGrad)"
              dot={{ r: 4, fill: '#fff', stroke: CHART_COLORS.lavender, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="-mt-2 flex flex-wrap justify-center gap-3">
          {priorityData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
              {d.label} ({d.value})
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}

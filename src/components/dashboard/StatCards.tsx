import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Layers,
  OctagonAlert,
  type LucideIcon,
} from 'lucide-react'
import type { DashboardStats } from '../../api/types'
import { CHART_PALETTE, STATUS_CHART_COLORS } from '../../lib/design'
import { cn } from '../../lib/utils'

interface StatCardsProps {
  stats: DashboardStats
  areaCount?: number
}

type CardTheme = {
  accent: string
  soft: string
  bar: string
  badge: string
  badgeText: string
}

const themes = {
  total: {
    accent: CHART_PALETTE.yellow,
    soft: '#FEFCE8',
    bar: CHART_PALETTE.yellow,
    badge: '#FEF9C3',
    badgeText: '#A16207',
  },
  done: {
    accent: CHART_PALETTE.green,
    soft: '#F0FDF4',
    bar: CHART_PALETTE.green,
    badge: '#DCFCE7',
    badgeText: '#15803D',
  },
  active: {
    accent: CHART_PALETTE.yellow,
    soft: '#FEFCE8',
    bar: CHART_PALETTE.yellow,
    badge: '#FEF9C3',
    badgeText: '#A16207',
  },
  blocked: {
    accent: CHART_PALETTE.red,
    soft: '#FEF2F2',
    bar: CHART_PALETTE.red,
    badge: '#FEE2E2',
    badgeText: '#B91C1C',
  },
  risk: {
    accent: CHART_PALETTE.red,
    soft: '#FEF2F2',
    bar: CHART_PALETTE.red,
    badge: '#FEE2E2',
    badgeText: '#B91C1C',
  },
  completion: {
    accent: CHART_PALETTE.green,
    soft: '#F0FDF4',
    bar: CHART_PALETTE.green,
    badge: '#DCFCE7',
    badgeText: '#15803D',
  },
} as const satisfies Record<string, CardTheme>

function pct(value: number, total: number) {
  if (total <= 0) return 0
  return Math.min(100, Math.round((value / total) * 100))
}

function FillBar({ value, max, color, alert }: { value: number; max: number; color: string; alert?: boolean }) {
  const width = pct(value, max)
  return (
    <div className="relative h-2 overflow-hidden rounded-full bg-zinc-100/90">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-700 ease-out',
          alert && value > 0 && 'animate-pulse',
        )}
        style={{ width: `${Math.max(width, value > 0 ? 6 : 0)}%`, backgroundColor: color }}
      />
    </div>
  )
}

function StatusMixBar({ stats }: { stats: DashboardStats }) {
  const total = Math.max(stats.totalTasks, 1)
  const segments = [
    { value: stats.completedTasks, color: themes.done.bar, label: 'Done' },
    { value: stats.inProgressTasks, color: themes.active.bar, label: 'Active' },
    { value: stats.blockedTasks, color: themes.blocked.bar, label: 'Blocked' },
    {
      value: Math.max(
        0,
        stats.totalTasks - stats.completedTasks - stats.inProgressTasks - stats.blockedTasks,
      ),
      color: STATUS_CHART_COLORS.todo,
      label: 'To do',
    },
  ]

  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-zinc-100/90">
        {segments.map((seg) =>
          seg.value > 0 ? (
            <div
              key={seg.label}
              className="h-full transition-all duration-700 ease-out first:rounded-l-full last:rounded-r-full"
              style={{ width: `${(seg.value / total) * 100}%`, backgroundColor: seg.color }}
              title={`${seg.label}: ${seg.value}`}
            />
          ) : null,
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1.5 text-[10px] text-ink-muted">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label} {s.value}
            </span>
          ))}
      </div>
    </div>
  )
}

function RingGauge({ value, color, size = 52 }: { value: number; color: string; size?: number }) {
  const stroke = 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c

  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F4F4F5" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
      />
    </svg>
  )
}

interface StatCardProps {
  theme: CardTheme
  icon: LucideIcon
  label: string
  badge: string
  value: number | string
  suffix?: string
  subtitle: string
  bar?: React.ReactNode
  alert?: boolean
  delayClass?: string
  trailing?: React.ReactNode
}

function StatCard({
  theme,
  icon: Icon,
  label,
  badge,
  value,
  suffix,
  subtitle,
  bar,
  alert,
  delayClass,
  trailing,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-[1.25rem] border bg-white p-5 transition-all duration-300',
        'hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]',
        alert ? 'border-rose-200/80' : 'border-border hover:border-zinc-300/80',
        delayClass,
      )}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.07] transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundColor: theme.accent }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: theme.soft, color: theme.accent }}
        >
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide"
          style={{ backgroundColor: theme.badge, color: theme.badgeText }}
        >
          {badge}
        </span>
      </div>

      <div className="relative mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">{label}</p>
          <div className="mt-1 flex items-baseline gap-0.5">
            <span className="text-[2rem] font-bold leading-none tracking-tight text-ink">{value}</span>
            {suffix && (
              <span className="text-lg font-semibold text-ink-muted">{suffix}</span>
            )}
          </div>
        </div>
        {trailing}
      </div>

      {bar && <div className="relative mt-4">{bar}</div>}

      <p className="relative mt-3 text-[11px] leading-relaxed text-ink-muted">{subtitle}</p>
    </div>
  )
}

export function StatCards({ stats, areaCount = 6 }: StatCardsProps) {
  const total = stats.totalTasks
  const completionPct = pct(stats.completedTasks, total)
  const areaLabel = areaCount === 1 ? '1 area' : `${areaCount} areas`

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard
        theme={themes.total}
        icon={ClipboardList}
        label="Total Tasks"
        badge="Portfolio"
        value={stats.totalTasks}
        subtitle={`${stats.criticalItems} critical item${stats.criticalItems === 1 ? '' : 's'} across ${areaLabel}`}
        bar={<StatusMixBar stats={stats} />}
        delayClass="animate-fade-up"
      />

      <StatCard
        theme={themes.done}
        icon={CheckCircle2}
        label="Completed"
        badge="Done"
        value={stats.completedTasks}
        subtitle={`${completionPct}% of portfolio finished`}
        bar={<FillBar value={stats.completedTasks} max={total} color={themes.done.bar} />}
        delayClass="animate-fade-up-delay-1"
      />

      <StatCard
        theme={themes.active}
        icon={Layers}
        label="In Progress"
        badge="Active"
        value={stats.inProgressTasks}
        subtitle="Tasks currently being worked on"
        bar={<FillBar value={stats.inProgressTasks} max={total} color={themes.active.bar} />}
        delayClass="animate-fade-up-delay-1"
      />

      <StatCard
        theme={themes.blocked}
        icon={OctagonAlert}
        label="Blocked"
        badge="Stalled"
        value={stats.blockedTasks}
        subtitle={
          stats.blockedTasks > 0
            ? 'Needs unblock — check dependencies or owners'
            : 'No blockers right now'
        }
        bar={<FillBar value={stats.blockedTasks} max={total} color={themes.blocked.bar} alert />}
        alert={stats.blockedTasks > 0}
        delayClass="animate-fade-up-delay-2"
      />

      <StatCard
        theme={themes.risk}
        icon={AlertTriangle}
        label="At Risk"
        badge="Overdue"
        value={stats.overdueTasks}
        subtitle={
          stats.overdueTasks > 0
            ? 'Past due date — may need escalation'
            : 'All deadlines look healthy'
        }
        bar={<FillBar value={stats.overdueTasks} max={total} color={themes.risk.bar} alert />}
        alert={stats.overdueTasks > 0}
        delayClass="animate-fade-up-delay-2"
      />

      <StatCard
        theme={themes.completion}
        icon={Gauge}
        label="Completion"
        badge="Overall"
        value={completionPct}
        suffix="%"
        subtitle={`${stats.areasOnTrack} of ${areaCount} area${areaCount === 1 ? '' : 's'} on track · KPI avg ${stats.avgKpiProgress}%`}
        trailing={
          <div className="relative flex h-[52px] w-[52px] items-center justify-center">
            <RingGauge value={completionPct} color={themes.completion.bar} />
            <span className="absolute text-[10px] font-bold text-ink">{completionPct}%</span>
          </div>
        }
        delayClass="animate-fade-up-delay-2"
      />
    </div>
  )
}

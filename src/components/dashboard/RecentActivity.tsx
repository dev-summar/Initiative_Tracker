import {
  CheckCircle2,
  CircleDot,
  ClipboardPlus,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import type { ActivityItem } from '../../api/types'
import { AREAS } from '../../data/mockData'
import { formatRelative } from '../../lib/utils'
import { EmptyState } from '../common/EmptyState'
import { cardClass } from '../../lib/design'

const ICONS = {
  task_created: ClipboardPlus,
  task_updated: RefreshCw,
  task_completed: CheckCircle2,
  kpi_updated: TrendingUp,
  status_change: CircleDot,
}

interface RecentActivityProps {
  items: ActivityItem[]
}

export function RecentActivity({ items }: RecentActivityProps) {
  const areaMap = Object.fromEntries(AREAS.map((a) => [a.id, a]))

  if (!items.length) {
    return <EmptyState title="No recent activity" description="Updates will appear here." />
  }

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Recent Activity</h2>
          <p className="text-sm text-ink-muted">Latest changes across areas</p>
        </div>
      </div>
      <ul className="divide-y divide-border">
        {items.slice(0, 8).map((item) => {
          const Icon = ICONS[item.type]
          const area = areaMap[item.areaId]
          return (
            <li key={item.id} className="flex gap-3 px-6 py-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `${area?.color ?? '#A78BFA'}20`,
                  color: area?.color ?? '#A78BFA',
                }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{item.message}</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {area?.name} · {formatRelative(item.createdAt)}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

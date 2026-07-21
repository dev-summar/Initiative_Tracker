import { Link } from 'react-router-dom'
import { AlertCircle, ArrowRight } from 'lucide-react'
import type { Task } from '../../api/types'
import { AREAS } from '../../data/mockData'
import { StatusBadge, PriorityBadge } from '../common/StatusBadge'
import { EmptyState } from '../common/EmptyState'
import { formatDate, isOverdue } from '../../lib/utils'
import { cardClass } from '../../lib/design'

interface NeedsAttentionProps {
  tasks: Task[]
}

const urgencyStyle = (task: Task) => {
  if (task.status === 'blocked') return { bg: '#FEE2E2', text: '#DC2626', label: 'Blocked' }
  if (isOverdue(task.dueDate, task.status)) return { bg: '#FECACA', text: '#B91C1C', label: 'Overdue' }
  if (task.priority === 'critical' || task.priority === 'high')
    return { bg: '#FEF3C7', text: '#D97706', label: 'Due Soon' }
  return { bg: '#FEF9C3', text: '#CA8A04', label: 'At Risk' }
}

export function NeedsAttention({ tasks }: NeedsAttentionProps) {
  const areaMap = Object.fromEntries(AREAS.map((a) => [a.id, a]))

  if (!tasks.length) {
    return (
      <EmptyState
        title="Everything looks on track"
        description="No critical items require your attention right now."
        icon={<AlertCircle className="h-6 w-6" />}
      />
    )
  }

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Needs Your Attention</h2>
          <p className="text-sm text-ink-muted">Critical items that may require action</p>
        </div>
        <span className="rounded-full bg-[#FEE2E2] px-3 py-1 text-xs font-bold text-[#DC2626]">
          {tasks.length}
        </span>
      </div>
      <ul className="divide-y divide-border">
        {tasks.map((task) => {
          const area = areaMap[task.areaId]
          const urgency = urgencyStyle(task)
          return (
            <li
              key={task.id}
              className="flex items-start gap-3 px-6 py-4 transition hover:bg-zinc-50/80"
            >
              <span
                className="mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                style={{ backgroundColor: urgency.bg, color: urgency.text }}
              >
                {urgency.label}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-semibold text-ink">{task.title}</span>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                  <span>{area?.name}</span>
                  <span>·</span>
                  <span>Due {formatDate(task.dueDate)}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
              {area && (
                <Link
                  to={`/area/${area.slug}`}
                  className="rounded-full p-2 text-ink-subtle transition hover:bg-[#EDE9FE] hover:text-[#7C3AED]"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

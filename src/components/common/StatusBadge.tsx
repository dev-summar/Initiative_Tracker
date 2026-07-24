import type { TaskPriority, TaskStatus } from '../../api/types'
import { priorityLabel, statusLabel, cn } from '../../lib/utils'

const statusStyles: Record<TaskStatus, string> = {
  todo: 'bg-zinc-100 text-zinc-600',
  in_progress: 'bg-[#DBEAFE] text-[#2563EB]',
  blocked: 'bg-[#FEE2E2] text-[#DC2626]',
  done: 'bg-[#D1FAE5] text-[#059669]',
}

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-zinc-100 text-zinc-600',
  medium: 'bg-[#FEF3C7] text-[#D97706]',
  high: 'bg-[#FFEDD5] text-[#EA580C]',
  critical: 'bg-[#FEE2E2] text-[#DC2626]',
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        statusStyles[status],
      )}
    >
      {statusLabel(status)}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        priorityStyles[priority],
      )}
    >
      {priorityLabel(priority)}
    </span>
  )
}

import { BadgeCheck } from 'lucide-react'
import type { ChecklistItem, PlanItem, TaskPriority, TaskStatus } from '../../api/types'
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

export function isProcessOwnerVerified(
  checklist: ChecklistItem[] | undefined,
): boolean {
  if (!checklist?.length) return false
  return checklist.some(
    (c) => c.done && (c.id === 'verify' || /verified by process owner/i.test(c.label)),
  )
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

export function ProcessOwnerVerifiedBadge({ item }: { item: PlanItem }) {
  if (!isProcessOwnerVerified(item.checklist)) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[11px] font-semibold text-[#047857]">
      <BadgeCheck className="h-3 w-3" />
      Process owner verified
    </span>
  )
}

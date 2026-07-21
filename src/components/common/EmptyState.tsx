import { Inbox } from 'lucide-react'
import { cardClass } from '../../lib/design'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div
      className={
        cardClass +
        ' flex flex-col items-center justify-center border-dashed px-6 py-14 text-center'
      }
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#7C3AED]">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

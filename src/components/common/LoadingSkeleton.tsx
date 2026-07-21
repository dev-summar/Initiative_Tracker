import { cn } from '../../lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-[1.25rem] border border-border bg-white p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-3 w-20" />
      <Skeleton className="mt-2 h-8 w-14" />
      <Skeleton className="mt-4 h-2 w-full rounded-full" />
      <Skeleton className="mt-3 h-3 w-3/4" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-[1rem]" />
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return <Skeleton className="h-64 w-full rounded-[1.25rem]" />
}

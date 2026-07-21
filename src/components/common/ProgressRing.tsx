import { cn } from '../../lib/utils'

export function ProgressRing({
  value,
  color,
  size = 72,
  stroke = 6,
  label,
  sublabel,
  className,
}: {
  value: number
  color: string
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
  className?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.min(100, Math.max(0, value))
  const offset = c - (clamped / 100) * c

  return (
    <div className={cn('relative inline-flex shrink-0 items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
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
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label !== undefined && (
          <span className="text-lg font-bold leading-none text-ink">{label}</span>
        )}
        {sublabel && <span className="mt-0.5 text-[9px] font-semibold uppercase text-ink-muted">{sublabel}</span>}
      </div>
    </div>
  )
}

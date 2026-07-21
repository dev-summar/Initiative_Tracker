export const tooltipStyle = {
  borderRadius: 12,
  border: 'none',
  background: '#0f0f0f',
  color: '#fff',
  fontSize: 12,
  padding: '8px 12px',
}

export function ChartCard({
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
    <div
      className={`rounded-[1.25rem] border border-border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:p-6 ${className ?? ''}`}
    >
      <div className="mb-4">
        <h2 className="text-base font-bold text-ink md:text-lg">{title}</h2>
        <p className="text-xs text-ink-muted md:text-sm">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

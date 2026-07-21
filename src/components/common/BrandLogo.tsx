import { useId } from 'react'
import { cn } from '../../lib/utils'

type BrandLogoSize = 'sm' | 'md' | 'lg'

interface BrandLogoProps {
  size?: BrandLogoSize
  showText?: boolean
  subtitle?: string
  className?: string
}

const markSizes: Record<BrandLogoSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
}

function BrandMark({ size = 40, className }: { size?: number; className?: string }) {
  const gradientId = useId().replace(/:/g, '')

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="40" height="40" rx="11" fill="#18181B" />
      <rect
        x="0.75"
        y="0.75"
        width="38.5"
        height="38.5"
        rx="10.25"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
        strokeOpacity="0.85"
      />
      <path d="M11 27h18" stroke="#B4A7E5" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M11 20h13" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M11 13h8" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="28" cy="13" r="3" fill="#60A5FA" />
      <path
        d="M28 16.5v4.5"
        stroke="#60A5FA"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.55"
      />
      <defs>
        <linearGradient id={gradientId} x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B4A7E5" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function BrandLogo({
  size = 'md',
  showText = true,
  subtitle = 'Operations & KPIs',
  className,
}: BrandLogoProps) {
  const markSize = markSizes[size]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <BrandMark size={markSize} className="shrink-0" />
      {showText && (
        <div className="min-w-0">
          <p
            className={cn(
              'font-bold leading-tight text-white',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base',
            )}
          >
            Initiative Tracker
          </p>
          <p
            className={cn(
              'text-zinc-500',
              size === 'sm' && 'text-[10px]',
              size === 'md' && 'text-xs',
              size === 'lg' && 'text-sm',
            )}
          >
            {subtitle}
          </p>
        </div>
      )}
    </div>
  )
}

export { BrandMark }

import { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'
import { initials } from '../../api/client'

const sizeStyles = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-xl',
} as const

export function UserAvatar({
  src,
  name,
  size = 'md',
  className,
}: {
  src?: string | null
  name?: string
  size?: keyof typeof sizeStyles
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const showImage = Boolean(src) && !failed
  const label = initials(name || 'User') || '?'

  if (showImage) {
    return (
      <img
        src={src!}
        alt={name ? `${name}'s profile` : 'Profile'}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={cn(
          sizeStyles[size],
          'shrink-0 rounded-full object-cover ring-2 ring-white/10',
          className,
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        sizeStyles[size],
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B4A7E5] to-[#60A5FA] font-bold text-white ring-2 ring-white/10',
        className,
      )}
      aria-hidden={!name}
      title={name}
    >
      {label}
    </div>
  )
}

export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function formatHeaderDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export const PRIORITY_CHART_COLORS: Record<string, string> = {
  low: '#94A3B8',
  medium: '#FBBF24',
  high: '#F97316',
  critical: '#EF4444',
}

export const STATUS_CHART_COLORS: Record<string, string> = {
  todo: '#A1A1AA',
  in_progress: '#3B82F6',
  done: '#10B981',
  blocked: '#EF4444',
}

export const CHART_COLORS = {
  lavender: '#A78BFA',
  sky: '#60A5FA',
  amber: '#FBBF24',
  gray: '#E4E4E7',
  rose: '#FB7185',
  teal: '#5EEAD4',
  indigo: '#818CF8',
}

export const cardClass =
  'rounded-[1.25rem] border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]'

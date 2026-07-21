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

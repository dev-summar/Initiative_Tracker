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

/** Site-wide chart palette — red, green, and yellow only. */
export const CHART_PALETTE = {
  red: '#EF4444',
  green: '#22C55E',
  yellow: '#EAB308',
} as const

export const CHART_SERIES = [CHART_PALETTE.green, CHART_PALETTE.yellow, CHART_PALETTE.red] as const

export function chartSeriesColor(index: number): string {
  return CHART_SERIES[index % CHART_SERIES.length]
}

/** Heatmap / completion intensity using the chart palette. */
export function chartHeatColor(pct: number | null): string {
  if (pct === null) return '#f4f4f5'
  if (pct >= 50) return CHART_PALETTE.green
  if (pct > 0) return CHART_PALETTE.yellow
  return CHART_PALETTE.red
}

export const PRIORITY_CHART_COLORS: Record<string, string> = {
  low: CHART_PALETTE.green,
  medium: CHART_PALETTE.yellow,
  high: CHART_PALETTE.red,
  critical: CHART_PALETTE.red,
}

export const STATUS_CHART_COLORS: Record<string, string> = {
  todo: CHART_PALETTE.red,
  in_progress: CHART_PALETTE.yellow,
  done: CHART_PALETTE.green,
  blocked: CHART_PALETTE.red,
}

export const CHART_COLORS = {
  red: CHART_PALETTE.red,
  green: CHART_PALETTE.green,
  yellow: CHART_PALETTE.yellow,
}

export const cardClass =
  'rounded-[1.25rem] border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]'

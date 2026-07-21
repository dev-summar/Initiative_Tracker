export const PLAN_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const
export type PlanPriority = (typeof PLAN_PRIORITIES)[number]

/** Map strategic plan phase timelines (PDF Tables 7–13) to execution priority. */
export function inferPlanItemPriority(phase: string, status: string): PlanPriority {
  const p = phase.trim()
  if (status === 'blocked') return 'critical'
  if (/Phase\s*1|Phase 1/i.test(p)) return status === 'done' ? 'medium' : 'high'
  if (/Phase\s*2|Phase 2/i.test(p)) return status === 'done' ? 'low' : 'medium'
  if (/Phase\s*3|Ongoing|2\s*-\s*3\s*Years|3\s*Years/i.test(p)) return 'low'
  if (status === 'in_progress') return 'high'
  if (status === 'done') return 'low'
  return 'medium'
}

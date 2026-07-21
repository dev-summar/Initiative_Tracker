import type { TaskPriority, TaskStatus } from '../api/types'
import { PRIORITY_LABELS, STATUS_LABELS } from '../data/mockData'

export function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(iso)
}

export function statusLabel(s: TaskStatus | string) {
  return STATUS_LABELS[s] ?? s
}

export function priorityLabel(p: TaskPriority | string) {
  return PRIORITY_LABELS[p] ?? p
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function progressPct(value: number, target: number) {
  if (target <= 0) return 0
  return Math.min(100, Math.round((value / target) * 100))
}

export function isOverdue(dueDate: string, status: TaskStatus) {
  if (status === 'done') return false
  return new Date(dueDate) < new Date(new Date().toDateString())
}

import type { LucideIcon } from 'lucide-react'
import {
  Compass,
  GraduationCap,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

const MAP: Record<string, LucideIcon> = {
  Compass,
  ShieldCheck,
  Users,
  Settings,
  Sparkles,
  GraduationCap,
}

export function getAreaIcon(name: string): LucideIcon {
  return MAP[name] ?? Compass
}

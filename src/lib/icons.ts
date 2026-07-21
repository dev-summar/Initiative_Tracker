import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Building2,
  Compass,
  Cpu,
  FileText,
  FlaskConical,
  GraduationCap,
  Leaf,
  Megaphone,
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
  Cpu,
  FlaskConical,
  BookOpen,
  Building2,
  Megaphone,
  Leaf,
  FileText,
}

export function getAreaIcon(name: string): LucideIcon {
  return MAP[name] ?? Compass
}

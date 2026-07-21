import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useTrackerStore } from '../../store/useTrackerStore'
import { cn } from '../../lib/utils'
import { AREAS } from '../../data/mockData'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const collapsed = useTrackerStore((s) => s.sidebarCollapsed)

  return (
    <div className="min-h-full overflow-x-hidden bg-white">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div
        className={cn(
          'min-h-full min-w-0 transition-[padding] duration-200',
          collapsed ? 'md:pl-[60px]' : 'md:pl-60',
        )}
      >
        <Outlet context={{ openMobileMenu: () => setMobileOpen(true), areas: AREAS }} />
      </div>
    </div>
  )
}

export type AppOutletContext = {
  openMobileMenu: () => void
  areas: typeof AREAS
}

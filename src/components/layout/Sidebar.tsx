import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { AREAS } from '../../data/mockData'
import { getAreaIcon } from '../../lib/icons'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { UserAvatar } from '../common/UserAvatar'
import { BrandMark } from '../common/BrandLogo'
import { taskService } from '../../services/taskService'
import { subAreaService } from '../../services/subAreaService'
import { useTrackerStore } from '../../store/useTrackerStore'

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

function SidebarLink({
  to,
  end,
  collapsed,
  label,
  count,
  color,
  icon,
  onNavigate,
}: {
  to: string
  end?: boolean
  collapsed: boolean
  label: string
  count?: number
  color?: string
  icon: React.ReactNode
  onNavigate?: () => void
}) {
  return (
    <NavLink to={to} end={end} onClick={onNavigate} title={collapsed ? label : undefined}>
      {({ isActive }) => (
        <span
          className={cn(
            'flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] transition-colors',
            isActive
              ? 'bg-white/10 font-medium text-white'
              : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200',
            collapsed && 'justify-center px-2',
          )}
        >
          <span
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center',
              !isActive && 'opacity-80',
            )}
            style={color && isActive ? { color } : undefined}
          >
            {icon}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={cn(
                    'text-[11px] tabular-nums',
                    isActive ? 'text-zinc-300' : 'text-zinc-600',
                  )}
                >
                  {count}
                </span>
              )}
            </>
          )}
        </span>
      )}
    </NavLink>
  )
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const collapsed = useTrackerStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useTrackerStore((s) => s.setSidebarCollapsed)
  const [openByArea, setOpenByArea] = useState<Record<string, number>>({})

  useEffect(() => {
    taskService
      .list()
      .then((list) => {
        const map: Record<string, number> = {}
        for (const area of AREAS) {
          map[area.id] = list.filter((t) => t.areaId === area.id && t.status !== 'done').length
        }
        setOpenByArea(map)
      })
      .catch(() => setOpenByArea({}))

    subAreaService
      .list('area-strategy')
      .then((plans) => {
        const pending = plans.reduce(
          (n, p) => n + (p.stats?.total ?? 0) - (p.stats?.done ?? 0),
          0,
        )
        setOpenByArea((prev) => ({ ...prev, 'area-strategy': pending || prev['area-strategy'] || 0 }))
      })
      .catch(() => {})
  }, [location.pathname])

  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const displayName = user?.name ?? 'User'
  const displayRole = user?.designation ?? user?.role ?? 'Management'
  const avatarUrl = user?.avatar ?? user?.pi360?.avatar
  const strategyCount = openByArea['area-strategy'] ?? 0

  const panel = (
    <div className="flex h-full flex-col bg-[#0f0f0f]">
      <div className={cn('flex h-14 shrink-0 items-center gap-2.5 px-4', collapsed && 'justify-center px-2')}>
        <BrandMark size={32} />
        {!collapsed && (
          <span className="truncate text-sm font-semibold tracking-tight text-white">
            Initiative Tracker
          </span>
        )}
      </div>

      <nav className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-2 scrollbar-thin">
        <div>
          <SidebarLink
            to="/"
            end
            collapsed={collapsed}
            label="Overview"
            onNavigate={onMobileClose}
            icon={<LayoutDashboard className="h-[18px] w-[18px]" strokeWidth={2} />}
          />
        </div>

        <div>
          {!collapsed && (
            <p className="mb-2 px-2.5 text-[11px] font-medium text-zinc-600">Areas</p>
          )}
          {collapsed && <div className="mb-2 border-t border-white/[0.06]" />}
          <div className="space-y-0.5">
            {AREAS.map((area) => {
              const Icon = getAreaIcon(area.icon)
              const to = area.slug === 'strategy' ? '/area/strategy' : `/area/${area.slug}`
              const count =
                area.slug === 'strategy' ? strategyCount : openByArea[area.id] ?? 0
              return (
                <SidebarLink
                  key={area.id}
                  to={to}
                  collapsed={collapsed}
                  label={area.name}
                  count={count}
                  color={area.color}
                  onNavigate={onMobileClose}
                  icon={
                    <Icon
                      className="h-[18px] w-[18px]"
                      strokeWidth={2}
                      style={{ color: area.color }}
                    />
                  }
                />
              )
            })}
          </div>
        </div>
      </nav>

      <div className="shrink-0 border-t border-white/[0.06] p-3">
        <div
          className={cn(
            'mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2',
            collapsed && 'justify-center px-0',
          )}
        >
          <UserAvatar src={avatarUrl} name={displayName} size="sm" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{displayName}</p>
              <p className="truncate text-xs text-zinc-500">{displayRole}</p>
            </div>
          )}
        </div>

        <div className={cn('flex gap-1', collapsed && 'flex-col')}>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-300',
              !collapsed && 'justify-start px-2.5',
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && 'Log out'}
          </button>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!collapsed)}
            className="hidden items-center justify-center rounded-lg p-2 text-zinc-600 transition hover:bg-white/[0.04] hover:text-zinc-400 md:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r border-white/[0.06] transition-[width] duration-200 md:block',
          collapsed ? 'w-[60px]' : 'w-60',
        )}
      >
        {panel}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60"
            onClick={onMobileClose}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-white/[0.06] bg-[#0f0f0f] shadow-xl">
            <button
              type="button"
              onClick={onMobileClose}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-500 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            {panel}
          </aside>
        </div>
      )}
    </>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-border bg-white p-2 text-ink md:hidden"
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}

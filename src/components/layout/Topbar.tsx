import { useEffect, useState } from 'react'
import { Filter, Plus, Search, Upload } from 'lucide-react'
import { SearchModal } from '../common/SearchModal'
import { CsvImportModal } from '../common/CsvImportModal'
import { MobileMenuButton } from './Sidebar'
import { formatHeaderDate } from '../../lib/design'

interface TopbarProps {
  title: string
  subtitle?: string
  onToggleFilters?: () => void
  filtersActive?: boolean
  onImported?: () => void
  defaultAreaId?: string
  onMobileMenu: () => void
  onAddTask?: () => void
}

export function Topbar({
  title,
  subtitle,
  onToggleFilters,
  filtersActive,
  onImported,
  defaultAreaId,
  onMobileMenu,
  onAddTask,
}: TopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4 sm:py-3.5 md:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <MobileMenuButton onClick={onMobileMenu} />
            <div className="min-w-0">
              <p className="text-[11px] text-ink-muted sm:text-xs">{formatHeaderDate()}</p>
              <h1 className="truncate text-lg font-bold tracking-tight text-ink sm:text-xl md:text-2xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-0.5 truncate text-xs text-ink-muted sm:text-sm">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink-muted transition hover:bg-zinc-50 sm:flex"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
              <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-subtle">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-lg border border-border p-2 text-ink-muted sm:hidden"
            >
              <Search className="h-4 w-4" />
            </button>

            {onToggleFilters && (
              <button
                type="button"
                onClick={onToggleFilters}
                className={`rounded-lg border p-2 transition ${
                  filtersActive
                    ? 'border-violet-200 bg-violet-50 text-violet-700'
                    : 'border-border text-ink-muted hover:bg-zinc-50'
                }`}
              >
                <Filter className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink transition hover:bg-zinc-50 sm:inline-flex"
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </button>

            {onAddTask && (
              <button
                type="button"
                onClick={onAddTask}
                className="inline-flex items-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Task</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CsvImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        defaultAreaId={defaultAreaId}
        onImported={onImported}
      />
    </>
  )
}

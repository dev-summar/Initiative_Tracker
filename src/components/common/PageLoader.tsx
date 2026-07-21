export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-[#0f0f0f]" />
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    </div>
  )
}

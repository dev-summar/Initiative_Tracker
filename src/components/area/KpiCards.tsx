import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import type { CreateKpiInput, Kpi } from '../../api/types'
import { kpiService } from '../../services/kpiService'
import { Modal } from '../common/Modal'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { EmptyState } from '../common/EmptyState'
import { ProgressRing } from '../common/ProgressRing'
import { progressPct, cn } from '../../lib/utils'

interface KpiCardsProps {
  areaId: string
  kpis: Kpi[]
  accent: string
  onChanged: () => void
}

const emptyForm: Omit<CreateKpiInput, 'areaId'> = {
  name: '',
  value: 0,
  target: 100,
  unit: '%',
  trend: 0,
}

export function KpiCards({ areaId, kpis, accent, onChanged }: KpiCardsProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Kpi | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (kpi: Kpi) => {
    setEditing(kpi)
    setForm({
      name: kpi.name,
      value: kpi.value,
      target: kpi.target,
      unit: kpi.unit,
      trend: kpi.trend,
    })
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.name.trim()) {
      toast.error('KPI name is required')
      return
    }
    setBusy(true)
    try {
      if (editing) {
        await kpiService.update(editing.id, form)
        toast.success('KPI updated')
      } else {
        await kpiService.create({ ...form, areaId })
        toast.success('KPI created')
      }
      setModalOpen(false)
      onChanged()
    } catch {
      toast.error('Failed to save KPI')
    } finally {
      setBusy(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await kpiService.remove(deleteId)
      toast.success('KPI deleted')
      setDeleteId(null)
      onChanged()
    } catch {
      toast.error('Failed to delete KPI')
    }
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">KPIs & Metrics</h2>
          <p className="mt-0.5 text-sm text-ink-muted">Targets and momentum for this area</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-pill btn-primary">
          <Plus className="h-4 w-4" />
          Add KPI
        </button>
      </div>

      {kpis.length === 0 ? (
        <EmptyState
          title="No KPIs yet"
          description="Add your first KPI to start tracking performance."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              Add KPI
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi, i) => {
            const pct = progressPct(kpi.value, kpi.target)
            const up = kpi.trend >= 0
            return (
              <div
                key={kpi.id}
                className={cn(
                  'group relative overflow-hidden rounded-[1.25rem] border border-border bg-white p-5 transition-all duration-300',
                  'hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]',
                  i === 0 && 'animate-fade-up',
                  i > 0 && 'animate-fade-up-delay-1',
                )}
              >
                <div
                  className="absolute inset-y-0 left-0 w-1 rounded-l-[1.25rem] transition-all group-hover:w-1.5"
                  style={{ backgroundColor: accent }}
                />

                <div className="mb-4 flex items-start justify-between gap-3 pl-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">KPI</p>
                    <h3 className="mt-0.5 line-clamp-2 font-semibold leading-snug text-ink">{kpi.name}</h3>
                  </div>
                  <div className="flex shrink-0 items-start gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold',
                        up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
                      )}
                    >
                      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {up ? '+' : ''}
                      {kpi.trend}
                    </span>
                    <div className="flex gap-0.5 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => openEdit(kpi)}
                        className="rounded-lg p-1.5 text-ink-muted hover:bg-zinc-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(kpi.id)}
                        className="rounded-lg p-1.5 text-ink-muted hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pl-2">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight text-ink">{kpi.value}</span>
                      <span className="text-sm font-medium text-ink-muted">
                        / {kpi.target} {kpi.unit}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">{pct}% of target reached</p>
                  </div>
                  <ProgressRing value={pct} color={accent} size={64} stroke={5} label={`${pct}%`} />
                </div>

                <div className="relative mt-4 pl-2">
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%`, backgroundColor: accent }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit KPI' : 'Add KPI'}
        description={
          editing ? 'Update this performance metric.' : 'Track a new target for this area.'
        }
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-pill btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy || !form.name.trim()}
              onClick={save}
              className="btn-pill btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Create KPI'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name">
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="field-input"
              placeholder="e.g. OKR Completion"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Current value">
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                className="field-input"
              />
            </Field>
            <Field label="Target">
              <input
                type="number"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: Number(e.target.value) })}
                className="field-input"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Unit">
              <input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="field-input"
                placeholder="%, projects, days…"
              />
            </Field>
            <Field label="Trend">
              <input
                type="number"
                step="0.1"
                value={form.trend}
                onChange={(e) => setForm({ ...form, trend: Number(e.target.value) })}
                className="field-input"
                placeholder="e.g. 1.5"
              />
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete KPI"
        message="Are you sure you want to delete this KPI? This cannot be undone."
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  )
}

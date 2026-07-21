import { useState } from 'react'
import Papa from 'papaparse'
import { toast } from 'sonner'
import { Download, Upload } from 'lucide-react'
import type { CreateTaskInput, TaskPriority, TaskStatus } from '../../api/types'
import { AREAS } from '../../data/mockData'
import { taskService } from '../../services/taskService'
import { Modal } from './Modal'

interface CsvImportModalProps {
  open: boolean
  onClose: () => void
  defaultAreaId?: string
  onImported?: () => void
}

const SAMPLE_FILENAME = 'task-import-sample.csv'

const SAMPLE = `title,description,status,priority,dueDate,areaSlug
Review counseling scripts,Update scripts for peak season,todo,high,2026-08-01,admissions
Lab safety checklist,Complete checklist for Block B,in_progress,medium,2026-07-28,operational`

const AREA_SLUG_HINT = AREAS.map((area) => area.slug).join(', ')

function downloadSampleCsv() {
  const blob = new Blob([SAMPLE], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = SAMPLE_FILENAME
  link.click()
  URL.revokeObjectURL(url)
}

function parseStatus(v: string): TaskStatus {
  const s = v.trim().toLowerCase().replace(/\s+/g, '_')
  if (['todo', 'in_progress', 'blocked', 'done'].includes(s)) return s as TaskStatus
  return 'todo'
}

function parsePriority(v: string): TaskPriority {
  const p = v.trim().toLowerCase()
  if (['low', 'medium', 'high', 'critical'].includes(p)) return p as TaskPriority
  return 'medium'
}

export function CsvImportModal({ open, onClose, defaultAreaId, onImported }: CsvImportModalProps) {
  const [preview, setPreview] = useState<CreateTaskInput[]>([])
  const [rawName, setRawName] = useState('')
  const [busy, setBusy] = useState(false)

  const handleFile = (file: File) => {
    setRawName(file.name)
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows: CreateTaskInput[] = []
        for (const row of result.data) {
          const title = (row.title || row.Title || '').trim()
          if (!title) continue
          const slug = (row.areaSlug || row.area || row.Area || '').trim().toLowerCase()
          const area =
            AREAS.find((a) => a.slug === slug || a.name.toLowerCase() === slug) ??
            AREAS.find((a) => a.id === defaultAreaId) ??
            AREAS[0]
          rows.push({
            areaId: area.id,
            title,
            description: (row.description || row.Description || '').trim(),
            status: parseStatus(row.status || row.Status || 'todo'),
            priority: parsePriority(row.priority || row.Priority || 'medium'),
            dueDate: (row.dueDate || row.DueDate || new Date().toISOString().slice(0, 10)).trim(),
          })
        }
        setPreview(rows)
        if (!rows.length) toast.error('No valid rows found in CSV')
      },
      error: () => toast.error('Failed to parse CSV'),
    })
  }

  const handleImport = async () => {
    if (!preview.length) return
    setBusy(true)
    try {
      const count = await taskService.importCsv(preview)
      toast.success(`Imported ${count} task(s)`)
      setPreview([])
      setRawName('')
      onImported?.()
      onClose()
    } catch {
      toast.error('Import failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import tasks from CSV"
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-ink-muted hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!preview.length || busy}
            onClick={handleImport}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-indigo-600"
          >
            {busy ? 'Importing…' : `Import ${preview.length || ''} task(s)`}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-ink-muted">
          Upload a CSV with columns: title, description, status, priority, dueDate, areaSlug.
          Valid status: todo, in_progress, blocked, done. Valid priority: low, medium, high,
          critical.
        </p>
        <p className="text-xs text-ink-muted">
          Valid areaSlug values: {AREA_SLUG_HINT}
        </p>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-slate-50 px-4 py-8 transition hover:border-brand hover:bg-brand-soft/40">
          <Upload className="mb-2 h-6 w-6 text-brand" />
          <span className="text-sm font-medium text-ink">
            {rawName || 'Click to choose a CSV file'}
          </span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
        </label>
        <div className="rounded-xl border border-border bg-slate-50 p-3 text-xs text-ink-muted">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-ink">Sample format</p>
            <button
              type="button"
              onClick={downloadSampleCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand-soft/40"
            >
              <Download className="h-3.5 w-3.5" />
              Download sample CSV
            </button>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer font-medium text-ink">Preview sample rows</summary>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{SAMPLE}</pre>
          </details>
        </div>
        {preview.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">Preview ({preview.length})</h4>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-border p-2 scrollbar-thin">
              {preview.slice(0, 20).map((row, i) => (
                <div key={i} className="truncate rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50">
                  <span className="font-medium text-ink">{row.title}</span>
                  <span className="text-ink-muted"> · {row.status} · {row.priority}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

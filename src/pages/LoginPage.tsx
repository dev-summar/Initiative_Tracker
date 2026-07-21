import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, Compass, Loader2, Lock, Mail, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { BrandLogo } from '../components/common/BrandLogo'
import { getGreeting } from '../lib/design'

const AREA_PILLS = [
  { label: 'Strategy', color: '#A78BFA' },
  { label: 'Quality Assurance', color: '#60A5FA' },
  { label: 'Recruitment', color: '#FBBF24' },
  { label: 'Operational', color: '#5EEAD4' },
  { label: 'Special Initiatives', color: '#818CF8' },
  { label: 'Admissions', color: '#B4A7E5' },
]

export function LoginPage() {
  const { login, user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null)

  if (!loading && user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left — brand panel (desktop) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0f0f0f] px-10 py-12 lg:flex xl:px-14">
        <div>
          <BrandLogo size="lg" />

          <div className="mt-14">
            <p className="text-3xl font-bold leading-tight text-white">{getGreeting()} 👋</p>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-zinc-400">
              Track initiatives, operations, KPIs, and priorities across your organization — all in
              one place.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {[
              { icon: Compass, text: 'Six operational areas with live progress' },
              { icon: BarChart3, text: 'Executive dashboards and KPI tracking' },
              { icon: Shield, text: 'Secure PI-360 institutional login' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-zinc-400">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
                  <Icon className="h-4 w-4 text-[#B4A7E5]" />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
            Operational Areas
          </p>
          <div className="flex flex-wrap gap-2">
            {AREA_PILLS.map((area) => (
              <span
                key={area.label}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300"
                style={{ borderColor: `${area.color}44` }}
              >
                <span
                  className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: area.color }}
                />
                {area.label}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* Right — sign in */}
      <main className="flex min-h-screen items-center justify-center bg-[#F3F4F6] px-6 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 rounded-2xl bg-[#0f0f0f] p-4 lg:hidden">
            <BrandLogo size="md" />
          </div>
          <div className="mb-10">
            <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-[#0f0f0f]">
              Sign in
            </h1>
            <p className="mt-2 text-[0.9375rem] text-[#71717a]">
              Use your PI-360 account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#71717a]">
                Email or username
              </span>
              <div className="relative">
                <Mail
                  className={`pointer-events-none absolute left-4 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 transition-colors ${
                    focusedField === 'email' ? 'text-[#8b5cf6]' : 'text-[#a1a1aa]'
                  }`}
                />
                <input
                  type="text"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@mietjammu.in"
                  required
                  className="login-input"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#71717a]">
                Password
              </span>
              <div className="relative">
                <Lock
                  className={`pointer-events-none absolute left-4 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 transition-colors ${
                    focusedField === 'password' ? 'text-[#8b5cf6]' : 'text-[#a1a1aa]'
                  }`}
                />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="login-input"
                />
              </div>
            </label>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0f0f0f] text-[0.9375rem] font-semibold text-white transition hover:bg-[#262626] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mx-auto mt-8 max-w-[320px] text-center text-[0.8125rem] leading-relaxed text-[#71717a]">
            Authorized managers and directors only. Contact your PI-360 administrator if you need
            access.
          </p>
        </div>
      </main>
    </div>
  )
}

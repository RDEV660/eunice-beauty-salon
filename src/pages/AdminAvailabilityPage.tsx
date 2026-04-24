import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { apiUrl } from '../lib/api'

const STORAGE_KEY = 'eunice_admin_session'

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` }
}

export function AdminAvailabilityPage() {
  const { t } = useTranslation()
  const [token, setToken] = useState(() => sessionStorage.getItem(STORAGE_KEY) ?? '')
  const [input, setInput] = useState('')
  const [dates, setDates] = useState<string[]>([])
  const [addDate, setAddDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const authed = Boolean(token)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(apiUrl('/api/admin/blocked'), { headers: authHeaders(token) })
      const data = (await r.json()) as { dates?: string[]; error?: string }
      if (r.status === 401) {
        sessionStorage.removeItem(STORAGE_KEY)
        setToken('')
        setDates([])
        setError(t('admin.wrongPassword'))
        return
      }
      if (r.status === 501) {
        setError(t('admin.notConfigured'))
        return
      }
      if (!r.ok) {
        setError(t('admin.loadError'))
        return
      }
      setDates(data.dates ?? [])
    } catch {
      setError(t('admin.loadError'))
    } finally {
      setLoading(false)
    }
  }, [token, t])

  useEffect(() => {
    if (token) void load()
  }, [token, load])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    const pass = input.trim()
    if (!pass) return
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(apiUrl('/api/admin/blocked'), { headers: authHeaders(pass) })
      if (r.status === 401) {
        setError(t('admin.wrongPassword'))
        return
      }
      if (r.status === 501) {
        setError(t('admin.notConfigured'))
        return
      }
      if (!r.ok) {
        setError(t('admin.loadError'))
        return
      }
      const data = (await r.json()) as { dates?: string[] }
      sessionStorage.setItem(STORAGE_KEY, pass)
      setToken(pass)
      setInput('')
      setDates(data.dates ?? [])
    } catch {
      setError(t('admin.loadError'))
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY)
    setToken('')
    setDates([])
    setError(null)
  }

  async function add() {
    const d = addDate.trim()
    if (!d || !token) return
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(apiUrl('/api/admin/blocked'), {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: d }),
      })
      const data = (await r.json()) as { dates?: string[]; error?: string }
      if (r.status === 401) {
        logout()
        setError(t('admin.wrongPassword'))
        return
      }
      if (r.status === 400 && data.error === 'invalid_date') {
        setError(t('admin.invalidDate'))
        return
      }
      if (!r.ok) {
        setError(t('admin.saveError'))
        return
      }
      setDates(data.dates ?? [])
      setAddDate('')
    } catch {
      setError(t('admin.saveError'))
    } finally {
      setLoading(false)
    }
  }

  async function remove(ymd: string) {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(apiUrl(`/api/admin/blocked?date=${encodeURIComponent(ymd)}`), {
        method: 'DELETE',
        headers: authHeaders(token),
      })
      const data = (await r.json()) as { dates?: string[] }
      if (r.status === 401) {
        logout()
        setError(t('admin.wrongPassword'))
        return
      }
      if (!r.ok) {
        setError(t('admin.saveError'))
        return
      }
      setDates(data.dates ?? [])
    } catch {
      setError(t('admin.saveError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <p className="mb-6 text-center">
        <Link to="/" className="text-sm text-gold-400/90 underline-offset-4 hover:underline">
          {t('admin.backHome')}
        </Link>
      </p>
      <h1 className="font-serif text-2xl font-semibold tracking-wide text-gold-200">
        {t('admin.title')}
      </h1>
      <p className="mt-2 text-sm text-white/70">{t('admin.subtitle')}</p>
      <p className="mt-3 text-xs leading-relaxed text-amber-200/80">{t('admin.vercelStorageHint')}</p>

      {!authed ? (
        <form onSubmit={login} className="mt-8 space-y-4">
          <label className="block text-sm text-white/85">
            {t('admin.passwordLabel')}
            <input
              type="password"
              autoComplete="current-password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white outline-none ring-gold-400/30 focus:ring-2"
            />
          </label>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-gold-500/90 px-4 py-2 text-sm font-medium text-black transition enabled:hover:bg-gold-400 disabled:opacity-50"
          >
            {loading ? t('admin.working') : t('admin.continue')}
          </button>
        </form>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={logout}
              className="text-sm text-white/60 underline-offset-4 hover:text-white/90 hover:underline"
            >
              {t('admin.signOut')}
            </button>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gold-300/95">{t('admin.blockNew')}</h2>
            <p className="mt-1 text-xs text-white/55">{t('admin.blockNewHelp')}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                type="date"
                value={addDate}
                onChange={(e) => setAddDate(e.target.value)}
                className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white outline-none [color-scheme:dark]"
              />
              <button
                type="button"
                onClick={() => void add()}
                disabled={loading || !addDate}
                className="rounded-lg border border-gold-500/50 bg-gold-500/15 px-4 py-2 text-sm text-gold-100 transition enabled:hover:bg-gold-500/25 disabled:opacity-50"
              >
                {t('admin.addDay')}
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gold-300/95">{t('admin.blockedList')}</h2>
            {loading && dates.length === 0 ? (
              <p className="mt-2 text-sm text-white/50">{t('admin.working')}</p>
            ) : dates.length === 0 ? (
              <p className="mt-2 text-sm text-white/50">{t('admin.noBlocked')}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {dates.map((d) => (
                  <li
                    key={d}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <span className="font-mono text-sm text-white/90">{d}</span>
                    <button
                      type="button"
                      onClick={() => void remove(d)}
                      disabled={loading}
                      className="text-sm text-rose-400/95 underline-offset-4 hover:underline disabled:opacity-50"
                    >
                      {t('admin.unblock')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}
        </div>
      )}
    </main>
  )
}

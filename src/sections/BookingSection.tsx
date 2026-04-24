import { useId, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { MotionSection } from '../components/MotionSection'
import { apiUrl } from '../lib/api'

const SERVICE_KEYS = ['cut', 'color', 'treatments', 'special', 'other'] as const

function isSquareProductionEnv(): boolean {
  return (
    String(import.meta.env.VITE_SQUARE_ENVIRONMENT ?? '')
      .trim()
      .toLowerCase() === 'production'
  )
}

const SQUARE_CDN_SANDBOX = 'https://sandbox.web.squarecdn.com/v1/square.js'
const SQUARE_CDN_PRODUCTION = 'https://web.squarecdn.com/v1/square.js'

/** When the API returns no bookable times, we still take a deposit with a TBD machine-readable slot. */
const SLOT_TBD = '2100-01-01T12:00:00.000Z'

/**
 * Sandbox Application IDs (e.g. `sandbox-sq0idb-...`) must use the sandbox CDN,
 * even if VITE_SQUARE_ENVIRONMENT is mistakenly set to `production` on the host.
 */
function squareScriptUrlForApplicationId(appId: string): string {
  if (/sandbox/i.test(appId)) {
    if (isSquareProductionEnv()) {
      console.warn(
        'Square: Application ID is sandbox, loading sandbox Web Payments SDK (ignoring VITE_SQUARE_ENVIRONMENT=production).',
      )
    }
    return SQUARE_CDN_SANDBOX
  }
  return isSquareProductionEnv() ? SQUARE_CDN_PRODUCTION : SQUARE_CDN_SANDBOX
}

function loadSquareScript(src: string): Promise<void> {
  if (document.querySelector(`script[src="${src}"]`)) {
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('square_script'))
    document.head.appendChild(s)
  })
}

type CardHandle = {
  attach: (selector: string) => Promise<void>
  destroy: () => Promise<void>
  tokenize: () => Promise<{
    status: string
    token?: string
    errors?: { message: string }[]
  }>
}

type SquarePayments = {
  card: (options?: Record<string, unknown>) => Promise<CardHandle>
}

type SquareGlobal = {
  payments: (applicationId: string, locationId: string) => SquarePayments
}

export function BookingSection() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const reactId = useId()
  const cardContainerId = `sq-card-${reactId.replace(/:/g, '')}`

  const appId = (import.meta.env.VITE_SQUARE_APPLICATION_ID ?? '').trim()
  const locationId = (import.meta.env.VITE_SQUARE_LOCATION_ID ?? '').trim()
  const missingSquareConfig = !appId || !locationId

  const cardRef = useRef<CardHandle | null>(null)

  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [slotsLoadFailed, setSlotsLoadFailed] = useState(false)
  const [flexPreferred, setFlexPreferred] = useState('')
  const [squareReady, setSquareReady] = useState(false)
  const [squareError, setSquareError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState<string>(SERVICE_KEYS[0])
  const [slot, setSlot] = useState('')
  const [note, setNote] = useState('')
  const [terms, setTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch(apiUrl('/api/slots?days=14'))
        if (!r.ok) {
          console.error(
            '[Eunice booking] /api/slots HTTP',
            r.status,
            '— site owner: set VITE_API_BASE in Vercel to your API URL (no trailing slash), then redeploy.',
          )
          if (!cancelled) {
            setSlotsLoadFailed(true)
            setSlots([])
          }
        } else {
          const data = (await r.json()) as { slots?: string[] }
          if (!cancelled) {
            setSlotsLoadFailed(false)
            setSlots(data.slots ?? [])
          }
        }
      } catch (e) {
        console.error(
          '[Eunice booking] /api/slots unreachable — site owner: set VITE_API_BASE in Vercel to your API URL, then redeploy.',
          e,
        )
        if (!cancelled) {
          setSlotsLoadFailed(true)
          setSlots([])
        }
      } finally {
        if (!cancelled) setSlotsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useLayoutEffect(() => {
    if (missingSquareConfig) return

    let cancelled = false
    void Promise.resolve().then(() => {
      if (!cancelled) setSquareReady(false)
    })

    const reasonIfAny = (err: unknown): string | null => {
      if (err instanceof Error) {
        const m = err.message?.trim() ?? ''
        if (m && m.length < 180 && !/\n\s+at\s/.test(m)) return m
      }
      return null
    }

    ;(async () => {
      try {
        await loadSquareScript(squareScriptUrlForApplicationId(appId))
        if (cancelled) return
        // Script may set `window.Square` on the next tick
        let Sq: SquareGlobal | undefined
        for (let i = 0; i < 10; i++) {
          Sq = (window as unknown as { Square?: SquareGlobal }).Square
          if (Sq) break
          await new Promise((r) => setTimeout(r, 30))
        }
        if (!Sq) {
          console.error('Square: window.Square missing after loadSquareScript()')
          setSquareError(t('booking.squareLoadError'))
          return
        }
        const mountNode = document.getElementById(cardContainerId)
        if (!mountNode) {
          console.error('Square: card mount node not in DOM', cardContainerId)
          setSquareError(t('booking.squareLoadError'))
          return
        }
        const payments = Sq.payments(appId, locationId)
        const c = await payments.card({
          style: {
            '.input-container': {
              borderColor: 'rgba(212, 175, 55, 0.35)',
              borderRadius: '8px',
            },
            '.input-container.is-focus': {
              borderColor: 'rgba(212, 175, 55, 0.85)',
            },
            input: {
              color: '#fff',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
            },
            'input::placeholder': {
              color: 'rgba(255, 255, 255, 0.45)',
            },
            '.message-text': { color: '#f87171' },
            '.message-icon': { color: '#f87171' },
          },
        })
        await c.attach(`#${cardContainerId}`)
        if (cancelled) {
          await c.destroy()
          return
        }
        cardRef.current = c
        setSquareError(null)
        setSquareReady(true)
      } catch (err) {
        console.error('Square Web Payments init failed', err)
        if (!cancelled) {
          const extra = reasonIfAny(err)
          setSquareError(
            extra
              ? t('booking.squareLoadErrorDetail', { detail: extra })
              : t('booking.squareLoadError'),
          )
          setSquareReady(false)
        }
      }
    })()

    return () => {
      cancelled = true
      void (async () => {
        const c = cardRef.current
        cardRef.current = null
        if (c) await c.destroy()
      })()
    }
  }, [appId, locationId, cardContainerId, missingSquareConfig, t])

  function formatSlotLabel(iso: string): string {
    const d = new Date(iso)
    return new Intl.DateTimeFormat(i18n.language, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d)
  }

  function serviceLabel(): string {
    return t(`booking.services.${service}` as 'booking.services.cut')
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (!terms) {
      setMessage({ type: 'err', text: t('booking.errors.terms') })
      return
    }
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setMessage({ type: 'err', text: t('booking.errors.fill') })
      return
    }
    if (slotsLoadFailed) {
      setMessage({ type: 'err', text: t('booking.slotsApiError') })
      return
    }
    if (slots.length > 0) {
      if (!slot) {
        setMessage({ type: 'err', text: t('booking.errors.fill') })
        return
      }
    } else {
      if (!flexPreferred.trim()) {
        setMessage({ type: 'err', text: t('booking.errors.preferredTime') })
        return
      }
    }
    if (missingSquareConfig || !cardRef.current || !squareReady) {
      setMessage({ type: 'err', text: t('booking.squareLoadError') })
      return
    }

    setSubmitting(true)
    try {
      const tokenResult = await cardRef.current.tokenize()
      if (tokenResult.status !== 'OK' || !tokenResult.token) {
        setMessage({ type: 'err', text: t('booking.errors.payment') })
        setSubmitting(false)
        return
      }

      const slotStart = slots.length > 0 ? slot : SLOT_TBD
      const noteParts: string[] = []
      if (slots.length === 0 && flexPreferred.trim()) {
        noteParts.push(t('booking.preferredTimeNote', { time: flexPreferred.trim() }))
      }
      if (note.trim()) noteParts.push(note.trim())
      const noteCombined = noteParts.length > 0 ? noteParts.join('\n\n') : undefined

      const idempotencyKey = crypto.randomUUID()
      const res = await fetch(apiUrl('/api/payments/deposit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          idempotencyKey,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          service: `${serviceLabel()} (${service})`,
          slotStart,
          termsAccepted: true,
          note: noteCombined,
        }),
      })

      const body = (await res.json()) as {
        ok?: boolean
        paymentId?: string
        customerId?: string | null
      }

      if (!res.ok || !body.ok || !body.paymentId) {
        setMessage({ type: 'err', text: t('booking.errors.payment') })
        setSubmitting(false)
        return
      }

      await cardRef.current?.destroy()
      cardRef.current = null

      setSubmitting(false)
      navigate('/book/success', {
        replace: true,
        state: {
          paymentId: body.paymentId,
          customerId: body.customerId ?? undefined,
        },
      })
    } catch {
      setMessage({ type: 'err', text: t('booking.errors.network') })
      setSubmitting(false)
    }
  }

  const displaySquareError = missingSquareConfig
    ? t('booking.squareConfigMissing')
    : squareError

  const timeSelected =
    !slotsLoadFailed && (slots.length > 0 ? !!slot : flexPreferred.trim().length > 0)

  const payDisabled =
    submitting ||
    missingSquareConfig ||
    !squareReady ||
    !!squareError ||
    slotsLoading ||
    slotsLoadFailed ||
    !timeSelected

  return (
    <MotionSection
      id="book"
      entrance="none"
      aria-label={t('booking.title')}
      className="scroll-mt-24 border-y border-gold-400/20 bg-black/40 px-4 py-14 sm:px-6"
    >
      <div className="mx-auto max-w-xl">
        <h2 className="text-center font-serif text-3xl font-medium text-gold-300 sm:text-4xl">
          {t('booking.title')}
        </h2>
        <p className="mt-3 text-center font-condensed text-sm uppercase tracking-wide text-white/75">
          {t('booking.subtitle')}
        </p>
        <p className="mt-2 text-center font-condensed text-lg font-bold text-gold-200">
          {t('booking.depositLabel')}
        </p>

        <form
          onSubmit={(e) => void handlePay(e)}
          className="mt-10 flex flex-col gap-5 rounded-xl border border-gold-400/25 bg-black/60 p-6 backdrop-blur-sm"
        >
          <label className="flex flex-col gap-1">
            <span className="font-condensed text-xs font-bold uppercase tracking-wider text-white/80">
              {t('booking.name')}
            </span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-white/15 bg-black/80 px-3 py-2.5 text-white outline-none ring-gold-400/40 focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-condensed text-xs font-bold uppercase tracking-wider text-white/80">
              {t('booking.email')}
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-white/15 bg-black/80 px-3 py-2.5 text-white outline-none ring-gold-400/40 focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-condensed text-xs font-bold uppercase tracking-wider text-white/80">
              {t('booking.phone')}
            </span>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg border border-white/15 bg-black/80 px-3 py-2.5 text-white outline-none ring-gold-400/40 focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-condensed text-xs font-bold uppercase tracking-wider text-white/80">
              {t('booking.service')}
            </span>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="rounded-lg border border-white/15 bg-black/80 px-3 py-2.5 text-white outline-none ring-gold-400/40 focus:ring-2"
            >
              {SERVICE_KEYS.map((k) => (
                <option key={k} value={k}>
                  {t(`booking.services.${k}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-condensed text-xs font-bold uppercase tracking-wider text-white/80">
              {t('booking.slot')}
            </span>
            {slotsLoading ? (
              <p className="text-sm text-white/55">{t('booking.loadingSlots')}</p>
            ) : slotsLoadFailed ? (
              <p className="text-sm text-red-200/90" role="alert">
                {t('booking.slotsApiError')}
              </p>
            ) : slots.length === 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-amber-200/80">{t('booking.noSlots')}</p>
                <input
                  required
                  value={flexPreferred}
                  onChange={(e) => setFlexPreferred(e.target.value)}
                  placeholder={t('booking.preferredTimePlaceholder')}
                  className="rounded-lg border border-white/15 bg-black/80 px-3 py-2.5 text-white outline-none ring-gold-400/40 placeholder:text-white/40 focus:ring-2"
                />
                <p className="text-xs text-white/55">{t('booking.preferredTimeHelp')}</p>
              </div>
            ) : (
              <select
                required
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="rounded-lg border border-white/15 bg-black/80 px-3 py-2.5 text-white outline-none ring-gold-400/40 focus:ring-2"
              >
                <option value="">{t('booking.slotPlaceholder')}</option>
                {slots.map((s) => (
                  <option key={s} value={s}>
                    {formatSlotLabel(s)}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-condensed text-xs font-bold uppercase tracking-wider text-white/80">
              {t('booking.note')}
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="resize-none rounded-lg border border-white/15 bg-black/80 px-3 py-2.5 text-white outline-none ring-gold-400/40 focus:ring-2"
            />
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-1 size-4 shrink-0 accent-amber-500"
            />
            <span className="text-sm leading-snug text-white/85">{t('booking.policy')}</span>
          </label>

          <div>
            <p className="font-condensed text-xs font-bold uppercase tracking-wider text-white/80">
              {t('booking.cardTitle')}
            </p>
            {displaySquareError && (
              <p className="mt-2 text-sm text-red-300" role="alert">
                {displaySquareError}
              </p>
            )}
            <div id={cardContainerId} className="mt-3 min-h-[110px]" />
          </div>

          {message?.type === 'err' && (
            <p className="text-center text-red-300" role="alert">
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={payDisabled}
            className="min-h-12 rounded-lg border border-gold-400/50 bg-gradient-to-b from-gold-500/30 to-gold-600/20 font-condensed text-sm font-bold uppercase tracking-widest text-gold-100 transition hover:from-gold-400/40 hover:to-gold-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? '…' : t('booking.pay')}
          </button>
        </form>
      </div>
    </MotionSection>
  )
}

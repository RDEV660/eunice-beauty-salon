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

function splitName(full: string): { givenName: string; familyName: string } {
  const t = full.trim()
  if (!t) return { givenName: 'Guest', familyName: 'Customer' }
  const parts = t.split(/\s+/)
  if (parts.length === 1) return { givenName: parts[0]!, familyName: 'Customer' }
  return { givenName: parts[0]!, familyName: parts.slice(1).join(' ') }
}

/** Square’s Web SDK often throws with `errorList` (not a plain Error message). */
function extractTokenizeError(err: unknown): string {
  if (err && typeof err === 'object') {
    const list = (err as { errorList?: { message?: string }[] }).errorList
    if (Array.isArray(list) && list.length > 0) {
      return list
        .map((e) => (typeof e?.message === 'string' ? e.message : ''))
        .filter(Boolean)
        .join(' ')
    }
  }
  if (err instanceof Error) {
    const m = err.message?.trim() ?? ''
    if (m && !/^\s*at\s/i.test(m)) return m
  }
  return ''
}

/**
 * Sandbox Application IDs (e.g. `sandbox-sq0idb-...`) must use the sandbox CDN,
 * even if VITE_SQUARE_ENVIRONMENT is mistakenly set to `production` on the host.
 */
/** True when the Web SDK points at Square Sandbox — real card numbers are rejected (HTTP 400 on card-nonce). */
function isPaymentSandboxMode(appId: string): boolean {
  if (!appId) return false
  return /sandbox/i.test(appId) || !isSquareProductionEnv()
}

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

type CardTokenizeOptions = {
  billingContact: {
    givenName: string
    familyName: string
    email: string
    phone: string
    countryCode: string
    postalCode: string
  }
}

type CardConfigureOptions = { postalCode?: string; style?: Record<string, unknown> }

type CardHandle = {
  attach: (selector: string) => Promise<void>
  /** Sync iframe defaults (e.g. billing ZIP) when the Web Payments Card supports it. */
  configure?: (options: CardConfigureOptions) => Promise<void>
  destroy: () => Promise<void>
  tokenize: (options?: CardTokenizeOptions) => Promise<{
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
  const showSandboxNotice = !missingSquareConfig && isPaymentSandboxMode(appId)

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
  const [billingPostal, setBillingPostal] = useState('')
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

  useEffect(() => {
    if (!squareReady) return
    const c = cardRef.current
    if (!c?.configure || !billingPostal.trim()) return
    const zip = billingPostal.trim()
    void c.configure({ postalCode: zip }).catch(() => {
      // Older SDKs or if iframe has no postal field — tokenize() still sends billingContact.
    })
  }, [squareReady, billingPostal])

  useLayoutEffect(() => {
    if (missingSquareConfig) return

    if (!terms) {
      setSquareReady(false)
      setSquareError(null)
      void (async () => {
        const c = cardRef.current
        cardRef.current = null
        if (c) await c.destroy()
      })()
      return
    }

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
  }, [appId, locationId, cardContainerId, missingSquareConfig, t, terms])

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
    if (!name.trim() || !email.trim() || !phone.trim() || !billingPostal.trim()) {
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
    const { givenName, familyName } = splitName(name)
    const tokenizeOptions: CardTokenizeOptions = {
      billingContact: {
        givenName,
        familyName,
        email: email.trim(),
        phone: phone.trim(),
        countryCode: 'US',
        postalCode: billingPostal.trim(),
      },
    }
    const card = cardRef.current
    if (!card) {
      setSubmitting(false)
      return
    }

    const sandboxNoBilling = isPaymentSandboxMode(appId)
    let tokenResult: {
      status: string
      token?: string
      errors?: { message: string }[]
    }
    const showTokenizeFailure = (detail: string) => {
      setMessage({
        type: 'err',
        text:
          detail && detail.length > 0 && detail.length < 320
            ? t('booking.errors.cardValidation', { detail })
            : t('booking.errors.tokenizeClient'),
      })
    }

    try {
      tokenResult = await card.tokenize(tokenizeOptions)
    } catch (err) {
      console.error('Square tokenize (with billing)', err)
      if (sandboxNoBilling) {
        try {
          tokenResult = await card.tokenize()
        } catch (err2) {
          console.error('Square tokenize (sandbox, no extra args)', err2)
          const a = extractTokenizeError(err) || t('booking.errors.tokenizeClient')
          const b = extractTokenizeError(err2)
          showTokenizeFailure([a, b].filter(Boolean).join(' — '))
          setSubmitting(false)
          return
        }
      } else {
        const detail = extractTokenizeError(err)
        showTokenizeFailure(detail || t('booking.errors.tokenizeClient'))
        setSubmitting(false)
        return
      }
    }

    if (tokenResult.status !== 'OK' || !tokenResult.token) {
      if (sandboxNoBilling) {
        try {
          const r2 = await card.tokenize()
          if (r2.status === 'OK' && r2.token) {
            tokenResult = r2
          }
        } catch (e3) {
          console.error('Square tokenize retry (sandbox)', e3)
        }
      }
    }

    if (tokenResult.status !== 'OK' || !tokenResult.token) {
      const detail = tokenResult.errors
        ?.map((e) => e.message)
        .filter(Boolean)
        .join(' ')
      showTokenizeFailure(detail || t('booking.errors.tokenizeClient'))
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
    let res: Response
    try {
      res = await fetch(apiUrl('/api/payments/deposit'), {
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
    } catch (err) {
      console.error('POST /api/payments/deposit', err)
      setMessage({ type: 'err', text: t('booking.errors.network') })
      setSubmitting(false)
      return
    }

    const raw = await res.text()
    type ErrBody = { error?: string; ok?: boolean; paymentId?: string; customerId?: string | null }
    let data: ErrBody
    try {
      data = raw ? (JSON.parse(raw) as ErrBody) : {}
    } catch (err) {
      console.error('Non-JSON payment response', res.status, raw.slice(0, 200), err)
      setMessage({
        type: 'err',
        text: t('booking.errors.unexpectedResponse', { status: String(res.status) }),
      })
      setSubmitting(false)
      return
    }

    if (!res.ok) {
      const code = data.error
      if (code) {
        setMessage({
          type: 'err',
          text: t('booking.errors.paymentWithCode', { code }),
        })
      } else {
        setMessage({ type: 'err', text: t('booking.errors.payment') })
      }
      setSubmitting(false)
      return
    }

    if (!data.ok || !data.paymentId) {
      setMessage({ type: 'err', text: t('booking.errors.payment') })
      setSubmitting(false)
      return
    }

    try {
      await cardRef.current?.destroy()
    } catch {
      /* ignore */
    }
    cardRef.current = null

    setSubmitting(false)
    const whenLabel =
      slots.length > 0
        ? formatSlotLabel(slot)
        : t('booking.flexibleWhenSuccess', { time: flexPreferred.trim() })
    navigate('/book/success', {
      replace: true,
      state: {
        paymentId: data.paymentId,
        customerId: data.customerId ?? undefined,
        guestName: name.trim(),
        guestEmail: email.trim(),
        guestPhone: phone.trim(),
        serviceLabel: serviceLabel(),
        whenLabel,
      },
    })
  }

  const displaySquareError = missingSquareConfig
    ? t('booking.squareConfigMissing')
    : squareError

  const timeSelected =
    !slotsLoadFailed && (slots.length > 0 ? !!slot : flexPreferred.trim().length > 0)

  const hasBilling = billingPostal.trim().length > 0

  const payDisabled =
    submitting ||
    missingSquareConfig ||
    !squareReady ||
    !!squareError ||
    slotsLoading ||
    slotsLoadFailed ||
    !timeSelected ||
    !hasBilling ||
    !terms

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
        {showSandboxNotice && (
          <p
            className="mt-4 rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-100/95"
            role="status"
          >
            {t('booking.sandboxModeNotice')}{' '}
            <a
              className="font-medium text-amber-200 underline decoration-amber-200/50 underline-offset-2 hover:text-amber-50"
              href="https://developer.squareup.com/docs/devtools/sandbox/payments"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('booking.sandboxTestCardsLink')}
            </a>
            .
          </p>
        )}

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

          <div className="flex flex-col gap-2">
            <span className="font-condensed text-xs font-bold uppercase tracking-wider text-gold-200/90">
              {t('booking.depositPolicyStep')}
            </span>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-400/25 bg-amber-500/5 p-3">
              <input
                type="checkbox"
                required
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-1 size-4 shrink-0 accent-amber-500"
                aria-describedby={!terms ? 'book-pay-terms-hint' : undefined}
              />
              <span className="text-sm leading-snug text-white/90">{t('booking.policy')}</span>
            </label>
            {!terms && (
              <p className="text-sm text-white/50" id="book-pay-terms-hint" role="note">
                {t('booking.unlockPayment')}
              </p>
            )}
          </div>

          {terms && (
            <>
              <label className="flex flex-col gap-1">
                <span className="font-condensed text-xs font-bold uppercase tracking-wider text-white/80">
                  {t('booking.billingPostal')}
                </span>
                <input
                  required
                  autoComplete="postal-code"
                  value={billingPostal}
                  onChange={(e) => setBillingPostal(e.target.value)}
                  className="rounded-lg border border-white/15 bg-black/80 px-3 py-2.5 text-white outline-none ring-gold-400/40 focus:ring-2"
                />
                <p className="text-xs text-white/50">{t('booking.billingPostalHelp')}</p>
              </label>

              <div>
                <p className="font-condensed text-xs font-bold uppercase tracking-wider text-white/80">
                  {t('booking.cardTitle')}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">{t('booking.cardFieldHint')}</p>
                {showSandboxNotice && (
                  <p className="mt-2 text-xs leading-relaxed text-amber-200/90">
                    {t('booking.cardSandboxLuhn')}
                  </p>
                )}
                {displaySquareError && (
                  <p className="mt-2 text-sm text-red-300" role="alert">
                    {displaySquareError}
                  </p>
                )}
                <div id={cardContainerId} className="mt-3 min-h-[128px]" />
              </div>
            </>
          )}

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

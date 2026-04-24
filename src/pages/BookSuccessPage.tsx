import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { SiteFooter } from '../sections/SiteFooter'

export type BookSuccessState = {
  paymentId?: string
  customerId?: string | null
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  serviceLabel?: string
  /** Formatted for display (local slot, or “preferred time” when no open slot) */
  whenLabel?: string
}

export function BookSuccessPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const state = location.state as BookSuccessState | null

  if (!state?.paymentId) {
    return <Navigate to="/book" replace />
  }

  return (
    <>
      <main className="min-h-[60vh] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <div
            className="mx-auto mb-8 flex size-16 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-3xl text-emerald-300"
            aria-hidden
          >
            ✓
          </div>
          <h1 className="font-serif text-3xl font-medium text-gold-200 sm:text-4xl">
            {t('confirmed.title')}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/85">{t('confirmed.body')}</p>

          {(state.guestName || state.serviceLabel || state.whenLabel) && (
            <div className="mt-8 w-full max-w-md rounded-lg border border-white/10 bg-white/5 px-5 py-4 text-left text-sm text-white/90">
              <p className="mb-3 font-condensed text-xs font-bold uppercase tracking-widest text-gold-200/90">
                {t('confirmed.summaryTitle')}
              </p>
              <dl className="space-y-2.5">
                {state.guestName && (
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                    <dt className="shrink-0 text-white/55">{t('confirmed.summaryName')}</dt>
                    <dd className="font-medium text-white/95">{state.guestName}</dd>
                  </div>
                )}
                {state.guestEmail && (
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                    <dt className="shrink-0 text-white/55">{t('confirmed.summaryEmail')}</dt>
                    <dd>
                      <a
                        className="font-medium break-all text-amber-200/95 underline decoration-amber-200/30 hover:text-amber-100"
                        href={`mailto:${state.guestEmail}`}
                      >
                        {state.guestEmail}
                      </a>
                    </dd>
                  </div>
                )}
                {state.guestPhone && (
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                    <dt className="shrink-0 text-white/55">{t('confirmed.summaryPhone')}</dt>
                    <dd>
                      <a
                        className="font-medium text-amber-200/95 underline decoration-amber-200/30 hover:text-amber-100"
                        href={`tel:${state.guestPhone.replace(/\s/g, '')}`}
                      >
                        {state.guestPhone}
                      </a>
                    </dd>
                  </div>
                )}
                {state.serviceLabel && (
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                    <dt className="shrink-0 text-white/55">{t('confirmed.summaryService')}</dt>
                    <dd className="font-medium text-white/95">{state.serviceLabel}</dd>
                  </div>
                )}
                {state.whenLabel && (
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                    <dt className="shrink-0 text-white/55">{t('confirmed.summaryWhen')}</dt>
                    <dd className="font-medium text-white/95">{state.whenLabel}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <p className="mt-6 font-mono text-xs text-white/45">
            {t('confirmed.ref')}: {state.paymentId}
          </p>
          {state.customerId ? (
            <p className="mt-2 text-xs text-emerald-400/80">{t('confirmed.squareProfile')}</p>
          ) : null}
          <Link
            to="/"
            className="mt-10 inline-flex min-h-12 items-center justify-center rounded-lg border border-gold-400/45 bg-gold-500/10 px-10 font-condensed text-sm font-bold uppercase tracking-widest text-gold-100 transition hover:bg-gold-500/20"
          >
            {t('confirmed.back')}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

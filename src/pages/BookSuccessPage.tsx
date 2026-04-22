import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { SiteFooter } from '../sections/SiteFooter'

export type BookSuccessState = {
  paymentId?: string
  customerId?: string | null
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
          <p className="mt-4 font-mono text-xs text-white/45">
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

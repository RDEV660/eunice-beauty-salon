import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BookingSection } from '../sections/BookingSection'
import { SiteFooter } from '../sections/SiteFooter'

export function BookPage() {
  const { t } = useTranslation()
  return (
    <>
      <main className="px-4 pb-6 pt-6 sm:px-6">
        <div className="mx-auto max-w-xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-condensed text-xs font-semibold uppercase tracking-wider text-gold-300/90 underline-offset-4 hover:text-gold-200 hover:underline"
          >
            ← {t('booking.backHome')}
          </Link>
        </div>
        <BookingSection />
      </main>
      <SiteFooter />
    </>
  )
}

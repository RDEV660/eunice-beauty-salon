import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { GalleryGrid } from '../components/GalleryGrid'
import { MotionSection } from '../components/MotionSection'
import { SiteFooter } from '../sections/SiteFooter'

export function GalleryPage() {
  const { t } = useTranslation()

  return (
    <>
      <main className="px-4 pb-12 pt-6 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-condensed text-xs font-semibold uppercase tracking-wider text-gold-300/90 underline-offset-4 hover:text-gold-200 hover:underline"
          >
            ← {t('booking.backHome')}
          </Link>

          <MotionSection className="mt-8 pb-4" aria-labelledby="gallery-page-heading">
            <h1 id="gallery-page-heading" className="text-center font-serif text-3xl font-medium text-gold-300 md:text-4xl">
              {t('gallery.title')}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-white/70">
              {t('gallery.pageSubtitle')}
            </p>
          </MotionSection>

          <div className="mt-6">
            <GalleryGrid />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

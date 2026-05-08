import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { MotionSection } from '../components/MotionSection'
import { GALLERY_ITEMS, GALLERY_TEASER_COUNT, gallerySrc } from '../lib/galleryImages'

const easeLux = [0.22, 1, 0.36, 1] as const

export function GalleryTeaserSection() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const teaser = GALLERY_ITEMS.slice(0, GALLERY_TEASER_COUNT)
  const total = GALLERY_ITEMS.length

  return (
    <MotionSection
      id="gallery"
      className="scroll-mt-20 border-y border-gold-400/12 bg-[linear-gradient(180deg,#070707_0%,#0a0a0a_50%,#060606_100%)] px-4 py-8 sm:px-6 sm:py-10"
      aria-labelledby="gallery-teaser-heading"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-6 md:flex-row md:items-center md:gap-10">
        <div className="flex min-w-0 flex-1 justify-center gap-2 sm:gap-2.5 md:justify-start">
          {teaser.map((item, i) => (
            <motion.div
              key={item.file}
              className="relative w-[calc((100%-1rem)/3)] max-w-[7.5rem] shrink-0 sm:max-w-[8.25rem]"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-24px' }}
              transition={{
                duration: 0.5,
                delay: reduce ? 0 : i * 0.06,
                ease: easeLux,
              }}
            >
              <div className="overflow-hidden rounded-sm bg-neutral-950 shadow-[0_12px_32px_rgba(0,0,0,0.45)] ring-1 ring-amber-400/25">
                <div className="relative aspect-[3/4] w-full">
                  <img
                    src={gallerySrc(item)}
                    alt=""
                    className="h-full w-full object-cover object-center"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable={false}
                    sizes="120px"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-1 flex-col items-center text-center md:max-w-sm md:items-start md:text-left">
          <h2
            id="gallery-teaser-heading"
            className="font-serif text-xl font-medium text-gold-300 sm:text-2xl"
          >
            {t('gallery.title')}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-white/68 sm:text-sm">
            {t('gallery.teaserSubtitle')}
          </p>
          <p className="mt-1 font-condensed text-[0.65rem] font-semibold uppercase tracking-wider text-gold-400/75 sm:text-xs">
            {t('gallery.photoCount', { count: total })}
          </p>
          <motion.div
            className="mt-5 w-full sm:w-auto"
            whileHover={reduce ? undefined : { scale: 1.02 }}
            whileTap={reduce ? undefined : { scale: 0.99 }}
          >
            <Link
              to="/gallery"
              className="inline-flex w-full min-h-[2.75rem] items-center justify-center gap-2 rounded-lg border border-gold-400/50 bg-amber-500/12 px-6 font-condensed text-xs font-bold uppercase tracking-[0.14em] text-gold-50 shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-colors hover:border-gold-300 hover:bg-amber-500/20 sm:w-auto sm:min-w-[12rem]"
            >
              {t('gallery.openFull')}
            </Link>
          </motion.div>
        </div>
      </div>
    </MotionSection>
  )
}

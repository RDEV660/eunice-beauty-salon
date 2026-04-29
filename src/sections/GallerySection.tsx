import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import { MotionSection } from '../components/MotionSection'
import { GALLERY_SLIDE_COUNT, galleryImageSrc } from '../lib/galleryImages'

const easeLux = [0.22, 1, 0.36, 1] as const

export function GallerySection() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  return (
    <MotionSection
      id="gallery"
      className="scroll-mt-20 border-y border-gold-400/12 bg-[#060606] px-4 py-12 sm:px-6 sm:py-16"
      aria-labelledby="gallery-heading"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center">
        <h2
          id="gallery-heading"
          className="text-center font-serif text-2xl font-medium text-gold-300 sm:text-3xl md:text-4xl"
        >
          {t('gallery.title')}
        </h2>
        <p className="mt-3 max-w-xl text-center text-xs leading-relaxed text-white/70 sm:text-sm">
          {t('gallery.subtitle')}
        </p>

        <ul
          role="list"
          className="mt-8 grid w-full grid-cols-2 gap-2.5 sm:mt-10 sm:grid-cols-3 sm:gap-3 md:gap-4 lg:grid-cols-4"
        >
          {Array.from({ length: GALLERY_SLIDE_COUNT }, (_, i) => (
            <motion.li
              key={i}
              className="group relative overflow-hidden rounded-sm bg-neutral-950 shadow-[0_8px_24px_rgba(0,0,0,0.4)] ring-1 ring-amber-400/20"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.55,
                delay: reduce ? 0 : i * 0.04,
                ease: easeLux,
              }}
            >
              <div className="relative aspect-[3/4] w-full">
                <img
                  src={galleryImageSrc(i)}
                  alt={t(`gallery.slides.s${i + 1}`)}
                  className="h-full w-full object-cover object-center transition duration-500 ease-out group-hover:scale-[1.04]"
                  loading={i < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                  sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-amber-400/15 transition group-hover:ring-amber-400/55"
                />
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </MotionSection>
  )
}

import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MAP_EMBED_QUERY, MAPS_SEARCH_URL } from '../constants'
import { MotionSection } from '../components/MotionSection'

const easeLux = [0.22, 1, 0.36, 1] as const

export function MapSection() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const embedSrc = `https://maps.google.com/maps?q=${MAP_EMBED_QUERY}&output=embed`

  return (
    <MotionSection
      id="location"
      className="scroll-mt-20 bg-[#080808] px-4 py-16 sm:px-6"
      aria-label={t('map.title')}
    >
      <div className="mx-auto max-w-5xl">
        <motion.h2
          className="text-center font-serif text-3xl font-medium text-gold-300 sm:text-4xl"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: easeLux }}
        >
          {t('map.title')}
        </motion.h2>
        <motion.div
          className="mt-10 overflow-hidden rounded-2xl border border-gold-400/40 shadow-[0_24px_64px_rgba(0,0,0,0.55),0_0_40px_rgba(240,200,60,0.06)]"
          initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.72, ease: easeLux, delay: reduce ? 0 : 0.08 }}
        >
          <iframe
            title={t('map.title')}
            src={embedSrc}
            className="aspect-[16/10] h-[min(55vh,420px)] w-full border-0 sm:h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
        <motion.div
          className="mt-6 text-center"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: reduce ? 0 : 0.15, ease: easeLux }}
        >
          <motion.a
            href={MAPS_SEARCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gold-400/55 bg-gold-500/15 px-6 font-condensed text-sm font-bold uppercase tracking-wider text-gold-200 shadow-[0_0_28px_rgba(240,200,60,0.12)] transition-colors hover:border-gold-400 hover:bg-gold-500/25"
            whileHover={reduce ? undefined : { scale: 1.04, y: -2 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
          >
            {t('map.openMaps')}
          </motion.a>
        </motion.div>
      </div>
    </MotionSection>
  )
}

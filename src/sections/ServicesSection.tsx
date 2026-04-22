import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MotionSection } from '../components/MotionSection'

const KEYS = ['cut', 'color', 'treatments', 'special'] as const

const easeLux = [0.22, 1, 0.36, 1] as const

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: easeLux },
  },
}

const itemInstant = {
  hidden: { opacity: 1, y: 0, scale: 1 },
  visible: { opacity: 1, y: 0, scale: 1 },
}

const containerInstant = {
  hidden: {},
  visible: { transition: { staggerChildren: 0, delayChildren: 0 } },
}

export function ServicesSection() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const vItem = reduce ? itemInstant : item
  const vContainer = reduce ? containerInstant : container

  const inner = (
    <>
      <motion.h2
        variants={vItem}
        className="text-center font-serif text-3xl font-medium text-gold-300 sm:text-4xl"
      >
        {t('services.title')}
      </motion.h2>
      <motion.p
        variants={vItem}
        className="mx-auto mt-3 max-w-2xl text-center font-condensed text-sm uppercase tracking-wide text-white/75"
      >
        {t('services.subtitle')}
      </motion.p>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {KEYS.map((key, i) => (
          <motion.div
            key={key}
            variants={vItem}
            className="card-lift group relative overflow-hidden rounded-2xl border border-gold-400/35 bg-gradient-to-br from-black/85 via-black/65 to-gold-500/15 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors hover:border-gold-400/65"
          >
              <div
                className="absolute -right-8 -top-8 size-32 rounded-full bg-gold-400/15 blur-2xl transition duration-500 group-hover:bg-gold-400/25"
                aria-hidden
              />
              <p className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-gold-400">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-2 font-serif text-xl text-white sm:text-2xl">
                {t(`services.items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                {t(`services.items.${key}.body`)}
              </p>
            </motion.div>
        ))}
      </div>
    </>
  )

  return (
    <MotionSection
      id="services"
      className="scroll-mt-20 bg-[#080808] px-4 py-16 sm:px-6"
      aria-label={t('services.title')}
    >
      <motion.div
        className="mx-auto max-w-5xl"
        variants={vContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {inner}
      </motion.div>
    </MotionSection>
  )
}

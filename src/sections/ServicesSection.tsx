import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MotionSection } from '../components/MotionSection'

const easeLux = [0.22, 1, 0.36, 1] as const

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeLux },
  },
}

const itemInstant = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
}

export function ServicesSection() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const vItem = reduce ? itemInstant : item

  return (
    <MotionSection
      id="services"
      className="scroll-mt-20 bg-[#080808] px-4 py-16 sm:px-6"
      aria-label={t('services.title')}
    >
      <motion.div
        className="mx-auto max-w-4xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
        }}
      >
        <motion.h2
          variants={vItem}
          className="text-center font-serif text-2xl font-medium text-gold-300 sm:text-3xl md:text-4xl"
        >
          {t('services.title')}
        </motion.h2>
        <motion.p
          variants={vItem}
          className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-white/80 sm:text-base"
        >
          {t('services.subtitle')}
        </motion.p>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 sm:gap-8">
          <motion.div
            variants={vItem}
            className="rounded-2xl border border-gold-400/30 bg-gradient-to-br from-black/90 via-zinc-950/80 to-gold-500/10 p-6 shadow-lg sm:p-7"
          >
            <h3 className="font-serif text-lg text-gold-200 sm:text-xl">{t('services.hairTitle')}</h3>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/85 sm:text-[0.95rem]">
              {t('services.hairBody')}
            </p>
          </motion.div>
          <motion.div
            variants={vItem}
            className="rounded-2xl border border-gold-400/30 bg-gradient-to-br from-black/90 via-zinc-950/80 to-gold-500/10 p-6 shadow-lg sm:p-7"
          >
            <h3 className="font-serif text-lg text-gold-200 sm:text-xl">{t('services.beautyTitle')}</h3>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/85 sm:text-[0.95rem]">
              {t('services.beautyBody')}
            </p>
          </motion.div>
        </div>

        <motion.p
          variants={vItem}
          className="mt-10 text-center text-sm leading-relaxed text-white/88 sm:text-base"
        >
          {t('services.closing')}
        </motion.p>
        <motion.p
          variants={vItem}
          className="mt-4 text-center text-sm font-medium text-gold-200/95 sm:text-base"
        >
          {t('services.hoursLine')}
        </motion.p>
        <motion.p
          variants={vItem}
          className="mt-8 text-center font-serif text-base italic text-gold-300/95 sm:text-lg"
        >
          {t('services.tagline')}
        </motion.p>
      </motion.div>
    </MotionSection>
  )
}

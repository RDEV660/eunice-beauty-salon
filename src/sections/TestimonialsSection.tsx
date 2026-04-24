import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MotionSection } from '../components/MotionSection'

const IDS = [1, 2, 3, 4, 5] as const

const easeLux = [0.22, 1, 0.36, 1] as const

export function TestimonialsSection() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  return (
    <MotionSection
      id="reviews"
      className="scroll-mt-20 border-t border-gold-400/15 bg-[#050505] px-4 py-16 sm:px-6"
      aria-label={t('testimonials.ariaLabel')}
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-serif text-2xl font-medium text-gold-300 sm:text-3xl">
          {t('testimonials.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-gold-200/80 sm:text-base">{t('testimonials.subtitle')}</p>

        <ul className="mt-12 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2">
          {IDS.map((n, i) => (
            <motion.li
              key={n}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.05, ease: easeLux }}
              className="flex flex-col rounded-2xl border border-gold-400/25 bg-zinc-950/50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6"
            >
              <p className="text-sm leading-relaxed text-white/90 sm:text-[0.95rem]">
                “{t(`testimonials.reviews.r${n}.text`)}”
              </p>
              <p className="mt-3 font-condensed text-xs font-semibold uppercase tracking-wider text-gold-300/90">
                — {t(`testimonials.reviews.r${n}.name`)}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </MotionSection>
  )
}

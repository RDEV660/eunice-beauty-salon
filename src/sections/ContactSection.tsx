import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  EMAIL,
  IG_HANDLE,
  IG_URL,
  MAPS_SEARCH_URL,
  TEL_DISPLAY,
  TEL_HREF,
} from '../constants'
import { MotionSection } from '../components/MotionSection'

const easeLux = [0.22, 1, 0.36, 1] as const

export function ContactSection() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  const linkMotion = {
    initial: reduce ? false : ({ opacity: 0, x: -16 } as const),
    whileInView: reduce ? undefined : { opacity: 1, x: 0 },
    viewport: { once: true } as const,
    transition: { duration: 0.5, ease: easeLux },
  }

  return (
    <MotionSection
      id="contact"
      className="scroll-mt-20 bg-[#080808] px-4 pb-8 pt-4 sm:px-6"
      aria-label={t('contact.title')}
    >
      <motion.div
        className="mx-auto max-w-xl rounded-2xl border border-gold-400/40 bg-black/60 p-8 shadow-[0_24px_64px_rgba(0,0,0,0.45),0_0_40px_rgba(240,200,60,0.05)] backdrop-blur-md"
        initial={reduce ? false : { opacity: 0, y: 32, scale: 0.98 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.75, ease: easeLux }}
      >
        <h2 className="text-center font-serif text-3xl font-medium text-gold-300">
          {t('contact.title')}
        </h2>
        <div className="mt-8 flex flex-col gap-4 font-condensed text-sm font-semibold uppercase tracking-wide sm:text-base">
          <motion.a
            className="flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white transition-colors hover:border-gold-400/60 hover:bg-gold-500/10"
            href={TEL_HREF}
            {...linkMotion}
            transition={{ ...linkMotion.transition, delay: reduce ? 0 : 0.08 }}
            whileHover={reduce ? undefined : { scale: 1.02, x: 4 }}
            whileTap={reduce ? undefined : { scale: 0.99 }}
          >
            {t('contact.call')} {TEL_DISPLAY}
          </motion.a>
          <motion.a
            className="flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white transition-colors hover:border-gold-400/60 hover:bg-gold-500/10"
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            {...linkMotion}
            transition={{ ...linkMotion.transition, delay: reduce ? 0 : 0.15 }}
            whileHover={reduce ? undefined : { scale: 1.02, x: 4 }}
            whileTap={reduce ? undefined : { scale: 0.99 }}
          >
            {t('contact.instagram')} @{IG_HANDLE}
          </motion.a>
          <motion.a
            className="flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-normal normal-case tracking-normal text-white transition-colors hover:border-gold-400/60 hover:bg-gold-500/10"
            href={`mailto:${EMAIL}`}
            {...linkMotion}
            transition={{ ...linkMotion.transition, delay: reduce ? 0 : 0.22 }}
            whileHover={reduce ? undefined : { scale: 1.02, x: 4 }}
            whileTap={reduce ? undefined : { scale: 0.99 }}
          >
            {t('contact.email')}: {EMAIL}
          </motion.a>
        </div>
        <div className="mt-10 border-t border-gold-400/25 pt-8">
          <h3 className="font-serif text-lg text-gold-200">{t('contact.hoursTitle')}</h3>
          <p className="mt-2 whitespace-pre-line font-condensed text-sm leading-relaxed tracking-wide text-white/80">
            {t('contact.hoursBody')}
          </p>
          <a
            href={MAPS_SEARCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm text-gold-300 underline decoration-gold-400/50 underline-offset-4 transition-colors hover:text-gold-200"
          >
            {t('address')}
          </a>
        </div>
      </motion.div>
    </MotionSection>
  )
}

import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { MotionSection } from '../components/MotionSection'
import { WHATSAPP_HREF } from '../constants'
import heroLogoVideo from '../assets/hero-logo.mp4'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

const easeLux = [0.22, 1, 0.36, 1] as const

export function HeroSection() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const heroVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = heroVideoRef.current
    if (!el) return
    el.muted = true
    if (reduce) {
      el.pause()
      return
    }
    void el.play().catch(() => {
      /* Autoplay can be blocked until gesture; <video autoPlay> still helps. */
    })
  }, [reduce])

  const btnBase =
    'inline-flex min-h-[3.25rem] w-full shrink-0 items-center justify-center gap-2.5 rounded-lg px-8 font-condensed text-sm font-bold uppercase tracking-[0.16em] sm:w-auto sm:min-w-[12.5rem]'

  const lineMotion = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0 : 0.55, delay: reduce ? 0 : delay, ease: easeLux },
  })

  return (
    <MotionSection id="home" className="scroll-mt-20 pb-0">
      <motion.div
        className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden border-b border-gold-400/40 shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.65, ease: easeLux }}
      >
        {/* Background video — full bleed, cropped, not a giant “strip” */}
        <video
          ref={heroVideoRef}
          src={heroLogoVideo}
          className="absolute inset-0 z-0 h-full w-full min-h-full min-w-full object-cover object-center will-change-transform [transform:translateZ(0)] [backface-visibility:hidden]"
          style={{ objectPosition: 'center center' }}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden
        />

        {/* Slightly dark scrim + readable text; not as heavy as first dark pass */}
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/25 to-black/50"
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/8 to-black/30"
          aria-hidden
        />

        {/* One stack: brand + taglines + actions — all on top of the same hero */}
        <div className="relative z-10 mx-auto flex min-h-[min(72vh,720px)] max-h-[min(88vh,900px)] w-full max-w-4xl flex-col items-center justify-center px-4 py-14 text-center sm:px-8 sm:py-20">
          <h1 className="m-0 font-serif text-xs font-semibold tracking-[0.32em] text-gold-300/95 sm:text-sm">
            EUNICE
            <span className="block pt-0.5 text-[0.65rem] font-normal tracking-[0.22em] text-gold-200/75 sm:pt-1 sm:text-xs">
              Beauty Salon
            </span>
          </h1>

          <div className="mt-8 max-w-2xl space-y-4 sm:mt-10 sm:space-y-5">
            <motion.p
              className="font-serif text-lg leading-snug text-white sm:text-2xl sm:leading-snug"
              style={{
                textShadow:
                  '0 1px 2px rgba(0,0,0,0.85), 0 2px 12px rgba(0,0,0,0.5), 0 4px 24px rgba(0,0,0,0.4)',
              }}
              {...lineMotion(0.08)}
            >
              {t('hero.line1')}
            </motion.p>
            <motion.p
              className="font-serif text-base leading-relaxed text-white sm:text-xl"
              style={{
                textShadow:
                  '0 1px 2px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.45)',
              }}
              {...lineMotion(0.2)}
            >
              {t('hero.line2')}
            </motion.p>
            <motion.p
              className="font-serif text-sm italic leading-relaxed text-gold-100 sm:text-lg"
              style={{
                textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 2px 14px rgba(0,0,0,0.5)',
              }}
              {...lineMotion(0.32)}
            >
              {t('hero.line3')}
            </motion.p>
          </div>

          <motion.div
            className="mt-10 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:mt-12 sm:max-w-none sm:flex-row sm:gap-4"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: reduce ? 0 : 0.45, ease: easeLux }}
          >
            <motion.div
              className="w-full sm:w-auto"
              whileHover={reduce ? undefined : { scale: 1.02, y: -1 }}
              whileTap={reduce ? undefined : { scale: 0.99 }}
            >
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btnBase} border border-gold-400/45 bg-black/45 text-gold-50 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-colors hover:border-gold-400/70 hover:bg-black/55`}
              >
                <WhatsAppIcon className="h-5 w-5 shrink-0 text-[#3fe06d]" />
                {t('hero.whatsapp')}
              </a>
            </motion.div>
            <motion.div
              className="w-full sm:w-auto"
              whileHover={reduce ? undefined : { scale: 1.02, y: -1 }}
              whileTap={reduce ? undefined : { scale: 0.99 }}
            >
              <Link
                to="/book"
                className={`${btnBase} border border-gold-400/55 bg-amber-500/15 text-gold-50 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-colors hover:border-gold-300 hover:bg-amber-500/25`}
              >
                {t('cta.button')}
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-10 flex max-w-2xl flex-col items-stretch gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : 0.58, duration: 0.45 }}
          >
            <span className="inline-flex items-center justify-center rounded-full border border-gold-400/40 bg-black/35 px-5 py-2.5 text-center font-condensed text-[0.6rem] font-semibold uppercase leading-relaxed tracking-wider text-gold-100 sm:px-6 sm:text-xs">
              {t('hero.badgeOpen')}
            </span>
            <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.12] px-5 py-2.5 font-condensed text-[0.65rem] font-semibold uppercase tracking-wider text-white sm:px-6 sm:text-xs">
              {t('hero.badgeReviews')}
            </span>
          </motion.div>
        </div>
      </motion.div>
    </MotionSection>
  )
}

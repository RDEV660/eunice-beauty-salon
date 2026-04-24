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
    initial: reduce ? false : { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0 : 0.6, delay: reduce ? 0 : delay, ease: easeLux },
  })

  return (
    <MotionSection id="home" className="scroll-mt-20 pb-0">
      <motion.div
        className="relative left-1/2 z-[2] w-screen max-w-[100vw] -translate-x-1/2 border-b border-gold-400/40 bg-black shadow-[0_0_60px_rgba(240,200,60,0.08)]"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: easeLux }}
      >
        <div className="flex justify-center px-4 py-10 sm:px-8 sm:py-14">
          <motion.h1
            className="m-0 w-full max-w-5xl"
            initial={reduce ? false : { opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.85, ease: easeLux, delay: reduce ? 0 : 0.06 }}
          >
            <video
              ref={heroVideoRef}
              src={heroLogoVideo}
              width={1120}
              height={200}
              className="block h-auto w-full object-contain drop-shadow-[0_0_40px_rgba(240,200,60,0.15)]"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-label="Eunice Beauty Salon"
            />
          </motion.h1>
        </div>
      </motion.div>

      <motion.div
        className="relative left-1/2 z-[1] w-screen max-w-[100vw] -translate-x-1/2 border-b border-gold-400/35 bg-[#080808]"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: easeLux, delay: reduce ? 0 : 0.12 }}
      >
        <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-8 sm:py-16">
          <motion.div
            className="rounded-2xl border border-gold-400/45 bg-black/92 px-7 py-10 shadow-[0_8px_40px_rgba(0,0,0,0.55),0_0_48px_rgba(240,200,60,0.06)] backdrop-blur-md sm:px-11 sm:py-14"
            initial={reduce ? false : { opacity: 0, y: 20, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: easeLux, delay: reduce ? 0 : 0.2 }}
          >
            <div className="space-y-5 text-center">
              <motion.p
                className="font-serif text-xl leading-snug text-white sm:text-2xl sm:leading-snug"
                style={{ textShadow: '0 2px 28px rgba(0,0,0,0.95)' }}
                {...lineMotion(0.28)}
              >
                {t('hero.line1')}
              </motion.p>
              <motion.p
                className="font-serif text-lg leading-relaxed text-white sm:text-xl"
                style={{ textShadow: '0 2px 24px rgba(0,0,0,0.9)' }}
                {...lineMotion(0.4)}
              >
                {t('hero.line2')}
              </motion.p>
              <motion.p
                className="font-serif text-base italic leading-relaxed text-gold-300 sm:text-lg"
                {...lineMotion(0.52)}
              >
                {t('hero.line3')}
              </motion.p>
            </div>

            <motion.div
              className="mt-12 flex w-full flex-col items-stretch justify-center gap-4 sm:flex-row sm:justify-center"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: reduce ? 0 : 0.62, ease: easeLux }}
            >
              <motion.div
                className="w-full sm:w-auto"
                whileHover={reduce ? undefined : { scale: 1.03, y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              >
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btnBase} border border-gold-400/60 bg-black/50 text-gold-100 shadow-[0_0_32px_rgba(240,200,60,0.12)] transition-colors hover:border-gold-400 hover:bg-gold-500/15`}
                >
                  <WhatsAppIcon className="h-5 w-5 shrink-0 text-[#3fe06d]" />
                  {t('hero.whatsapp')}
                </a>
              </motion.div>
              <motion.div
                className="w-full sm:w-auto"
                whileHover={reduce ? undefined : { scale: 1.03, y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              >
                <Link
                  to="/book"
                  className={`${btnBase} border border-gold-400/65 bg-gold-500/25 text-gold-100 shadow-[0_0_36px_rgba(240,200,60,0.2)] transition-colors hover:border-gold-300 hover:bg-gold-500/35`}
                >
                  {t('cta.button')}
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-4 sm:gap-y-4"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduce ? 0 : 0.78, duration: 0.5 }}
            >
              <motion.span
                className="inline-flex max-w-xl rounded-full border border-gold-400/50 bg-black/60 px-6 py-3 text-center font-condensed text-[0.65rem] font-semibold uppercase leading-relaxed tracking-wider text-gold-200 shadow-[0_0_24px_rgba(240,200,60,0.08)] sm:text-xs"
                whileHover={reduce ? undefined : { scale: 1.02 }}
              >
                {t('hero.badgeOpen')}
              </motion.span>
              <motion.span
                className="inline-flex rounded-full border border-gold-400/25 bg-white/[0.08] px-6 py-3 font-condensed text-xs font-semibold uppercase tracking-wider text-white/90"
                whileHover={reduce ? undefined : { scale: 1.02 }}
              >
                {t('hero.badgeReviews')}
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </MotionSection>
  )
}

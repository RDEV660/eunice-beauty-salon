import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { MotionSection } from '../components/MotionSection'
import { TIKTOK_URL, WHATSAPP_HREF } from '../constants'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.7 2.9 2.9 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.14-5.1v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.13z" />
    </svg>
  )
}

const easeLux = [0.22, 1, 0.36, 1] as const

export function HeroSection() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  const btnBase =
    'inline-flex min-h-[3.25rem] w-full shrink-0 items-center justify-center gap-2 rounded-lg px-4 font-condensed text-xs font-bold uppercase tracking-[0.12em] sm:w-auto sm:min-w-[9.25rem] sm:gap-2.5 sm:px-5 sm:text-sm sm:tracking-[0.14em] md:min-w-[10.25rem]'

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
        {/* Static hero (no background video) — deep gradient with subtle gold sheen */}
        <div
          className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_20%,rgba(180,150,60,0.12),transparent_55%),radial-gradient(ellipse_70%_50%_at_50%_100%,rgba(0,0,0,0.5),#050505)]"
          aria-hidden
        />
        {/* Large watermark — sits behind the veils; taglines + actions read in front */}
        <div
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center px-2 py-10 sm:px-5 sm:py-16"
          aria-hidden
        >
          <img
            src="/hero-logo.png"
            alt=""
            width={960}
            height={280}
            loading="eager"
            decoding="async"
            className="h-auto w-full max-w-[min(100%,min(92vw,58rem))] scale-[1.05] object-contain object-center opacity-[0.11] [filter:drop-shadow(0_4px_40px_rgba(0,0,0,0.5))] sm:max-w-[min(100%,64rem)] sm:opacity-[0.15] md:scale-110"
          />
        </div>
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-black/20 to-black/50"
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-transparent to-black/40"
          aria-hidden
        />

        {/* Taglines + actions — h1 is screen-reader only (visible brand is the watermark) */}
        <div className="relative z-10 mx-auto flex min-h-[min(72vh,720px)] max-h-[min(88vh,900px)] w-full max-w-3xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-20">
          <h1 className="sr-only">{t('hero.brand')}</h1>
          <div className="max-w-2xl space-y-3 sm:space-y-3.5">
            <motion.p
              className="font-condensed text-sm leading-snug text-white/95 sm:text-base"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
              {...lineMotion(0.06)}
            >
              {t('hero.line1')}
            </motion.p>
            <motion.p
              className="font-condensed text-sm leading-relaxed text-white/90 sm:text-base"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.85)' }}
              {...lineMotion(0.12)}
            >
              {t('hero.line2')}
            </motion.p>
            <motion.p
              className="font-serif text-base font-medium leading-relaxed text-gold-100 sm:text-lg"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}
              {...lineMotion(0.2)}
            >
              {t('hero.line3')}
            </motion.p>
            <motion.p
              className="text-sm leading-relaxed text-white/90 sm:text-[0.95rem]"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
              {...lineMotion(0.28)}
            >
              {t('hero.line4')}
            </motion.p>
          </div>

          <motion.div
            className="mt-8 flex w-full max-w-2xl flex-col flex-wrap items-stretch justify-center gap-2.5 sm:mt-10 sm:flex-row sm:gap-3"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: reduce ? 0 : 0.38, ease: easeLux }}
          >
            <motion.div
              className="w-full min-w-0 sm:flex-1"
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
              className="w-full min-w-0 sm:flex-1"
              whileHover={reduce ? undefined : { scale: 1.02, y: -1 }}
              whileTap={reduce ? undefined : { scale: 0.99 }}
            >
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btnBase} border border-cyan-300/30 bg-black/50 text-cyan-50 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-colors hover:border-cyan-200/50 hover:bg-black/60`}
              >
                <TikTokIcon className="h-5 w-5 shrink-0 text-cyan-200" />
                {t('hero.tiktok')}
              </a>
            </motion.div>
            <motion.div
              className="w-full min-w-0 sm:flex-1"
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
            className="mt-8 flex max-w-2xl flex-col items-stretch gap-2.5 sm:mt-10 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : 0.5, duration: 0.45 }}
          >
            <span className="inline-flex items-center justify-center rounded-full border border-gold-400/40 bg-black/35 px-4 py-2.5 text-center font-condensed text-[0.6rem] font-semibold uppercase leading-relaxed tracking-wider text-gold-100 sm:px-5 sm:text-xs">
              {t('hero.badgeOpen')}
            </span>
            <span className="inline-flex items-center justify-center rounded-full border border-gold-400/30 bg-black/30 px-4 py-2.5 text-center font-condensed text-[0.6rem] font-semibold leading-snug text-white/95 sm:px-5 sm:text-xs">
              {t('hero.badgeWalkins')}
            </span>
            <a
              href="#reviews"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.12] px-4 py-2.5 font-condensed text-[0.65rem] font-semibold tracking-wider text-white transition-colors hover:border-gold-400/40 hover:text-gold-100 sm:px-5 sm:text-xs"
            >
              {t('hero.badgeReviews')}
            </a>
          </motion.div>
        </div>
      </motion.div>
    </MotionSection>
  )
}

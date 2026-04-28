import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MotionSection } from '../components/MotionSection'
import { GALLERY_SLIDE_COUNT, galleryImageSrc } from '../lib/galleryImages'

const easeLux = [0.22, 1, 0.36, 1] as const
const AUTO_MS = 6000

/** Framer-motion slide — used only when reduced motion is off */
const slideVariants = {
  enter: (d: number) => {
    const dir = d === 0 ? 1 : d
    return { x: dir > 0 ? 56 : -56, opacity: 0, scale: 0.985 }
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.42, ease: easeLux },
  },
  exit: (d: number) => {
    const dir = d === 0 ? 1 : d
    return {
      zIndex: 0,
      x: dir > 0 ? -56 : 56,
      opacity: 0,
      scale: 0.985,
      transition: { duration: 0.34, ease: easeLux },
    }
  },
} as const

const slideIds = Array.from({ length: GALLERY_SLIDE_COUNT }, (_, i) => i)

function Chevron({ dir, className }: { dir: 'left' | 'right'; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === 'left' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  )
}

export function GallerySection() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [paused, setPaused] = useState(false)
  const thumbStripRef = useRef<HTMLElement | null>(null)

  const goToSlide = useCallback((target: number) => {
    const len = GALLERY_SLIDE_COUNT
    if (target === index) return
    const forward = (target - index + len) % len
    const backward = (index - target + len) % len
    setDirection(forward <= backward ? 1 : -1)
    setIndex(target)
  }, [index])

  const goNext = useCallback(() => {
    setDirection(1)
    setIndex((i) => (i + 1) % GALLERY_SLIDE_COUNT)
  }, [])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setIndex((i) => (i - 1 + GALLERY_SLIDE_COUNT) % GALLERY_SLIDE_COUNT)
  }, [])

  useEffect(() => {
    if (reduce || paused) return
    const id = window.setInterval(goNext, AUTO_MS)
    return () => window.clearInterval(id)
  }, [paused, reduce, goNext])

  useEffect(() => {
    const el = thumbStripRef.current
    const btn = el?.querySelector(`[data-gallery-thumb="${index}"]`) as HTMLElement | null
    btn?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' })
  }, [index, reduce])

  const onKeyNav = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    },
    [goNext, goPrev],
  )

  const src = galleryImageSrc(index)

  return (
    <MotionSection
      id="gallery"
      className="scroll-mt-20 border-y border-gold-400/15 bg-gradient-to-b from-[#060606] via-[#080808] to-[#050505] px-4 py-10 sm:py-12 sm:px-6"
      aria-labelledby="gallery-heading"
    >
      <div className="mx-auto max-w-4xl">
        <h2
          id="gallery-heading"
          className="text-center font-serif text-xl font-medium text-gold-300 sm:text-2xl md:text-3xl"
        >
          {t('gallery.title')}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-xs leading-relaxed text-white/72 sm:text-sm">
          {t('gallery.subtitle')}
        </p>

        <div
          className="mt-6 flex flex-col gap-4 sm:mt-8 lg:mt-9 lg:flex-row lg:items-start lg:justify-center lg:gap-5"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false)
          }}
        >
          {/* Main framed photo */}
          <div
            className="relative min-w-0 flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
            tabIndex={0}
            onKeyDown={onKeyNav}
            role="group"
            aria-labelledby="gallery-heading"
          >
            <div
              className={[
                'relative mx-auto w-full max-w-[min(15.5rem,calc(100vw-2.5rem))] sm:max-w-[min(17.5rem,calc(100vw-3rem))] lg:mx-0 lg:w-[min(17.75rem,calc((100vw-8rem)*0.45))]',
                'rounded-sm p-1.5 sm:p-[7px]',
                'bg-[linear-gradient(152deg,#1f1a13_0%,#887456_42%,#2a251c_62%,#1a1712_100%)]',
                'shadow-[inset_0_1px_0_rgba(255,230,200,0.16),inset_0_-2px_8px_rgba(0,0,0,0.45)]',
                'ring-1 ring-amber-500/35',
              ].join(' ')}
            >
              {/* inner mat */}
              <div className="relative overflow-hidden rounded-sm bg-neutral-950 p-0.5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.65)] ring-1 ring-black/55">
                <div className="relative mx-auto aspect-[3/4] w-full bg-gradient-to-br from-neutral-950 to-black">
                  {!reduce ? (
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                      <motion.div
                        key={src}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0"
                      >
                        <img
                          src={src}
                          alt={t(`gallery.slides.s${index + 1}`)}
                          className="h-full w-full object-contain object-center"
                          sizes="(min-width: 1024px) 280px, min(90vw, 280px)"
                          loading={index === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                          draggable={false}
                        />
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <img
                      src={src}
                      alt={t(`gallery.slides.s${index + 1}`)}
                      className="h-full w-full object-contain object-center"
                      sizes="(min-width: 1024px) 280px, min(90vw, 280px)"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      draggable={false}
                    />
                  )}
                </div>
              </div>

              {/* Arrows */}
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/18 bg-black/55 text-white/92 shadow-md backdrop-blur-sm transition-colors hover:bg-black/72 hover:border-gold-400/45 sm:left-2.5"
                aria-label={t('gallery.prevAria')}
              >
                <Chevron dir="left" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/18 bg-black/55 text-white/92 shadow-md backdrop-blur-sm transition-colors hover:bg-black/72 hover:border-gold-400/45 sm:right-2.5"
                aria-label={t('gallery.nextAria')}
              >
                <Chevron dir="right" className="h-4 w-4" />
              </button>

              <p className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/12 bg-black/55 px-2.5 py-0.5 font-condensed text-[0.58rem] font-semibold tabular-nums tracking-wider text-white/88 backdrop-blur-sm sm:bottom-2.5 sm:text-[0.65rem]">
                {t('gallery.counter', { current: index + 1, total: GALLERY_SLIDE_COUNT })}
              </p>
            </div>

            {/* mobile thumbnail strip */}
            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
              {slideIds.map((i) => (
                <button
                  key={i}
                  type="button"
                  data-gallery-thumb={i}
                  onClick={() => goToSlide(i)}
                  className={`relative h-16 w-12 shrink-0 snap-start overflow-hidden rounded border transition ring-offset-2 ring-offset-[#070707] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/60 ${
                    i === index
                      ? 'border-amber-400/70 shadow-[0_0_0_1px_rgba(212,165,65,0.35)] ring-amber-400/60'
                      : 'border-white/14 opacity-[0.88] hover:border-gold-400/35 hover:opacity-100'
                  }`}
                  aria-current={i === index ? 'true' : undefined}
                  aria-label={t('gallery.thumbAria', { n: i + 1 })}
                >
                  <img src={galleryImageSrc(i)} alt="" className="h-full w-full object-cover" draggable={false} />
                </button>
              ))}
            </div>
          </div>

          {/* desktop: vertical thumbnails on the side */}
          <aside className="hidden w-[4rem] shrink-0 flex-col self-start pt-0.5 lg:flex xl:w-[4.35rem]">
            <nav
              className="flex max-h-[min(52vh,20rem)] flex-col gap-1.5 overflow-y-auto pb-1 pr-0.5"
              ref={thumbStripRef}
            >
              {slideIds.map((i) => (
                <button
                  key={i}
                  type="button"
                  data-gallery-thumb={i}
                  onClick={() => goToSlide(i)}
                  className={`group relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded border text-left shadow-sm transition ring-offset-2 ring-offset-[#070707] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/60 ${
                    i === index
                      ? 'border-amber-400/75 ring-[3px] ring-amber-500/55'
                      : 'border-white/14 hover:border-gold-400/40 hover:brightness-105'
                  }`}
                  aria-current={i === index ? 'true' : undefined}
                  aria-label={t('gallery.thumbAria', { n: i + 1 })}
                >
                  <img src={galleryImageSrc(i)} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" draggable={false} />
                  {i === index && (
                    <span className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_2px_rgba(234,179,8,0.45)] pointer-events-none" />
                  )}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </MotionSection>
  )
}

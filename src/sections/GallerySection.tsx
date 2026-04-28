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
      className="scroll-mt-20 border-y border-gold-400/15 bg-gradient-to-b from-[#060606] via-[#080808] to-[#050505] px-4 py-16 sm:px-6"
      aria-labelledby="gallery-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="gallery-heading"
          className="text-center font-serif text-2xl font-medium text-gold-300 sm:text-3xl md:text-4xl"
        >
          {t('gallery.title')}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-white/75 sm:text-base">
          {t('gallery.subtitle')}
        </p>

        <div
          className="mt-10 flex flex-col gap-6 lg:mt-12 lg:flex-row lg:items-stretch lg:gap-8 lg:gap-10"
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
                'relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none',
                'rounded-sm p-[9px] sm:p-[13px]',
                'bg-[linear-gradient(152deg,#1f1a13_0%,#887456_42%,#2a251c_62%,#1a1712_100%)]',
                'shadow-[inset_0_1px_0_rgba(255,230,200,0.16),inset_0_-2px_8px_rgba(0,0,0,0.45)]',
                'ring-1 ring-amber-500/35',
              ].join(' ')}
            >
              {/* inner mat */}
              <div className="relative overflow-hidden rounded-sm bg-neutral-950 p-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.65)] ring-1 ring-black/55">
                <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-neutral-950 to-black sm:aspect-[3/4]">
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
                          sizes="(min-width: 1024px) 42vw, 90vw"
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
                      sizes="(min-width: 1024px) 42vw, 90vw"
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
                className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/18 bg-black/55 text-white/92 shadow-lg backdrop-blur-sm transition-colors hover:bg-black/72 hover:border-gold-400/45 sm:left-4"
                aria-label={t('gallery.prevAria')}
              >
                <Chevron dir="left" className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/18 bg-black/55 text-white/92 shadow-lg backdrop-blur-sm transition-colors hover:bg-black/72 hover:border-gold-400/45 sm:right-4"
                aria-label={t('gallery.nextAria')}
              >
                <Chevron dir="right" className="h-6 w-6" />
              </button>

              <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/12 bg-black/55 px-3 py-1 font-condensed text-[0.65rem] font-semibold tabular-nums tracking-wider text-white/88 backdrop-blur-sm sm:bottom-4 sm:text-xs">
                {t('gallery.counter', { current: index + 1, total: GALLERY_SLIDE_COUNT })}
              </p>
            </div>

            {/* mobile thumbnail strip */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
              {slideIds.map((i) => (
                <button
                  key={i}
                  type="button"
                  data-gallery-thumb={i}
                  onClick={() => goToSlide(i)}
                  className={`relative h-24 w-[4.75rem] shrink-0 snap-start overflow-hidden rounded-md border transition ring-offset-2 ring-offset-[#070707] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/60 ${
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
          <aside className="hidden w-[5.85rem] shrink-0 flex-col gap-2.5 self-stretch lg:flex">
            <nav
              className="flex max-h-[min(70vh,640px)] flex-col gap-2.5 overflow-y-auto pb-1 pr-0.5"
              ref={thumbStripRef}
            >
              {slideIds.map((i) => (
                <button
                  key={i}
                  type="button"
                  data-gallery-thumb={i}
                  onClick={() => goToSlide(i)}
                  className={`group relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-md border text-left shadow-md transition ring-offset-2 ring-offset-[#070707] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/60 ${
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

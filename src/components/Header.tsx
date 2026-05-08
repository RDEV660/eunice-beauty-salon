import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { To } from 'react-router-dom'
import { HeaderNavLink } from './HeaderNavLink'
import { LanguageSwitch } from './LanguageSwitch'

const homeLinks: {
  to: To
  key: 'nav.home' | 'nav.services' | 'nav.gallery' | 'nav.book' | 'nav.location' | 'nav.contact'
}[] = [
  { to: { pathname: '/', hash: '#home' }, key: 'nav.home' },
  { to: { pathname: '/', hash: '#services' }, key: 'nav.services' },
  { to: '/gallery', key: 'nav.gallery' },
  { to: '/book', key: 'nav.book' },
  { to: { pathname: '/', hash: '#location' }, key: 'nav.location' },
  { to: { pathname: '/', hash: '#contact' }, key: 'nav.contact' },
]

export function Header() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  return (
    <motion.header
      className="sticky top-0 z-30 border-b border-gold-400/30 bg-[#050505]/92 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
      initial={reduce ? false : { opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <motion.div whileHover={reduce ? undefined : { scale: 1.03 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
          <Link
            to="/"
            className="block font-serif text-sm font-semibold tracking-[0.22em] text-gold-300 drop-shadow-[0_0_18px_rgba(240,200,60,0.35)] transition-colors hover:text-gold-200 sm:text-base"
          >
            EUNICE
          </Link>
        </motion.div>
        <nav
          className="hidden flex-wrap items-center justify-end gap-1 sm:flex sm:gap-2"
          aria-label="Primary"
        >
          {homeLinks.map(({ to, key }, i) => (
            <motion.div
              key={key}
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.04 + i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeaderNavLink
                to={to}
                className="rounded-md px-2 py-2 font-condensed text-[0.65rem] font-semibold uppercase tracking-wider text-white/85 transition-colors duration-300 hover:text-gold-300 sm:px-3 sm:text-xs"
              >
                {t(key)}
              </HeaderNavLink>
            </motion.div>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitch />
        </div>
      </div>
      <nav
        className="flex flex-wrap justify-center gap-1 border-t border-gold-400/10 px-2 py-2 sm:hidden"
        aria-label="Primary mobile"
      >
        {homeLinks.map(({ to, key }) => (
          <HeaderNavLink
            key={key}
            to={to}
            className="rounded-md px-2 py-1.5 font-condensed text-[0.6rem] font-semibold uppercase tracking-wider text-white/80 transition-colors hover:text-gold-300"
          >
            {t(key)}
          </HeaderNavLink>
        ))}
      </nav>
    </motion.header>
  )
}

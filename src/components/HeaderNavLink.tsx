import { type MouseEvent, type ReactNode } from 'react'
import { Link, useLocation, type To } from 'react-router-dom'

type Props = {
  to: To
  className?: string
  children: ReactNode
}

/**
 * In-page #hash links: when already on the same /#section, still scroll.
 * Fixes nav feeling “dead” on repeat clicks and RR hash quirks.
 */
export function HeaderNavLink({ to, className, children }: Props) {
  const location = useLocation()

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (typeof to === 'string') {
      if (
        (to === '/book' && location.pathname === '/book') ||
        (to === '/gallery' && location.pathname === '/gallery')
      ) {
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }
    if (to.pathname === '/' && to.hash) {
      if (location.pathname === '/' && location.hash === to.hash) {
        e.preventDefault()
        const id = to.hash.replace(/^#/, '')
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <Link to={to} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

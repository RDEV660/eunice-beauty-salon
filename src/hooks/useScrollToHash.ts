import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * When the route is / with a #hash, scroll to the matching [id] section.
 * Required because React Router client navigation does not always trigger native hash scroll.
 */
export function useScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (pathname !== '/' || !hash) return
    const id = hash.replace(/^#/, '')
    if (!id) return

    const run = () => {
      const el = document.getElementById(id)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    run()
    const t = window.setTimeout(run, 0)
    return () => clearTimeout(t)
  }, [pathname, hash])
}

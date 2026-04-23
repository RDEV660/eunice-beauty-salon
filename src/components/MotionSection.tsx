import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
  id?: string
  className?: string
  children: ReactNode
  'aria-label'?: string
  /**
   * `scroll` — fade/slide in when the section enters the viewport.
   * `none` — no entrance animation; use when embedding iframes (e.g. Square) that need a fully painted, visible parent.
   */
  entrance?: 'scroll' | 'none'
}

export function MotionSection({
  id,
  className,
  children,
  entrance = 'scroll',
  ...rest
}: Props) {
  const reduce = useReducedMotion()
  if (entrance === 'none') {
    return (
      <motion.section id={id} className={className} initial={false} {...rest}>
        {children}
      </motion.section>
    )
  }
  return (
    <motion.section
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 36, scale: 0.985 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.section>
  )
}

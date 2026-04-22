import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
  id?: string
  className?: string
  children: ReactNode
  'aria-label'?: string
}

export function MotionSection({ id, className, children, ...rest }: Props) {
  const reduce = useReducedMotion()
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

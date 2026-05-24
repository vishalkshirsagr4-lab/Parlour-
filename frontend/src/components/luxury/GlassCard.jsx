import { motion } from 'framer-motion'

export default function GlassCard({
  children,
  className = '',
  as: Component = 'div',
  hoverScale = 1.02,
  initial = { opacity: 0, y: 10 },
  animate = { opacity: 1, y: 0 },
  transition = { duration: 0.35, ease: 'easeOut' },
}) {
  return (
    <motion.div
      as={Component}
      initial={initial}
      animate={animate}
      transition={transition}
      whileHover={{ scale: hoverScale }}
      className={`rounded-xl bg-white/90 border border-black/5 shadow-md ${className}`}
    >
      {children}
    </motion.div>
  )
}



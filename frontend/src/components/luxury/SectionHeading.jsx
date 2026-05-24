import { motion } from 'framer-motion'

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className = '',
}) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'items-start text-left'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`flex flex-col gap-2 ${alignClass} ${className}`}
    >
      {eyebrow ? (
        <div className="text-xs tracking-[0.2em] uppercase text-white/70 dark:text-white/60">
          {eyebrow}
        </div>
      ) : null}
      {title ? <div className="text-xl md:text-2xl font-bold">{title}</div> : null}
      {subtitle ? (
        <div className="text-sm md:text-base text-white/75 dark:text-white/60 leading-relaxed">
          {subtitle}
        </div>
      ) : null}
    </motion.div>
  )
}


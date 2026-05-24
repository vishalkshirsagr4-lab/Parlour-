import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import SkeletonLuxury from './SkeletonLuxury'

export default function PremiumImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  aspect = 'aspect-[4/3]',
  lazy = true,
  placeholder = true,
  onClick,
  ...props
}) {
  const [loaded, setLoaded] = useState(false)

  const safeAlt = useMemo(() => alt || 'Luxury image', [alt])

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left"
      disabled={!onClick}
    >
      <div className={`relative w-full ${aspect} ${className}`}>
        {placeholder && !loaded ? (
          <SkeletonLuxury rounded="rounded-3xl" className="absolute inset-0" />
        ) : null}
        <motion.img
          src={src}
          alt={safeAlt}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={() => setLoaded(true)}
          initial={{ opacity: 0, y: 6, scale: 1.01 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`absolute inset-0 w-full h-full object-cover ${imgClassName}`}
          {...props}
        />
      </div>
    </button>
  )
}


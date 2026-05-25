import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const LuxuryButton = forwardRef(function LuxuryButton(
  {
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    ...props
  },
  ref
) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 select-none disabled:opacity-60 disabled:cursor-not-allowed'

  const sizeClasses =
    size === 'sm'
      ? 'px-4 py-2 text-sm'
      : size === 'lg'
        ? 'px-7 py-4 text-base'
        : 'px-6 py-3 text-sm md:text-base'

  const variantClasses =
    variant === 'secondary'
      ? 'btn-secondary'
      : variant === 'primary'
        ? 'btn-primary'
        : variant === 'ghost'
          ? 'bg-transparent text-white/90 hover:bg-white/10 border border-white/20 backdrop-blur-xl'
          : 'btn-primary'

  return (
    <motion.button
      ref={ref}
      whileHover={props.disabled || isLoading ? undefined : { scale: 1.04 }}
      whileTap={props.disabled || isLoading ? undefined : { scale: 0.99 }}
      className={`${base} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {leftIcon}
      <span className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}>
        {children}
      </span>
      {isLoading ? (
        <span className="absolute" aria-hidden>
          <span className="inline-block w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
        </span>
      ) : null}
      {rightIcon}
    </motion.button>
  )
})

export { LuxuryButton }
export default LuxuryButton


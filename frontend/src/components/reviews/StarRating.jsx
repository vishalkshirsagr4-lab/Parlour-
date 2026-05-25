import { memo, useId } from 'react'
import { motion } from 'framer-motion'

function Star({ filled, onClick, onMouseEnter, label }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      aria-label={label}
      className="relative inline-flex items-center justify-center"
    >
      <span
        className={
          filled
            ? 'text-yellow-300 drop-shadow-[0_0_10px_rgba(250,204,21,0.45)]'
            : 'text-white/40'
        }
        style={{ fontSize: 22, lineHeight: 1 }}
      >
        ★
      </span>
    </motion.button>
  )
}

/**
 * Production star rating.
 * - value: controlled selected rating
 * - onChange: when provided, interactive
 */
function StarRating({ value = 0, onChange, size = 'md' }) {
  const rid = useId()
  const normalized = Number.isFinite(value) ? value : 0

  const starSize = size === 'sm' ? 18 : size === 'lg' ? 26 : 22

  return (
    <div
      role="radiogroup"
      aria-label={`Rating: ${normalized} out of 5`}
      className="flex items-center gap-1"
    >
      {Array.from({ length: 5 }).map((_, idx) => {
        const starValue = idx + 1
        const filled = starValue <= normalized

        const label = `${starValue} star${starValue === 1 ? '' : 's'}`

        return (
          <div key={`${rid}-${starValue}`}>
            <Star
              filled={filled}
              label={label}
              onClick={
                typeof onChange === 'function'
                  ? () => onChange(starValue)
                  : undefined
              }
              onMouseEnter={
                typeof onChange === 'function'
                  ? () => onChange(starValue)
                  : undefined
              }
            />
          </div>
        )
      })}

      {/* visual size control */}
      <style>{`[data-star-size='${normalized}']{ font-size:${starSize}px; }`}</style>
    </div>
  )
}

export default memo(StarRating)


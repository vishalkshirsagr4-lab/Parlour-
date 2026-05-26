import React from 'react'
import toast from 'react-hot-toast'

// ProtectedImage: reusable component to discourage downloads/screenshots.
// Props: src, alt, watermark (string), className, style
export default function ProtectedImage({ src, alt = '', watermark = 'Parlour', className = '', style = {}, ...rest }) {
  const handleContext = (e) => {
    e.preventDefault()
    toast('Action disabled')
  }

  const onDragStart = (e) => {
    e.preventDefault()
  }

  const onTouchStart = (e) => {
    // Prevent long-press showing save menu on many mobile browsers
    try {
      e.preventDefault()
    } catch (err) {}
  }

  return (
    <div className={`relative overflow-hidden select-none ${className}`} style={style}>
      <img
        src={src}
        alt={alt}
        draggable={false}
        onContextMenu={handleContext}
        onDragStart={onDragStart}
        onTouchStart={onTouchStart}
        className={`w-full h-auto object-cover protected-blur`}
        {...rest}
      />

      <div className="protection-watermark" aria-hidden>
        <span>{watermark}</span>
      </div>
    </div>
  )
}

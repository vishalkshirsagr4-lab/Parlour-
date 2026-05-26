import React from 'react'

// Wrap any sensitive content in this wrapper to apply selection/interaction protections
export default function ProtectionWrapper({ children, className = '' }) {
  return (
    <div className={`select-none ${className}`} aria-hidden>
      {children}
    </div>
  )
}

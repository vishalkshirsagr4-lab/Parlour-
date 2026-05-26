import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function useProtection({ enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return

    // Disable right-click/context menu globally
    const onContext = (e) => {
      try {
        e.preventDefault()
      } catch (err) {}
    }

    // Prevent drag on images
    const onDragStart = (e) => {
      if (e.target && e.target.tagName === 'IMG') {
        e.preventDefault()
      }
    }

    // Attempt to catch PrintScreen key (best-effort)
    const onKeyDown = async (e) => {
      try {
        const isPrint = e.key === 'PrintScreen' || e.key === 'Print' || e.keyCode === 44
        if (isPrint) {
          // Try to clear clipboard (may require permissions)
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText('')
            }
          } catch (err) {
            // ignore
          }

          toast.warning('Screenshot attempt detected — clipboard cleared (where supported).')
        }
      } catch (err) {}
    }

    // Handle tab visibility to add class for protected blur
    const onVisibility = () => {
      try {
        if (document.hidden) document.body.classList.add('protection-hidden')
        else document.body.classList.remove('protection-hidden')
      } catch (err) {}
    }

    // Prevent long-press context menu on touch for images
    const onTouchStart = (e) => {
      if (e.target && e.target.tagName === 'IMG') {
        // stop the long-press menu on many mobile browsers
        try {
          e.preventDefault()
        } catch (err) {}
      }
    }

    // Prevent selection start globally (optional: for full app disable)
    const onSelectStart = (e) => {
      // Allow inputs
      const tag = e.target && e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      try {
        // only prevent when selecting images/text globally
        e.preventDefault()
      } catch (err) {}
    }

    document.addEventListener('contextmenu', onContext)
    document.addEventListener('dragstart', onDragStart)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('touchstart', onTouchStart, { passive: false })
    // Only prevent selection inside protected areas — using select-none class is preferable.
    // document.addEventListener('selectstart', onSelectStart)

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', onContext)
      document.removeEventListener('dragstart', onDragStart)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('touchstart', onTouchStart)
      // document.removeEventListener('selectstart', onSelectStart)
      document.body.classList.remove('protection-hidden')
    }
  }, [enabled])
}

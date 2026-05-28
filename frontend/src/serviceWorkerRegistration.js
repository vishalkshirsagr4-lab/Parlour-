export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const currentScript = '/service-worker.js'
        const targetScope = '/'

        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const reg of registrations) {
          console.log('[SW] existing registration found', reg.scope, reg.active?.scriptURL || reg.waiting?.scriptURL || reg.installing?.scriptURL)
          if (reg.scope !== targetScope || !reg.active?.scriptURL?.endsWith(currentScript)) {
            console.log('[SW] unregistering stale service worker', reg.scope)
            await reg.unregister()
          }
        }

        // Register service worker at root scope to ensure it controls pages on the site
        const registration = await navigator.serviceWorker.register(currentScript, { scope: targetScope })
        console.log('[SW] Registered at scope:', registration.scope)

        if (registration.installing) console.log('[SW] SW installing')
        if (registration.waiting) console.log('[SW] SW waiting')
        if (registration.active) console.log('[SW] SW active')

        try {
          await registration.update()
          console.log('[SW] registration.update() called to refresh service worker script')
        } catch (updateErr) {
          console.warn('[SW] registration.update() failed:', updateErr)
        }

        // If the page isn't yet controlled, wait until the service worker takes control
        if (!navigator.serviceWorker.controller) {
          console.log('[SW] Page not yet controlled by SW — waiting for controllerchange')
          await new Promise((resolve) => {
            const onControllerChange = () => {
              console.log('[SW] Controller changed — page now controlled')
              navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
              resolve()
            }
            navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
          })
        }

        // Ensure the registration is ready (service worker activated)
        try {
          const ready = await navigator.serviceWorker.ready
          console.log('[SW] navigator.serviceWorker.ready resolved, scope:', ready.scope)
          if (ready.scope !== targetScope) {
            console.warn('[SW] Service worker scope mismatch', ready.scope, 'expected', targetScope)
          }
        } catch (readyErr) {
          console.warn('[SW] navigator.serviceWorker.ready did not resolve quickly:', readyErr)
        }
      } catch (error) {
        console.warn('[SW] Service Worker registration failed:', error)
      }
    })
  }
}

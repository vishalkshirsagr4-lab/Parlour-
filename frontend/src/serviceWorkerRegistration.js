export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        // Register service worker at root scope to ensure it controls pages on the site
        const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
        console.log('[SW] Registered at scope:', registration.scope)

        // Log updatefound so we can debug lifecycle issues
        if (registration.installing) console.log('[SW] SW installing');
        if (registration.waiting) console.log('[SW] SW waiting');
        if (registration.active) console.log('[SW] SW active');

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
        } catch (readyErr) {
          console.warn('[SW] navigator.serviceWorker.ready did not resolve quickly:', readyErr)
        }

      } catch (error) {
        console.warn('[SW] Service Worker registration failed:', error)
      }
    })
  }
}

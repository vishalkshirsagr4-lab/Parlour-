export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        // Register service worker at root scope to ensure it controls pages on the site
        const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
        console.log('[SW] Registered at scope:', registration.scope)

        // If the page isn't yet controlled, wait until the service worker takes control
        if (!navigator.serviceWorker.controller) {
          console.log('[SW] Page not yet controlled by SW — waiting for takecontrol')
          await new Promise((resolve) => {
            const onControllerChange = () => {
              console.log('[SW] Controller changed — page now controlled')
              navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
              resolve()
            }
            navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
          })
        }
      } catch (error) {
        console.warn('[SW] Service Worker registration failed:', error)
      }
    })
  }
}

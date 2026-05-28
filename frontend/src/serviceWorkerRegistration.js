export async function registerServiceWorker() {
if (!('serviceWorker' in navigator)) {
console.warn('[SW] Service workers not supported')
return null
}

try {
console.log('[SW] Registering service worker...')

// Register service worker
const registration = await navigator.serviceWorker.register(
  '/service-worker.js',
  {
    scope: '/',
  }
)

console.log('[SW] Registered successfully')
console.log('[SW] Scope:', registration.scope)

// Log states
if (registration.installing) {
  console.log('[SW] Installing...')
}

if (registration.waiting) {
  console.log('[SW] Waiting...')
}

if (registration.active) {
  console.log('[SW] Active')
}

// Wait until service worker becomes ready
const readyRegistration = await navigator.serviceWorker.ready

console.log(
  '[SW] Ready and controlling pages:',
  readyRegistration.scope
)

// Listen for updates
registration.addEventListener('updatefound', () => {
  console.log('[SW] Update found')
})

// Detect controller changes
navigator.serviceWorker.addEventListener(
  'controllerchange',
  () => {
    console.log('[SW] Controller changed')
  }
)

return registration

} catch (error) {
console.error(
'[SW] Registration failed:',
error
)

return null

}
  }

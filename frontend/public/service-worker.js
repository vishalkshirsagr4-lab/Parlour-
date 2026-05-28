const CACHE_NAME = 'parlour-pwa-cache-v2'

const STATIC_ASSETS = [
'/',
'/manifest.json',
]

console.log('[SW] Service worker file loaded')

/* =========================
INSTALL
========================= */
self.addEventListener('install', (event) => {
console.log('[SW] Install event')

event.waitUntil(
(async () => {
try {
const cache = await caches.open(CACHE_NAME)

    // Cache only safe assets
    await cache.addAll(STATIC_ASSETS)

    console.log('[SW] Assets cached successfully')

    // Activate immediately
    await self.skipWaiting()

    console.log('[SW] skipWaiting completed')
  } catch (err) {
    console.error('[SW] Install failed:', err)
  }
})()

)
})

/* =========================
ACTIVATE
========================= */
self.addEventListener('activate', (event) => {
console.log('[SW] Activate event')

event.waitUntil(
(async () => {
try {
// Remove old caches
const keys = await caches.keys()

    await Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Deleting old cache:', key)
          return caches.delete(key)
        }
      })
    )

    // Take control immediately
    await self.clients.claim()

    console.log('[SW] Clients claimed successfully')
  } catch (err) {
    console.error('[SW] Activate failed:', err)
  }
})()

)
})

/* =========================
FETCH
========================= */
self.addEventListener('fetch', (event) => {
// Never intercept non-GET requests
if (event.request.method !== 'GET') return

// Never cache service worker itself
if (event.request.url.includes('service-worker.js')) {
return
}

// Never cache API calls
if (event.request.url.includes('/api/')) {
return
}

event.respondWith(
(async () => {
try {
const cached = await caches.match(event.request)

    if (cached) {
      return cached
    }

    const response = await fetch(event.request)

    // Cache only successful same-origin requests
    if (
      response &&
      response.status === 200 &&
      response.type === 'basic'
    ) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(event.request, response.clone())
    }

    return response
  } catch (err) {
    console.error('[SW] Fetch failed:', err)

    // Only fallback for navigation requests
    if (event.request.mode === 'navigate') {
      return caches.match('/')
    }

    return new Response('Offline', {
      status: 503,
      statusText: 'Offline',
    })
  }
})()

)
})

/* =========================
PUSH NOTIFICATIONS
========================= */
self.addEventListener('push', (event) => {
console.log('[SW] Push event received')

event.waitUntil(
(async () => {
try {
let data = {}

    if (event.data) {
      try {
        data = event.data.json()
        console.log('[SW] Push payload:', data)
      } catch (err) {
        console.warn('[SW] Invalid JSON payload')

        try {
          data.body = await event.data.text()
        } catch (e) {
          console.error('[SW] Failed reading text payload')
        }
      }
    }

    const title = data.title || 'Parlour Notification'

    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/icons/icon-192.svg',

      // Remove badge temporarily to prevent Android failures
      // badge: '/icons/badge-72.svg',

      tag: data.tag || 'parlour-notification',
      data: {
        url: data.url || '/',
      },
      vibrate: [200, 100, 200],
      requireInteraction: false,
    }

    console.log('[SW] Showing notification:', title)

    await self.registration.showNotification(title, options)

    console.log('[SW] Notification displayed successfully')
  } catch (err) {
    console.error('[SW] Push handling failed:', err)

    // Emergency fallback
    try {
      await self.registration.showNotification('Parlour Notification', {
        body: 'New notification received',
        icon: '/icons/icon-192.svg',
      })

      console.log('[SW] Emergency notification shown')
    } catch (fallbackErr) {
      console.error('[SW] Emergency notification failed:', fallbackErr)
    }
  }
})()

)
})

/* =========================
NOTIFICATION CLICK
========================= */
self.addEventListener('notificationclick', (event) => {
console.log('[SW] Notification clicked')

event.notification.close()

const targetUrl =
event.notification?.data?.url || '/'

event.waitUntil(
(async () => {
try {
const clientsList = await clients.matchAll({
type: 'window',
includeUncontrolled: true,
})

    for (const client of clientsList) {
      if ('focus' in client) {
        await client.focus()

        client.navigate(targetUrl)

        return
      }
    }

    if (clients.openWindow) {
      await clients.openWindow(targetUrl)
    }
  } catch (err) {
    console.error('[SW] Notification click failed:', err)
  }
})()

)
})

/* =========================
PUSH SUBSCRIPTION CHANGE
========================= */
self.addEventListener('pushsubscriptionchange', (event) => {
console.log('[SW] Push subscription changed')

event.waitUntil(
(async () => {
try {
const allClients = await clients.matchAll({
includeUncontrolled: true,
})

    for (const client of allClients) {
      client.postMessage({
        type: 'PUSH_SUBSCRIPTION_EXPIRED',
      })
    }
  } catch (err) {
    console.error('[SW] Subscription change failed:', err)
  }
})()

)
})

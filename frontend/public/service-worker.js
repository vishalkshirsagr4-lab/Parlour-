const CACHE_NAME = 'parlour-pwa-cache-v1'
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
]

console.log('[SW] Service worker script loaded')

self.addEventListener('install', (event) => {
  console.log('[SW] install event')
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    await cache.addAll(ASSETS)
    await self.skipWaiting()
    console.log('[SW] install complete and skipWaiting called')
  })())
})

self.addEventListener('activate', (event) => {
  console.log('[SW] activate event')
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key)
        }
        return null
      })
    )
    await self.clients.claim()
    console.log('[SW] activate complete and clients.claim called')
  })())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return response
        })
        .catch(() => caches.match('/index.html'))
    })
  )
})

/* =========================================
   PUSH NOTIFICATIONS
========================================= */

/**
 * Handle incoming push notifications
 * This event is triggered when a push notification is sent from the server
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received', !!event.data)

  event.waitUntil((async () => {
    try {
      let payload = null

      if (event.data) {
        // Try to parse JSON, fallback to text
        try {
          payload = event.data.json()
          console.log('[SW] push: parsed JSON payload', payload)
        } catch (jsonErr) {
          try {
            const txt = await event.data.text()
            try {
              payload = JSON.parse(txt)
              console.log('[SW] push: parsed JSON from text payload', payload)
            } catch (e) {
              // Not JSON, treat as body text
              payload = { body: txt }
              console.log('[SW] push: text payload used as body', txt)
            }
          } catch (textErr) {
            console.warn('[SW] push: could not extract text payload', textErr)
            payload = null
          }
        }
      }

      const defaults = {
        title: 'Parlour Notification',
        body: 'You have a new notification',
        icon: '/icons/icon-192.svg',
        badge: '/icons/badge-72.svg',
        tag: 'parlour-notification',
        requireInteraction: false,
        data: {},
        actions: [],
      }

      const data = payload && typeof payload === 'object' ? { ...defaults, ...payload } : defaults

      const title = data.title || defaults.title
      const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        data: data.data || {},
        actions: data.actions || [],
        requireInteraction: !!data.requireInteraction,
        vibrate: data.vibrate || [200, 100, 200],
      }

      console.log('[SW] Showing notification (background):', title, options)

      await self.registration.showNotification(title, options)
      console.log('[SW] Notification shown successfully')
    } catch (err) {
      console.error('[SW] Error handling push event:', err)
      try {
        console.log('[SW] Showing emergency fallback notification')
        await self.registration.showNotification('Parlour Notification', {
          body: 'You have a new notification',
          icon: '/icons/icon-192.svg',
          badge: '/icons/badge-72.svg',
          tag: 'parlour-notification-fallback',
          data: {},
        })
      } catch (fallbackErr) {
        console.error('[SW] Emergency fallback notification failed:', fallbackErr)
      }
    }
  })())
})

/**
 * Handle notification clicks
 * This allows navigation when user clicks on the notification
 */
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification)
  event.notification.close()

  const data = event.notification.data || {}
  const url = data.link || '/'

  // Check if app is already open
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Look for a window that matches the target URL
      for (const client of clientList) {
        try {
          // Compare origins + path to allow query string differences
          const clientUrl = new URL(client.url);
          const targetUrl = new URL(url, self.location.origin);
          if (clientUrl.origin === targetUrl.origin && clientUrl.pathname === targetUrl.pathname && 'focus' in client) {
            return client.focus()
          }
        } catch (e) {
          // Fallback simple comparison
          if (client.url === url && 'focus' in client) return client.focus()
        }
      }
      // If not found, open new window
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

/**
 * Handle notification close
 * Optional: track when users dismiss notifications
 */
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed by user:', event.notification)
  // You can send analytics here if needed
})

/**
 * Convert Base64 URL-safe string to Uint8Array
 * This is needed for `pushsubscriptionchange` re-subscribe flow
 */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Handle subscription changes (some browsers rotate subscriptions)
 * Attempt to re-subscribe and notify clients so the app can save
 * the new subscription to the backend (client must be authenticated)
 */
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] pushsubscriptionchange event')

  event.waitUntil((async () => {
    try {
      // Try to get VAPID public key from server
      const resp = await fetch('/api/push/public-key');
      if (!resp || resp.status !== 200) {
        console.warn('[SW] Could not fetch VAPID public key for resubscribe')
        return
      }
      const body = await resp.json();
      const publicKey = body.publicKey || body?.publicKey;
      if (!publicKey) {
        console.warn('[SW] No VAPID public key returned')
        return
      }

      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      const newSub = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      console.log('[SW] Resubscribed to push, notifying clients to sync to server')

      // Notify all clients — the client should save the new subscription to the backend
      const allClients = await clients.matchAll({ includeUncontrolled: true });
      for (const client of allClients) {
        client.postMessage({ type: 'PUSH_SUB_CHANGED', subscription: newSub ? newSub.toJSON() : null });
      }
    } catch (err) {
      console.error('[SW] Error during pushsubscriptionchange:', err)
    }
  })())
})


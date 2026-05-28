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
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  )
})

self.addEventListener('activate', (event) => {
  console.log('[SW] activate event')
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
          return null
        })
      )
    )
  )
  self.clients.claim()
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
  console.log('[SW] Push event received')
  
  let notificationData = {
    title: 'Parlour Notification',
    body: 'You have a new notification',
    icon: '/icons/icon-192.svg',
    badge: '/icons/badge-72.svg',
    tag: 'default',
    requireInteraction: false,
  }

  try {
    if (event.data) {
      const data = event.data.json()
      console.log('[SW] Push data parsed:', data)
      notificationData = {
        ...notificationData,
        ...data,
      }
    } else {
      console.warn('[SW] Push event has no data')
    }
  } catch (error) {
    console.error('[SW] Error parsing push data:', error)
    if (event.data) {
      notificationData.body = event.data.text()
    }
  }

  console.log('[SW] Showing notification:', notificationData.title)

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data || {},
      actions: notificationData.actions || [],
      requireInteraction: notificationData.requireInteraction || false,
      vibrate: [200, 100, 200],
    }).then(() => {
      console.log('[SW] Notification shown successfully')
    }).catch((err) => {
      console.error('[SW] Failed to show notification:', err)
    })
  )
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


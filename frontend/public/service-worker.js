const CACHE_NAME = 'parlour-pwa-cache-v1'
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  )
})

self.addEventListener('activate', (event) => {
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
      notificationData = {
        ...notificationData,
        ...data,
      }
    }
  } catch (error) {
    console.error('Error parsing push data:', error)
    if (event.data) {
      notificationData.body = event.data.text()
    }
  }

  console.log('Push notification received:', notificationData)

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
        if (client.url === url && 'focus' in client) {
          return client.focus()
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


import apiClient from '../api/apiClient'

/**

* Get VAPID public key
  */
  export const getVapidPublicKey = async () => {
  try {
  const response = await apiClient.get('/push/public-key')
  
  return response.data.publicKey
  } catch (error) {
  console.error('[Push] Failed to get VAPID key:', error)
  
  throw error
  }
  }

/**

* Convert VAPID key
  */
  const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat(
  (4 - (base64String.length % 4)) % 4
  )

const base64 = (base64String + padding)
.replace(/-/g, '+')
.replace(/_/g, '/')

const rawData = window.atob(base64)

return Uint8Array.from(
[...rawData].map((char) =>
char.charCodeAt(0)
)
)
}

/**

* Wait for service worker
  */
  const getServiceWorkerRegistration = async () => {
  if (!('serviceWorker' in navigator)) {
  throw new Error(
  'Service workers not supported'
  )
  }

const registration =
await navigator.serviceWorker.ready

if (!registration) {
throw new Error(
'Service worker not ready'
)
}

console.log(
'[Push] Service worker ready:',
registration.scope
)

return registration
}

/**

* Subscribe to push notifications
  */
  export const subscribeToPushNotifications =
  async () => {
  try {
  if (!('PushManager' in window)) {
  console.warn(
  '[Push] Push notifications not supported'
  )
  
   return false
  
  }
  
  // Permission check
  if (Notification.permission !== 'granted') {
  console.warn(
  '[Push] Notification permission not granted'
  )
  
   return false
  
  }
  
  // Get SW
  const registration =
  await getServiceWorkerRegistration()
  
  // Existing subscription
  let subscription =
  await registration.pushManager.getSubscription()
  
  // Reuse existing
  if (subscription) {
  console.log(
  '[Push] Existing subscription found'
  )
  } else {
  // Create new subscription
  const vapidKey =
  await getVapidPublicKey()
  
   subscription =
   await registration.pushManager.subscribe(
     {
       userVisibleOnly: true,
       applicationServerKey:
         urlBase64ToUint8Array(vapidKey),
     }
   )

 console.log(
   '[Push] New subscription created'
 )
  
  }
  
  // Save to backend
  const subJson = subscription.toJSON()
  
  await apiClient.post('/push/subscribe', {
  endpoint: subJson.endpoint,
  auth: subJson.keys.auth,
  p256dh: subJson.keys.p256dh,
  })
  
  console.log(
  '[Push] Subscription saved to backend'
  )
  
  return true
  } catch (error) {
  console.error(
  '[Push] Subscription failed:',
  error
  )
  
  return false
  }
  }

/**

* Request permission
  */
  export const requestNotificationPermission =
  async () => {
  try {
  if (!('Notification' in window)) {
  return 'denied'
  }
  
  if (Notification.permission === 'granted') {
  return 'granted'
  }
  
  const permission =
  await Notification.requestPermission()
  
  console.log(
  '[Push] Notification permission:',
  permission
  )
  
  return permission
  } catch (error) {
  console.error(
  '[Push] Permission request failed:',
  error
  )
  
  return 'denied'
  }
  }

/**

* Initialize push notifications
  */
  export const initPushNotifications =
  async () => {
  try {
  const permission =
  await requestNotificationPermission()
  
  if (permission !== 'granted') {
  return false
  }
  
  return await subscribeToPushNotifications()
  } catch (error) {
  console.error(
  '[Push] Initialization failed:',
  error
  )
  
  return false
  }
  }

/**

* Check subscription status
  */
  export const isPushNotificationSubscribed =
  async () => {
  try {
  const registration =
  await navigator.serviceWorker.ready
  
  const subscription =
  await registration.pushManager.getSubscription()
  
  return !!subscription
  } catch (error) {
  console.error(
  '[Push] Failed checking subscription:',
  error
  )
  
  return false
  }
  }

/**

* Unsubscribe
  */
  export const unsubscribeFromPushNotifications =
  async () => {
  try {
  const registration =
  await navigator.serviceWorker.ready
  
  const subscription =
  await registration.pushManager.getSubscription()
  
  if (!subscription) {
  return true
  }
  
  await subscription.unsubscribe()
  
  try {
  await apiClient.post('/push/unsubscribe')
  } catch (err) {
  console.warn(
  '[Push] Backend unsubscribe failed'
  )
  }
  
  console.log(
  '[Push] Unsubscribed successfully'
  )
  
  return true
  } catch (error) {
  console.error(
  '[Push] Unsubscribe failed:',
  error
  )
  
  return false
  }
    }


/**

* Get notification status
  */
  export const getPushNotificationStatus =
  async () => {
  try {
  const permission =
  Notification.permission
  
  const isSubscribed =
  await isPushNotificationSubscribed()
  
  return {
  permission,
  isSubscribed,
  enabled:
  permission === 'granted' &&
  isSubscribed,
  }
  } catch (error) {
  console.error(
  '[Push] Status check failed:',
  error
  )
  
  return {
  permission: 'default',
  isSubscribed: false,
  enabled: false,
  }
  }
  }

/**

* Toggle notifications
  */
  export const togglePushNotifications =
  async () => {
  try {
  const status =
  await getPushNotificationStatus()
  
  if (status.enabled) {
  return await unsubscribeFromPushNotifications()
  }
  
  return await initPushNotifications()
  } catch (error) {
  console.error(
  '[Push] Toggle failed:',
  error
  )
  
  return false
  }
  }

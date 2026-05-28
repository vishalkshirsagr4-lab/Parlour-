import apiClient from '../api/apiClient';

/**
 * Get the VAPID public key from the server
 */
export const getVapidPublicKey = async () => {
  try {
    const response = await apiClient.get('/push/public-key');
    return response.data.publicKey;
  } catch (error) {
    console.error('Failed to fetch VAPID public key:', error);
    throw error;
  }
};

/**
 * Convert VAPID public key to Uint8Array
 */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Ensure the service worker is registered and ready before subscribing.
 */
const ensureServiceWorkerReady = async () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Workers not supported by this browser');
  }

  try {
    // Ensure the service worker is registered at root scope
    // Avoid re-registering if already controlled
    if (!navigator.serviceWorker.controller) {
      try {
        await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
        console.debug('[Push] Registered service worker at root scope')
      } catch (regErr) {
        console.warn('[Push] service worker register attempt failed (continuing):', regErr)
      }
    } else {
      console.debug('[Push] service worker already controlling page')
    }
  } catch (registrationError) {
    console.warn('Service Worker registration attempt failed:', registrationError);
  }

  const registration = await navigator.serviceWorker.ready;
  if (!registration) {
    throw new Error('Service Worker ready state could not be reached');
  }
  console.debug('[Push] service worker ready, scope:', registration.scope, 'active:', !!registration.active)

  if (registration.scope !== window.location.origin + '/') {
    console.warn('[Push] Service worker ready scope mismatch:', registration.scope, 'expected', window.location.origin + '/')
  }

  // If the service worker is not yet active, wait briefly for activation
  if (!registration.active) {
    console.warn('[Push] service worker registration found but no active worker yet; waiting')
    const waitForActive = (ms = 3000) => new Promise((resolve) => setTimeout(resolve, ms))
    await waitForActive(1000)
  }

  // Listen for subscription changes from the service worker and sync them to the server
  try {
    if (!window.__push_sub_listener_added) {
      navigator.serviceWorker.addEventListener('message', async (event) => {
        try {
          const payload = event.data;
          if (!payload || payload.type !== 'PUSH_SUB_CHANGED') return;

          console.debug('[Push] Received PUSH_SUB_CHANGED from SW')
          const subscription = payload.subscription;
          if (!subscription) {
            console.warn('[Push] SW reported null subscription')
            return;
          }

          // Send the new subscription to the backend so it can be stored
          try {
            await apiClient.post('/push/subscribe', {
              endpoint: subscription.endpoint,
              auth: subscription.keys.auth,
              p256dh: subscription.keys.p256dh,
            });
            console.debug('[Push] Synced new subscription to server from SW message')
          } catch (err) {
            console.warn('[Push] Failed to sync subscription from SW message:', err?.response?.data || err.message)
          }
        } catch (err) {
          console.error('[Push] Error handling SW message:', err)
        }
      });
      window.__push_sub_listener_added = true;
    }
  } catch (err) {
    console.warn('Could not add service worker message listener:', err.message)
  }

  return registration;
};

/**
 * Subscribe to push notifications
 * Returns true if successful, false otherwise
 */
export const subscribeToPushNotifications = async () => {
  try {
    // Check browser support
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return false;
    }

    if (!('PushManager' in window)) {
      console.warn('Push Notifications not supported');
      return false;
    }

    // Get VAPID public key
    console.debug('Fetching VAPID public key...');
    const vapidPublicKey = await getVapidPublicKey();
    console.debug('✓ VAPID public key fetched');

    // Register and wait for the service worker to be ready
    console.debug('Ensuring service worker is ready...');
    const registration = await ensureServiceWorkerReady();
    console.debug('✓ Service worker is ready');

    // If there is already an existing subscription, reuse it and ensure server has it
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      console.debug('Found existing push subscription in browser')
      const subJson = existing.toJSON()
      console.debug('[Push] existing subscription endpoint host:', new URL(subJson.endpoint).host)
      console.debug('[Push] existing subscription keys present:', !!subJson.keys?.auth, !!subJson.keys?.p256dh)
      try {
        await apiClient.post('/push/subscribe', {
          endpoint: subJson.endpoint,
          auth: subJson.keys.auth,
          p256dh: subJson.keys.p256dh,
        })
        console.debug('✓ Existing subscription synced to server')
        return true
      } catch (err) {
        console.warn('Failed to sync existing subscription to server, attempting re-subscribe:', err?.response?.data || err.message)
        // fallthrough to re-subscribe
      }
    }

    // Subscribe to push
    console.debug('Subscribing to push manager...');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    console.debug('✓ Successfully subscribed to push manager')
    console.debug('[Push] new subscription endpoint host:', new URL(subscription.endpoint).host)
    console.debug('[Push] new subscription has auth/p256dh:', !!subscription.toJSON().keys?.auth, !!subscription.toJSON().keys?.p256dh)

    // Send subscription to server
    console.debug('Sending subscription to server...');
    const subscriptionData = subscription.toJSON();
    
    try {
      await apiClient.post('/push/subscribe', {
        endpoint: subscription.endpoint,
        auth: subscriptionData.keys.auth,
        p256dh: subscriptionData.keys.p256dh,
      });
      console.debug('✓ Subscription saved on server');
    } catch (apiError) {
      console.error('Server subscription error:', apiError.response?.data || apiError.message);
      throw apiError;
    }

    console.log('✓ Successfully subscribed to push notifications');
    return true;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return false;
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPushNotifications = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not available for unsubscribe');
      return false;
    }

    // Add timeout to prevent service worker message channel issues
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Service Worker unsubscribe timeout')), 5000)
    );

    const unsubscribePromise = (async () => {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        console.debug('Push subscription unsubscribed from browser');
        
        try {
          await apiClient.post('/push/unsubscribe');
        } catch (apiError) {
          console.warn('Failed to notify server of unsubscribe:', apiError.message);
        }
        
        console.log('✓ Unsubscribed from push notifications');
        return true;
      }

      return false;
    })();

    return await Promise.race([unsubscribePromise, timeoutPromise]);
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error.message);
    return false;
  }
};

/**
 * Check if user is subscribed to push notifications
 */
export const isPushNotificationSubscribed = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      console.debug('Service Workers not available');
      return false;
    }

    // Add timeout to prevent service worker message channel issues
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Service Worker check timeout')), 5000)
    );

    const checkPromise = (async () => {
      const registration = await navigator.serviceWorker.ready;
      if (!registration) {
        console.warn('Service worker registration not ready');
        return false;
      }
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    })();

    return await Promise.race([checkPromise, timeoutPromise]);
  } catch (error) {
    console.error('Error checking push subscription:', error.message);
    return false;
  }
};

/**
 * Request notification permission
 * Returns 'granted', 'denied', or 'default'
 */
export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

/**
 * Initialize push notifications
 * Requests permission and subscribes to push
 */
export const initPushNotifications = async () => {
  try {
    // Request permission
    const permission = await requestNotificationPermission();

    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    // Subscribe to push
    const subscribed = await subscribeToPushNotifications();

    return subscribed;
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
    return false;
  }
};

/**
 * Get push notification status
 */
export const getPushNotificationStatus = async () => {
  try {
    const permission = Notification.permission;
    const isSubscribed = await isPushNotificationSubscribed();

    return {
      permission,
      isSubscribed,
      enabled: permission === 'granted' && isSubscribed,
    };
  } catch (error) {
    console.error('Error getting push notification status:', error);
    return {
      permission: 'denied',
      isSubscribed: false,
      enabled: false,
    };
  }
};

/**
 * Toggle push notifications on/off
 */
export const togglePushNotifications = async () => {
  try {
    const status = await getPushNotificationStatus();

    if (status.enabled) {
      return await unsubscribeFromPushNotifications();
    } else {
      return await initPushNotifications();
    }
  } catch (error) {
    console.error('Error toggling push notifications:', error);
    return false;
  }
};

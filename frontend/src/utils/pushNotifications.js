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
    await navigator.serviceWorker.register('/service-worker.js');
  } catch (registrationError) {
    console.warn('Service Worker registration attempt failed:', registrationError);
  }

  const registration = await navigator.serviceWorker.ready;
  if (!registration) {
    throw new Error('Service Worker ready state could not be reached');
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

    // Subscribe to push
    console.debug('Subscribing to push manager...');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    console.debug('✓ Successfully subscribed to push manager');

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

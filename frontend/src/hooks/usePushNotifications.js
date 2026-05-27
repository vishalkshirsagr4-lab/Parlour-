import { useState, useEffect, useCallback } from 'react';
import {
  initPushNotifications,
  getPushNotificationStatus,
  togglePushNotifications,
} from '../utils/pushNotifications';

/**
 * Hook for managing push notifications
 * Handles permission requests and subscription management
 */
export const usePushNotifications = () => {
  const [status, setStatus] = useState({
    permission: 'denied',
    isSubscribed: false,
    enabled: false,
    isLoading: true,
    error: null,
  });

  // Check initial status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const pushStatus = await getPushNotificationStatus();
        setStatus((prev) => ({
          ...prev,
          ...pushStatus,
          isLoading: false,
        }));
      } catch (error) {
        setStatus((prev) => ({
          ...prev,
          error: error.message,
          isLoading: false,
        }));
      }
    };

    checkStatus();
  }, []);

  // Request permission and subscribe
  const requestNotifications = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const success = await initPushNotifications();
      if (success) {
        const pushStatus = await getPushNotificationStatus();
        setStatus((prev) => ({
          ...prev,
          ...pushStatus,
          isLoading: false,
        }));
      } else {
        setStatus((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to enable notifications',
        }));
      }
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    }
  }, []);

  // Toggle notifications
  const toggle = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const success = await togglePushNotifications();
      if (success) {
        const pushStatus = await getPushNotificationStatus();
        setStatus((prev) => ({
          ...prev,
          ...pushStatus,
          isLoading: false,
        }));
      } else {
        setStatus((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to update notification status',
        }));
      }
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    }
  }, []);

  return {
    ...status,
    requestNotifications,
    toggle,
  };
};

export default usePushNotifications;

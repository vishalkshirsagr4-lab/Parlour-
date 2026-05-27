import { useEffect, useState } from 'react';
import usePushNotifications from '../../hooks/usePushNotifications';
import toast from 'react-hot-toast';

/**
 * Component for requesting push notification permission
 * Shows a banner asking user to enable notifications
 */
export const NotificationPermissionBanner = () => {
  const { permission, enabled, isLoading, error, requestNotifications } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if already granted or denied
  if (dismissed || permission === 'granted' || permission === 'denied' || isLoading) {
    return null;
  }

  const handleEnable = async () => {
    const success = await requestNotifications();
    if (success) {
      toast.success('Notifications enabled! You\'ll receive appointment updates.');
      setDismissed(true);
    } else {
      toast.error('Failed to enable notifications. Please try again.');
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg shadow-lg p-4 flex items-center justify-between gap-4 z-50 md:max-w-md md:top-6 md:left-auto md:right-6">
      <div>
        <p className="font-semibold text-sm">Enable Notifications?</p>
        <p className="text-xs opacity-90 mt-1">Get updates about your bookings and special offers</p>
        {error ? (
          <p className="text-xs text-amber-100 opacity-90 mt-1">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleEnable}
          className="bg-white text-rose-600 font-semibold px-3 py-1.5 rounded-md text-xs hover:bg-opacity-90 transition"
          disabled={isLoading}
        >
          {isLoading ? 'Enabling...' : 'Enable'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-white opacity-75 hover:opacity-100 transition text-sm font-semibold"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

/**
 * Component for displaying notification status and toggle
 * Useful in settings or profile pages
 */
export const NotificationToggle = () => {
  const { permission, enabled, isLoading, toggle } = usePushNotifications();

  if (permission === 'denied') {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-900">
          📵 Notifications are disabled in your browser settings. Please enable them to receive updates.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div>
        <p className="font-semibold text-gray-900">Push Notifications</p>
        <p className="text-sm text-gray-600 mt-1">
          {enabled ? '✓ Enabled' : '○ Disabled'}
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={isLoading}
        className={`px-4 py-2 rounded-lg font-semibold transition ${
          enabled
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        } disabled:opacity-50`}
      >
        {isLoading ? '...' : enabled ? 'Disable' : 'Enable'}
      </button>
    </div>
  );
};

export default NotificationPermissionBanner;

# Web Push Notifications Setup Guide

This guide walks you through implementing a **Web Push Notification system** for your salon booking app using PWA (Progressive Web App) technology.

## Overview

The system implements:
- **VAPID keys** for authentication between browser and push service
- **Service Worker** for receiving push notifications even when app is closed
- **MongoDB storage** for user push subscriptions
- **Automatic notifications** for booking events (created, confirmed, completed, cancelled)
- **Manual promotional notifications** to target users

## Architecture

```
User Request → Frontend Requests Permission → Service Worker Registers
                      ↓
           User Subscribes to Push API
                      ↓
           Subscription Saved to Backend (MongoDB)
                      ↓
           Booking Event Triggered (admin confirms booking)
                      ↓
           Backend Sends Push via Web Push Library
                      ↓
           Service Worker Receives Push Event
                      ↓
           Browser Shows Native Notification
```

## 1. Backend Setup

### 1.1 Generate VAPID Keys

VAPID keys are required for authentication. Generate them once and save to `.env`:

```bash
# Navigate to backend directory
cd backend

# Run this command to generate VAPID keys:
node -e "const webpush = require('web-push'); const vapid = webpush.generateVAPIDKeys(); console.log('Public Key:', vapid.publicKey); console.log('Private Key:', vapid.privateKey);"
```

Or use this simple script:

```javascript
// generate-vapid.js
import webpush from 'web-push';

const vapid = webpush.generateVAPIDKeys();
console.log('VAPID_PUBLIC_KEY=', vapid.publicKey);
console.log('VAPID_PRIVATE_KEY=', vapid.privateKey);
```

Run it:
```bash
node generate-vapid.js
```

### 1.2 Update `.env` File

Add these variables to your `.env`:

```env
# Web Push Notifications
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
ADMIN_EMAIL=your-email@example.com  # Required by web-push library
```

**⚠️ IMPORTANT:**
- **Never** commit private keys to git
- For production, use environment variables or secrets manager
- Keep VAPID keys secret (especially private key)
- Use the same keys across deployments

### 1.3 Install Dependencies

Already done! Check that `web-push` was added to `package.json`:

```bash
npm install web-push
```

### 1.4 Verify Backend Setup

Test the push configuration:

```bash
node -e "import('./src/config/pushNotifications.js').then(() => console.log('✓ Push config loaded'));"
```

## 2. Database Schema

### PushSubscription Model

A new MongoDB model stores user push subscriptions:

```javascript
// Path: backend/src/models/PushSubscription.js

Fields:
- user: Reference to User
- endpoint: The unique browser push endpoint
- auth: Authentication key from browser
- p256dh: Encryption key from browser
- userAgent: Browser/device info
- isActive: Enable/disable notifications
- lastUsed: Timestamp of last notification
- createdAt/updatedAt: Timestamps
```

**Unique Constraint:** One subscription per user (updated when user subscribes from new device)

## 3. API Endpoints

### Get VAPID Public Key (PUBLIC)
```
GET /api/push/public-key

Response:
{
  "publicKey": "BCxyz..."
}
```

### Subscribe to Push Notifications (PROTECTED)
```
POST /api/push/subscribe

Body:
{
  "endpoint": "https://fcm.googleapis.com/...",
  "auth": "auth_key",
  "p256dh": "p256dh_key"
}

Response:
{
  "message": "Push subscription saved successfully",
  "subscriptionId": "507f1f77bcf86cd799439011"
}
```

### Unsubscribe from Push (PROTECTED)
```
POST /api/push/unsubscribe

Response:
{
  "message": "Unsubscribed from push notifications"
}
```

### Check Subscription Status (PROTECTED)
```
GET /api/push/check

Response:
{
  "hasSubscription": true,
  "subscriptionId": "507f1f77bcf86cd799439011"
}
```

### Update Subscription Status (PROTECTED)
```
PUT /api/push/status

Body:
{
  "isActive": false  // Disable notifications
}

Response:
{
  "message": "Push notifications disabled",
  "subscription": {...}
}
```

## 4. Booking Integration

Push notifications are automatically sent when:

### Booking Created
- Triggered: When user creates a new booking
- Message: "📅 Booking Confirmed - Your appointment for {service} is confirmed for {date}"
- Notification Type: `booking-created`

### Booking Confirmed
- Triggered: Admin confirms the booking
- Message: "✅ Booking Confirmed - Your booking has been confirmed by the salon"
- Notification Type: `booking-confirmed`

### Booking Completed
- Triggered: Admin marks booking as completed
- Message: "🎉 Appointment Completed - Your appointment has been completed"
- Notification Type: `booking-completed`

### Booking Cancelled
- Triggered: Booking is cancelled
- Message: "❌ Booking Cancelled - Your booking has been cancelled"
- Notification Type: `booking-cancelled`

## 5. Frontend Setup

### 5.1 Service Worker Registration

Already handled by existing service worker at `public/service-worker.js` with push event handlers.

### 5.2 Request Notification Permission

The app automatically shows a permission request banner to users. The `NotificationPermissionBanner` component:

1. Checks browser notification permission status
2. Shows banner if permission not yet requested
3. On user click, requests Notification API permission
4. If granted, subscribes to push notifications

### 5.3 Push Notification Utilities

Located at `src/utils/pushNotifications.js`:

```javascript
// Request permission and subscribe
await initPushNotifications();

// Check if subscribed
const isSubscribed = await isPushNotificationSubscribed();

// Unsubscribe
await unsubscribeFromPushNotifications();

// Toggle notifications
await togglePushNotifications();

// Get status
const status = await getPushNotificationStatus();
// Returns: { permission: 'granted'|'denied'|'default', isSubscribed: bool, enabled: bool }
```

### 5.4 usePushNotifications Hook

Use in your components:

```javascript
import usePushNotifications from '@/hooks/usePushNotifications';

function MyComponent() {
  const {
    permission,      // 'granted', 'denied', or 'default'
    isSubscribed,    // boolean
    enabled,         // boolean (permission && subscribed)
    isLoading,       // boolean
    error,           // string or null
    requestNotifications,  // async function
    toggle            // async function to toggle on/off
  } = usePushNotifications();

  return (
    <button onClick={toggle}>
      {enabled ? 'Disable' : 'Enable'} Notifications
    </button>
  );
}
```

### 5.5 NotificationToggle Component

Add to user profile/settings:

```javascript
import { NotificationToggle } from '@/components/notifications/NotificationPermission';

function SettingsPage() {
  return (
    <>
      <NotificationToggle />
    </>
  );
}
```

## 6. Testing Notifications

### 6.1 Local Testing

1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open app:** http://localhost:5173

4. **Request permission:** Click "Enable" on the banner

5. **Create booking:** Make a test booking

6. **Check notification:** You should see browser notification (or check notification center)

### 6.2 Chrome DevTools

1. Open DevTools → Application → Service Workers
2. Check service worker is registered
3. Go to Application → Storage → Notifications
4. Check subscription is stored

### 6.3 Send Test Notification

Use the backend push utility:

```javascript
// In your backend code or Node REPL
import { sendBookingNotification } from './src/config/pushNotifications.js';

const userId = "user_id_here"; // MongoDB User ID
await sendBookingNotification(userId, {
  bookingId: "test-123",
  serviceName: "Haircut",
  date: "2024-01-15"
}, 'created');
```

## 7. Deployment

### 7.1 Vercel Frontend

1. Ensure `vite.config.js` is configured for PWA
2. Push code with service worker
3. Verify HTTPS is enabled (Vercel default)

### 7.2 Render Backend

1. Add environment variables:
   ```
   VAPID_PUBLIC_KEY=your_key
   VAPID_PRIVATE_KEY=your_key
   ADMIN_EMAIL=admin@example.com
   ```

2. Deploy with `npm start`

3. Test push endpoint: `https://your-render-backend.com/api/push/public-key`

### 7.3 MongoDB

No additional setup needed. New `PushSubscription` collection created automatically.

## 8. Troubleshooting

### "VAPID keys not configured" Warning

**Problem:** Push notifications aren't working
**Solution:** 
- Check `.env` file has `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`
- Keys must be valid Base64 strings
- Restart backend server after updating `.env`

### Notifications Not Showing

**Problem:** Subscribed but no notifications received
**Solution:**
1. Check user has notification permission: `Notification.permission === 'granted'`
2. Verify subscription in MongoDB: Check `PushSubscription` collection
3. Check service worker is registered: DevTools → Application → Service Workers
4. Verify backend is sending push: Check server logs for `✓ Push notification sent`

### Browser Says "Blocked by CORS"

**Problem:** Subscription endpoint blocked
**Solution:**
- This is expected! Push endpoints are from Google/Mozilla push services
- CORS doesn't apply to push endpoints (they're handled by browser)
- If you see CORS errors, they're from API calls, not push

### "Subscription expired (410)"

**Problem:** Old subscriptions fail
**Solution:**
- Handled automatically! Subscriptions marked as inactive
- User will need to re-subscribe if they clear browser data
- Normal lifecycle for push subscriptions

## 9. Advanced Features

### 9.1 Promotional Notifications

Send to multiple users:

```javascript
import { sendPromoNotification } from './src/config/pushNotifications.js';

const userIds = ["user1", "user2", "user3"];
await sendPromoNotification(userIds, {
  title: "🎉 Special Offer",
  body: "50% off on all services this weekend!",
  promoId: "promo-123",
  link: "/services"
});
```

### 9.2 Custom Notification Data

Pass custom data in notification:

```javascript
await sendBookingNotification(userId, {
  bookingId: "123",
  serviceName: "Massage",
  date: "2024-01-15"
}, 'confirmed');

// Data automatically includes: type, bookingId, date
// Click on notification takes user to booking
```

### 9.3 Appointment Reminders

Add to a cron job (use node-cron):

```javascript
import cron from 'node-cron';
import { sendBookingNotification } from './src/config/pushNotifications.js';
import Booking from './src/models/Booking.js';

// Every day at 8 AM
cron.schedule('0 8 * * *', async () => {
  // Find bookings for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const bookings = await Booking.find({
    date: { $gte: tomorrow, $lte: tomorrowEnd }
  }).populate('user service');

  for (const booking of bookings) {
    await sendBookingNotification(booking.user._id, {
      bookingId: booking._id,
      serviceName: booking.service.title,
      date: booking.date.toLocaleDateString()
    }, 'reminder');
  }
});
```

## 10. Security Considerations

✅ **Implemented:**
- VAPID keys for authentication
- Encrypted push subscriptions in database
- User authentication required for subscribe/unsubscribe
- HTTPS only (browser requirement)
- One subscription per user

📋 **Best Practices:**
- Store VAPID private key securely (use secrets manager in production)
- Validate all push notification data on backend
- Rate limit push API endpoints
- Monitor failed push attempts (410 errors)
- Allow users to disable notifications anytime

## 11. Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | ✅ | ✅ (Android) |
| Firefox | ✅ | ✅ (Android) |
| Safari | ⚠️ (iOS 16.4+) | ❌ (iOS < 16.4) |
| Edge | ✅ | ✅ (Android) |
| Opera | ✅ | ✅ (Android) |

## 12. Next Steps

1. ✅ Install web-push
2. ✅ Generate VAPID keys
3. ✅ Add to .env
4. ✅ Test locally
5. ✅ Deploy to Vercel/Render
6. ✅ Monitor in production

## Support & Resources

- [MDN Web Docs - Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Web Push Book](https://web-push-book.gauntface.com/)
- [web-push npm](https://github.com/web-push-libs/web-push)
- [VAPID Spec](https://tools.ietf.org/html/rfc8292)

---

**Questions?** Refer to the inline code comments in:
- `backend/src/config/pushNotifications.js`
- `backend/src/controllers/pushController.js`
- `frontend/src/utils/pushNotifications.js`
- `frontend/src/hooks/usePushNotifications.js`

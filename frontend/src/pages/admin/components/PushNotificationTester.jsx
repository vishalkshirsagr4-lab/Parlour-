import { useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../api/apiClient';

/**
 * Admin component for testing push notifications
 * Add to AdminDashboard or create separate admin page
 */
export const PushNotificationTester = () => {
  const [testFormData, setTestFormData] = useState({
    userId: '',
    title: '📬 Test Notification',
    body: 'This is a test notification',
  });

  const [promoFormData, setPromoFormData] = useState({
    userIds: '',
    title: '🎉 Special Offer',
    body: 'Check out our latest promotions',
    link: '/',
  });

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Send test notification
  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testFormData.userId.trim()) {
      toast.error('Please enter a User ID');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/push/admin/test', {
        userId: testFormData.userId,
        title: testFormData.title,
        body: testFormData.body,
      });
      toast.success('Test notification sent!');
      setTestFormData({
        userId: '',
        title: '📬 Test Notification',
        body: 'This is a test notification',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  // Send promotional notification
  const handleSendPromo = async (e) => {
    e.preventDefault();
    if (!promoFormData.userIds.trim()) {
      toast.error('Please enter User IDs (comma-separated)');
      return;
    }

    const userIds = promoFormData.userIds
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id);

    if (userIds.length === 0) {
      toast.error('No valid User IDs found');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/push/admin/promotional', {
        userIds,
        title: promoFormData.title,
        body: promoFormData.body,
        link: promoFormData.link,
      });
      toast.success(`Promotional notification sent to ${userIds.length} users!`);
      setPromoFormData({
        userIds: '',
        title: '🎉 Special Offer',
        body: 'Check out our latest promotions',
        link: '/',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send promotions');
    } finally {
      setLoading(false);
    }
  };

  // Get statistics
  const handleGetStats = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/push/admin/stats');
      setStats(response.data.stats);
      toast.success('Statistics loaded');
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-900">Push Notification Testing</h2>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <p className="text-sm text-blue-600 font-semibold">Total</p>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div>
            <p className="text-sm text-green-600 font-semibold">Active</p>
            <p className="text-2xl font-bold text-green-900">{stats.active}</p>
          </div>
          <div>
            <p className="text-sm text-orange-600 font-semibold">Inactive</p>
            <p className="text-2xl font-bold text-orange-900">{stats.inactive}</p>
          </div>
          <div>
            <p className="text-sm text-purple-600 font-semibold">Last 7 Days</p>
            <p className="text-2xl font-bold text-purple-900">{stats.recentlyUsed}</p>
          </div>
        </div>
      )}

      <button
        onClick={handleGetStats}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Load Statistics'}
      </button>

      {/* Test Single Notification */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Test Notification</h3>
        <form onSubmit={handleSendTest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID (MongoDB ObjectId)
            </label>
            <input
              type="text"
              value={testFormData.userId}
              onChange={(e) =>
                setTestFormData({ ...testFormData, userId: e.target.value })
              }
              placeholder="e.g., 507f1f77bcf86cd799439011"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste the User ID from MongoDB or admin dashboard
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={testFormData.title}
              onChange={(e) =>
                setTestFormData({ ...testFormData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body
            </label>
            <textarea
              value={testFormData.body}
              onChange={(e) =>
                setTestFormData({ ...testFormData, body: e.target.value })
              }
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Test Notification'}
          </button>
        </form>
      </div>

      {/* Send Promotional Notification */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Send Promotional Notification
        </h3>
        <form onSubmit={handleSendPromo} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User IDs (comma-separated)
            </label>
            <textarea
              value={promoFormData.userIds}
              onChange={(e) =>
                setPromoFormData({ ...promoFormData, userIds: e.target.value })
              }
              placeholder="507f1f77bcf86cd799439011, 507f1f77bcf86cd799439012, ..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste multiple User IDs separated by commas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={promoFormData.title}
              onChange={(e) =>
                setPromoFormData({ ...promoFormData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={promoFormData.body}
              onChange={(e) =>
                setPromoFormData({ ...promoFormData, body: e.target.value })
              }
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link (when notification is clicked)
            </label>
            <input
              type="text"
              value={promoFormData.link}
              onChange={(e) =>
                setPromoFormData({ ...promoFormData, link: e.target.value })
              }
              placeholder="e.g., /services or /bookings"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send to Multiple Users'}
          </button>
        </form>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="font-semibold text-amber-900 mb-2">ℹ️ How to Test</h4>
        <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
          <li>User must have notification permission enabled</li>
          <li>User must be subscribed to push notifications</li>
          <li>Find User ID from MongoDB or admin users list</li>
          <li>Send test notification</li>
          <li>Notification should appear in browser notification tray</li>
          <li>If app is closed, system shows native notification</li>
        </ol>
      </div>
    </div>
  );
};

export default PushNotificationTester;

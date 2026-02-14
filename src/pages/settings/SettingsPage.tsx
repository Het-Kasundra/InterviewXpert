
import { useState, useEffect } from 'react';
import { useSession } from '../../contexts/SessionProvider';
import { supabase } from '../../lib/supabaseClient';

export const SettingsPage = () => {
  const { user, profile, refreshProfile } = useSession();
  const [formData, setFormData] = useState({
    full_name: '',
    timezone: '',
    notification_email: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        timezone: profile.timezone || '',
        notification_email: profile.notification_email,
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          timezone: formData.timezone,
          notification_email: formData.notification_email,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account preferences and profile information
        </p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h2>
        
        {message.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
              : 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
              >
                <option value="">Select timezone</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Shanghai">Shanghai (CST)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Email cannot be changed. Contact support if you need to update your email.
            </p>
          </div>

          <div className="flex items-start">
            <input
              id="notification_email"
              name="notification_email"
              type="checkbox"
              checked={formData.notification_email}
              onChange={handleInputChange}
              className="mt-1 mr-3"
            />
            <div>
              <label htmlFor="notification_email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Notifications
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive email notifications about interview reminders and performance updates
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 
                       disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Account Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Change Password</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Update your account password</p>
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium whitespace-nowrap">
              Change Password
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium whitespace-nowrap">
              Enable 2FA
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div>
              <h3 className="font-medium text-red-900 dark:text-red-400">Delete Account</h3>
              <p className="text-sm text-red-600 dark:text-red-400">Permanently delete your account and all data</p>
            </div>
            <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium whitespace-nowrap">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Privacy & Data</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Download Your Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Export all your interview data and analytics</p>
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium whitespace-nowrap">
              Download
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Data Retention</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage how long we keep your interview recordings</p>
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium whitespace-nowrap">
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

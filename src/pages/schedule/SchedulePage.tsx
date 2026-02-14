
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useSession } from '../../contexts/SessionProvider';


interface ScheduleFormData {
  title: string;
  company: string;
  role: string;
  interviewType: 'technical' | 'behavioral' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  notes: string;
}

export const SchedulePage = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<ScheduleFormData>({
    title: '',
    company: '',
    role: '',
    interviewType: 'technical',
    difficulty: 'medium',
    scheduledDate: '',
    scheduledTime: '',
    duration: 30,
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_interviews')
        .insert({
          user_id: session.user.id,
          title: formData.title,
          company: formData.company,
          role: formData.role,
          interview_type: formData.interviewType,
          difficulty: formData.difficulty,
          scheduled_date: formData.scheduledDate,
          scheduled_time: formData.scheduledTime,
          duration: formData.duration,
          notes: formData.notes
        })
        .select()
        .single();

      if (error) throw error;

      setNotification({
        type: 'success',
        message: 'Interview scheduled successfully! You can view it in your dashboard.'
      });

      // Reset form
      setFormData({
        title: '',
        company: '',
        role: '',
        interviewType: 'technical',
        difficulty: 'medium',
        scheduledDate: '',
        scheduledTime: '',
        duration: 30,
        notes: ''
      });

      setShowForm(false);

      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);

    } catch (error) {
      console.error('Error scheduling interview:', error);
      setNotification({
        type: 'error',
        message: 'Failed to schedule interview. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Schedule Interview</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Plan your next mock interview session
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg border ${notification.type === 'success'
          ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
          : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
          }`}>
          <div className="flex items-center">
            <i className={`${notification.type === 'success' ? 'ri-check-circle-line' : 'ri-error-warning-line'} text-xl mr-3`} />
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-current hover:opacity-70"
            >
              <i className="ri-close-line text-xl" />
            </button>
          </div>
        </div>
      )}

      {!showForm ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center py-12">
            <i className="ri-calendar-line text-6xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Schedule your interview</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Choose your preferred time and interview type
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 whitespace-nowrap transition-colors"
            >
              Schedule Now
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule New Interview</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <i className="ri-close-line text-2xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interview Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interview Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Frontend Developer Interview"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g., Google, Microsoft"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role *
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Senior Frontend Developer"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Interview Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interview Type *
                </label>
                <select
                  name="interviewType"
                  value={formData.interviewType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-8"
                >
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty *
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-8"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (minutes) *
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-8"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  required
                  min={getTodayDate()}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                placeholder="Any additional notes or preparation reminders..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Scheduling...
                  </div>
                ) : (
                  'Schedule Interview'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <i className="ri-play-circle-line text-2xl text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Quick Practice</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Start a 15-min session</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/interviews/start')}
            className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            Start Now
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <i className="ri-history-line text-2xl text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Past Interviews</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Review your progress</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/interviews')}
            className="w-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 py-2 rounded-lg font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            View History
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <i className="ri-dashboard-line text-2xl text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Dashboard</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View your stats</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 py-2 rounded-lg font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

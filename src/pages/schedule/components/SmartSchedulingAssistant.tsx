import { useState, useEffect } from 'react';
import { useSession } from '../../../contexts/SessionProvider';
import { suggestOptimalTimes, generateStudyPlan, getSmartReminders, analyzeScheduleConflicts, type OptimalTimeSuggestion, type StudyPlan, type TimeSlot } from '../../../lib/aiSchedulingService';
import { supabase } from '../../../lib/supabaseClient';
import { motion } from 'framer-motion';

export const SmartSchedulingAssistant = () => {
  const { user } = useSession();
  const [availableHours, setAvailableHours] = useState(10);
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);
  const [timeSuggestions, setTimeSuggestions] = useState<OptimalTimeSuggestion[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'times' | 'plan' | 'reminders'>('times');

  useEffect(() => {
    if (user) {
      loadReminders();
    }
  }, [user]);

  const loadReminders = async () => {
    if (!user) return;

    try {
      const { data: scheduled } = await supabase
        .from('scheduled_interviews')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })
        .limit(10);

      if (scheduled && scheduled.length > 0) {
        const upcomingSessions = scheduled.map(s => ({
          date: s.scheduled_date,
          type: s.interview_type,
          title: s.title || `${s.role} Interview`,
        }));

        const smartReminders = await getSmartReminders(user.id, upcomingSessions);
        setReminders(smartReminders);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const handleGetTimeSuggestions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user performance data
      const { data: interviews } = await supabase
        .from('interviews')
        .select('overall_score, started_at')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(10);

      const recentScores = interviews?.map(i => i.overall_score || 0).filter(s => s > 0) || [];

      const suggestions = await suggestOptimalTimes({
        userId: user.id,
        availableHoursPerWeek: availableHours,
        preferredTimes: preferredTimes.length > 0 ? preferredTimes : undefined,
        performanceData: {
          weakAreas: [],
          strongAreas: [],
          recentScores,
        },
      });

      setTimeSuggestions(suggestions);
      setActiveTab('times');
    } catch (error) {
      console.error('Error getting time suggestions:', error);
      alert('Failed to get time suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStudyPlan = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: interviews } = await supabase
        .from('interviews')
        .select('overall_score, skills')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(10);

      const recentScores = interviews?.map(i => i.overall_score || 0).filter(s => s > 0) || [];
      const allSkills = interviews?.flatMap(i => i.skills || []) || [];
      const weakAreas: string[] = [];

      const plan = await generateStudyPlan({
        userId: user.id,
        availableHoursPerWeek: availableHours,
        preferredTimes: preferredTimes.length > 0 ? preferredTimes : undefined,
        goals: ['Improve interview skills', 'Build confidence'],
        performanceData: {
          weakAreas,
          strongAreas: [...new Set(allSkills)],
          recentScores,
        },
      });

      setStudyPlan(plan);
      setActiveTab('plan');
    } catch (error) {
      console.error('Error generating study plan:', error);
      alert('Failed to generate study plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTimeSlotColor = (type: string) => {
    switch (type) {
      case 'optimal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Smart Scheduling Assistant</h3>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Available Hours/Week
          </label>
          <input
            type="number"
            value={availableHours}
            onChange={(e) => setAvailableHours(parseInt(e.target.value) || 10)}
            min="1"
            max="40"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preferred Times
          </label>
          <div className="flex flex-wrap gap-2">
            {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
              <button
                key={time}
                onClick={() => {
                  setPreferredTimes(prev =>
                    prev.includes(time)
                      ? prev.filter(t => t !== time)
                      : [...prev, time]
                  );
                }}
                className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                  preferredTimes.includes(time)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleGetTimeSuggestions}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Get Time Suggestions
        </button>
        <button
          onClick={handleGenerateStudyPlan}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Generate Study Plan
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav className="flex -mb-px">
          {[
            { id: 'times', label: 'Optimal Times', icon: '⏰' },
            { id: 'plan', label: 'Study Plan', icon: '📚' },
            { id: 'reminders', label: 'Reminders', icon: '🔔' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-2 text-center font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Analyzing...</p>
        </div>
      )}

      {!loading && activeTab === 'times' && timeSuggestions.length > 0 && (
        <div className="space-y-4">
          {timeSuggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(suggestion.date)}
                </h4>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Confidence: {Math.round(suggestion.confidence * 100)}%
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{suggestion.reason}</p>
              <div className="space-y-2">
                {suggestion.timeSlots.map((slot, slotIndex) => (
                  <div
                    key={slotIndex}
                    className={`p-3 rounded-lg border ${getTimeSlotColor(slot.type)}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                      <span className="text-sm">Score: {slot.score}/100</span>
                    </div>
                    <p className="text-sm mt-1">{slot.reason}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && activeTab === 'plan' && studyPlan && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Study Plan Overview</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-600 dark:text-blue-400 font-medium">Duration:</span>
                <p className="text-blue-900 dark:text-blue-200">{studyPlan.duration} days</p>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-400 font-medium">Total Hours:</span>
                <p className="text-blue-900 dark:text-blue-200">{studyPlan.totalHours} hours</p>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-400 font-medium">Sessions:</span>
                <p className="text-blue-900 dark:text-blue-200">{studyPlan.sessions.length}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {studyPlan.sessions.map((session) => (
              <div
                key={session.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {formatDate(session.date)} at {session.startTime}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{session.focus}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    session.priority === 'high' ? 'bg-red-100 text-red-800' :
                    session.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {session.priority}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>⏱️ {session.duration} min</span>
                  <span>📚 {session.type}</span>
                  {session.topics.length > 0 && (
                    <span>🎯 {session.topics[0]}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && activeTab === 'reminders' && (
        <div className="space-y-3">
          {reminders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No upcoming sessions to remind you about</p>
            </div>
          ) : (
            reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-200">{reminder.message}</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                      {new Date(reminder.scheduledFor).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    reminder.priority === 'high' ? 'bg-red-100 text-red-800' :
                    reminder.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {reminder.priority}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!loading && activeTab === 'times' && timeSuggestions.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Click "Get Time Suggestions" to see optimal practice times</p>
        </div>
      )}

      {!loading && activeTab === 'plan' && !studyPlan && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Click "Generate Study Plan" to create a personalized study schedule</p>
        </div>
      )}
    </div>
  );
};


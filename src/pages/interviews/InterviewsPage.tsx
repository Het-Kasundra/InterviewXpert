
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../contexts/SessionProvider';
import { supabase } from '../../lib/supabaseClient';

interface Interview {
  id: string;
  role: string;
  skills: string[];
  mode: string;
  difficulty: string;
  ended_at: string;
  overall_score: number;
}

export const InterviewsPage = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: '',
    level: '',
    type: '',
    dateRange: '',
    minScore: ''
  });

  useEffect(() => {
    if (session?.user) {
      fetchInterviews();
    }
  }, [session]);

  const fetchInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('id, role, skills, mode, difficulty, ended_at, overall_score')
        .eq('user_id', session!.user.id)
        .order('ended_at', { ascending: false });

      if (error) throw error;
      setInterviews(data || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    if (filters.role && !interview.role.toLowerCase().includes(filters.role.toLowerCase())) return false;
    if (filters.level && interview.difficulty !== filters.level) return false;
    if (filters.minScore && interview.overall_score < parseInt(filters.minScore)) return false;
    
    if (filters.dateRange) {
      const interviewDate = new Date(interview.ended_at);
      const now = new Date();
      const daysAgo = parseInt(filters.dateRange);
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      if (interviewDate < cutoffDate) return false;
    }
    
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'voice': return 'ri-mic-line';
      case 'video': return 'ri-video-line';
      default: return 'ri-keyboard-line';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Interviews</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage your interview sessions
          </p>
        </div>
        <button 
          onClick={() => navigate('/interviews/start')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 whitespace-nowrap"
        >
          <i className="ri-add-line mr-2" />
          New Interview
        </button>
      </div>

      {interviews.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <input
                type="text"
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                placeholder="Search roles..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
              <select
                value={filters.level}
                onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm pr-8"
              >
                <option value="">All levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm pr-8"
              >
                <option value="">All time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Score</label>
              <input
                type="number"
                value={filters.minScore}
                onChange={(e) => setFilters(prev => ({ ...prev, minScore: e.target.value }))}
                placeholder="0-100"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ role: '', level: '', type: '', dateRange: '', minScore: '' })}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-160 text-sm whitespace-nowrap"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredInterviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center py-12">
            <i className="ri-mic-line text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {interviews.length === 0 ? 'No interviews yet' : 'No interviews match your filters'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {interviews.length === 0 
                ? 'Start your first mock interview to begin practicing'
                : 'Try adjusting your filters to see more results'
              }
            </p>
            <button 
              onClick={() => navigate('/interviews/start')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 whitespace-nowrap"
            >
              Start First Interview
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredInterviews.map((interview) => (
            <div
              key={interview.id}
              onClick={() => navigate(`/interviews/${interview.id}`)}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-160 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {interview.role}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      interview.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                      interview.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {interview.difficulty}
                    </span>
                    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                      <i className={getModeIcon(interview.mode)} />
                      <span className="text-xs capitalize">{interview.mode}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      <i className="ri-calendar-line mr-1" />
                      {new Date(interview.ended_at).toLocaleDateString()}
                    </span>
                    <span>
                      <i className="ri-time-line mr-1" />
                      {new Date(interview.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {interview.skills && interview.skills.length > 0 && (
                      <span>
                        <i className="ri-code-line mr-1" />
                        {interview.skills.slice(0, 2).join(', ')}
                        {interview.skills.length > 2 && ` +${interview.skills.length - 2} more`}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(interview.overall_score)}`}>
                      {interview.overall_score}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Overall Score
                    </div>
                  </div>
                  <i className="ri-arrow-right-line text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {interviews.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredInterviews.length} of {interviews.length} interviews
          </p>
        </div>
      )}
    </div>
  );
};

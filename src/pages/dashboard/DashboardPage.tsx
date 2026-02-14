
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useSession } from '../../contexts/SessionProvider';
import { recommendTopics, type LearningPath } from '../../lib/aiLearningService';

interface ScheduledInterview {
  id: string;
  title: string;
  company: string;
  role: string;
  interview_type: string;
  difficulty: string;
  scheduled_date: string;
  scheduled_time: string;
  duration: number;
  status: string;
  created_at: string;
}

interface Interview {
  id: string;
  roles: string[];
  difficulty: string;
  overall_score: number;
  started_at: string;
}

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const [scheduledInterviews, setScheduledInterviews] = useState<ScheduledInterview[]>([]);
  const [recentInterviews, setRecentInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    upcomingScheduled: 0,
    improvementRate: 0
  });
  const [recommendedTopics, setRecommendedTopics] = useState<string[]>([]);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch scheduled interviews
      const { data: scheduled, error: scheduledError } = await supabase
        .from('scheduled_interviews')
        .select('*')
        .eq('user_id', session?.user?.id)
        .eq('status', 'scheduled')
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })
        .limit(5);

      if (scheduledError) throw scheduledError;

      // Fetch recent completed interviews
      const { data: recent, error: recentError } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('started_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      // Fetch all interviews for stats
      const { data: allInterviews, error: allError } = await supabase
        .from('interviews')
        .select('overall_score, started_at')
        .eq('user_id', session?.user?.id);

      if (allError) throw allError;

      // Calculate stats
      const totalInterviews = allInterviews?.length || 0;
      const averageScore = totalInterviews > 0 
        ? Math.round(allInterviews.reduce((sum, interview) => sum + (interview.overall_score || 0), 0) / totalInterviews)
        : 0;
      
      const upcomingScheduled = scheduled?.length || 0;
      
      // Calculate improvement rate (last 5 vs previous 5)
      let improvementRate = 0;
      if (allInterviews && allInterviews.length >= 2) {
        const sortedInterviews = allInterviews.sort((a, b) => 
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
        );
        const recent5 = sortedInterviews.slice(0, 5);
        const previous5 = sortedInterviews.slice(5, 10);
        
        if (recent5.length > 0 && previous5.length > 0) {
          const recentAvg = recent5.reduce((sum, i) => sum + (i.overall_score || 0), 0) / recent5.length;
          const previousAvg = previous5.reduce((sum, i) => sum + (i.overall_score || 0), 0) / previous5.length;
          improvementRate = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
        }
      }

      setScheduledInterviews(scheduled || []);
      setRecentInterviews(recent || []);
      setStats({
        totalInterviews,
        averageScore,
        upcomingScheduled,
        improvementRate
      });

      // Identify weak areas and get topic recommendations
      if (allInterviews && allInterviews.length > 0 && recent && recent.length > 0) {
        const weakAreasSet = new Set<string>();
        recent.forEach(interview => {
          if (interview.skills && Array.isArray(interview.skills)) {
            interview.skills.forEach((skill: string) => {
              // Find interviews with this skill that scored low
              const skillInterviews = allInterviews.filter(i => 
                i.skills && Array.isArray(i.skills) && i.skills.includes(skill)
              );
              if (skillInterviews.length > 0) {
                const avgScore = skillInterviews.reduce((sum, i) => sum + (i.overall_score || 0), 0) / skillInterviews.length;
                if (avgScore < 70) {
                  weakAreasSet.add(skill);
                }
              }
            });
          }
        });
        
        const weakAreasArray = Array.from(weakAreasSet).slice(0, 5);
        setWeakAreas(weakAreasArray);
        
        // Get AI topic recommendations
        if (weakAreasArray.length > 0) {
          try {
            const topics = await recommendTopics(weakAreasArray, 'General');
            setRecommendedTopics(topics);
          } catch (error) {
            console.error('Error getting topic recommendations:', error);
          }
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back! Here's your interview progress overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <i className="ri-file-list-3-line text-2xl text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Interviews</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInterviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <i className="ri-trophy-line text-2xl text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>{stats.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <i className="ri-calendar-check-line text-2xl text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingScheduled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <i className="ri-trending-up-line text-2xl text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Improvement</p>
              <p className={`text-2xl font-bold ${stats.improvementRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats.improvementRate > 0 ? '+' : ''}{stats.improvementRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Scheduled Interviews */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Interviews</h2>
            <button
              onClick={() => navigate('/schedule')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Schedule New
            </button>
          </div>

          {scheduledInterviews.length === 0 ? (
            <div className="text-center py-8">
              <i className="ri-calendar-line text-4xl text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No upcoming interviews scheduled</p>
              <button
                onClick={() => navigate('/schedule')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Schedule Your First Interview
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledInterviews.map((interview) => (
                <div key={interview.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{interview.title}</h3>
                      {interview.company && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{interview.company}</p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400">{interview.role}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(interview.difficulty)}`}>
                          {interview.difficulty}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {interview.duration} min
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(interview.scheduled_date)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatTime(interview.scheduled_time)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Interview Results */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Results</h2>
            <button
              onClick={() => navigate('/interviews')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View All
            </button>
          </div>

          {recentInterviews.length === 0 ? (
            <div className="text-center py-8">
              <i className="ri-file-list-3-line text-4xl text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No interviews completed yet</p>
              <button
                onClick={() => navigate('/interviews/start')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Start Your First Interview
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentInterviews.map((interview) => (
                <div 
                  key={interview.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => navigate(`/interviews/${interview.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {interview.roles?.join(', ') || 'Interview'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(interview.started_at)}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getDifficultyColor(interview.difficulty)}`}>
                        {interview.difficulty}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(interview.overall_score || 0)}`}>
                        {interview.overall_score || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center mb-4">
            <i className="ri-play-circle-line text-3xl mr-4" />
            <div>
              <h3 className="text-lg font-semibold">Quick Practice</h3>
              <p className="text-blue-100">Start a 15-minute session</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/interviews/start')}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg font-medium transition-colors"
          >
            Start Now
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center mb-4">
            <i className="ri-calendar-line text-3xl mr-4" />
            <div>
              <h3 className="text-lg font-semibold">Schedule Interview</h3>
              <p className="text-green-100">Plan your next session</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/schedule')}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg font-medium transition-colors"
          >
            Schedule
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center mb-4">
            <i className="ri-bar-chart-line text-3xl mr-4" />
            <div>
              <h3 className="text-lg font-semibold">View Analytics</h3>
              <p className="text-purple-100">Track your progress</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/analytics')}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg font-medium transition-colors"
          >
            View Stats
          </button>
        </div>
      </div>

      {/* Learning Path Recommendations */}
      {(weakAreas.length > 0 || recommendedTopics.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              <i className="ri-roadmap-line text-blue-600 mr-2" />
              Personalized Learning Recommendations
            </h2>
            <button
              onClick={() => navigate('/skills')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
            >
              View Full Path →
            </button>
          </div>
          
          {weakAreas.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Areas to Focus On:
              </p>
              <div className="flex flex-wrap gap-2">
                {weakAreas.map((area, index) => (
                  <span key={index} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {recommendedTopics.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recommended Topics to Study:
              </p>
              <div className="flex flex-wrap gap-2">
                {recommendedTopics.slice(0, 8).map((topic, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                    {topic}
                  </span>
                ))}
              </div>
              <button
                onClick={() => navigate('/skills')}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center"
              >
                Generate Full Learning Path →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

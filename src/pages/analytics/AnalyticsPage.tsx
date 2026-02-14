
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useSession } from '../../contexts/SessionProvider';
import { OverviewTab } from './components/OverviewTab';
import { InterviewTab } from './components/InterviewTab';
import { AdditionalSkillsTab } from './components/AdditionalSkillsTab';
import { ReportsTab } from './components/ReportsTab';
import { InsightsTab } from './components/InsightsTab';

export const AnalyticsPage = () => {
  const { user } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    interviews: [],
    additionalSkills: [],
    overallStats: {
      avgInterviewScore: 0,
      avgSkillsScore: 0,
      totalXP: 0,
      streakDays: 0,
      improvementPercent: 0
    }
  });

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch interviews data
      const { data: interviews, error: interviewsError } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', user?.id)
        .order('started_at', { ascending: false });

      if (interviewsError) {
        console.error('Error fetching interviews:', interviewsError);
      }

      // Fetch additional skills data
      const { data: additionalSkills, error: skillsError } = await supabase
        .from('additional_skills_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('started_at', { ascending: false });

      if (skillsError) {
        console.error('Error fetching additional skills:', skillsError);
      }

      // Calculate overall statistics
      const interviewScores = (interviews || []).map(i => i.overall_score || 0).filter(score => score > 0);
      const skillScores = (additionalSkills || []).map(s => s.overall_score || 0).filter(score => score > 0);

      const avgInterviewScore = interviewScores.length > 0 
        ? interviewScores.reduce((sum, score) => sum + score, 0) / interviewScores.length 
        : 0;

      const avgSkillsScore = skillScores.length > 0 
        ? skillScores.reduce((sum, score) => sum + score, 0) / skillScores.length 
        : 0;

      // Calculate improvement percentage
      let improvementPercent = 0;
      if (interviewScores.length >= 2) {
        const firstScore = interviewScores[interviewScores.length - 1];
        const latestScore = interviewScores[0];
        improvementPercent = ((latestScore - firstScore) / firstScore) * 100;
      }

      // Calculate total XP (simplified calculation)
      const totalXP = (interviews || []).length * 50 + (additionalSkills || []).length * 30;

      // Calculate streak days (simplified - based on recent activity)
      const streakDays = calculateStreakDays([...(interviews || []), ...(additionalSkills || [])]);

      setData({
        interviews: interviews || [],
        additionalSkills: additionalSkills || [],
        overallStats: {
          avgInterviewScore,
          avgSkillsScore,
          totalXP,
          streakDays,
          improvementPercent
        }
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreakDays = (allSessions: any[]) => {
    if (allSessions.length === 0) return 0;

    // Sort sessions by date
    const sortedSessions = allSessions
      .map(session => new Date(session.started_at))
      .sort((a, b) => b.getTime() - a.getTime());

    let streakDays = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if there's activity today or yesterday
    const latestSession = sortedSessions[0];
    const daysDiff = Math.floor((currentDate.getTime() - latestSession.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) return 0; // No recent activity

    // Count consecutive days
    const uniqueDates = [...new Set(sortedSessions.map(date => date.toDateString()))];
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const sessionDate = new Date(uniqueDates[i]);
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (sessionDate.toDateString() === expectedDate.toDateString()) {
        streakDays++;
      } else {
        break;
      }
    }

    return streakDays;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { id: 'interview', label: 'Interview', icon: 'ri-mic-line' },
    { id: 'skills', label: 'Additional Skills', icon: 'ri-star-line' },
    { id: 'insights', label: 'AI Insights', icon: 'ri-brain-line' },
    { id: 'reports', label: 'Reports', icon: 'ri-file-chart-line' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-96 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto animate-pulse" />
          </div>

          {/* Tabs Skeleton */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4 animate-pulse" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2 animate-pulse" />
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Your Growth Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Track your progress and unlock your potential
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-160 whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              <i className={`${tab.icon} text-lg`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300 ease-in-out">
          {activeTab === 'overview' && <OverviewTab data={data} />}
          {activeTab === 'interview' && <InterviewTab data={data.interviews} />}
          {activeTab === 'skills' && <AdditionalSkillsTab data={data.additionalSkills} />}
          {activeTab === 'insights' && <InsightsTab interviews={data.interviews} skills={data.additionalSkills} />}
          {activeTab === 'reports' && <ReportsTab data={data} />}
        </div>
      </div>
    </div>
  );
};

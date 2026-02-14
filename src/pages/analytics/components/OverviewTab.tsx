
import { useState, useEffect } from 'react';

interface OverviewTabProps {
  data: {
    interviews: any[];
    additionalSkills: any[];
    overallStats: {
      avgInterviewScore: number;
      avgSkillsScore: number;
      totalXP: number;
      streakDays: number;
      improvementPercent: number;
    };
  };
}

export const OverviewTab = ({ data }: OverviewTabProps) => {
  const [motivationalMessage, setMotivationalMessage] = useState('');
  
  const messages = [
    "Progress, not perfection! 🚀",
    "Every answer counts! 💪",
    "You're building greatness! ⭐",
    "Keep pushing forward! 🔥",
    "Excellence is a habit! 🎯"
  ];

  useEffect(() => {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMotivationalMessage(randomMessage);
  }, []);

  const { overallStats } = data;

  const statCards = [
    {
      title: 'Interview Score',
      value: `${overallStats.avgInterviewScore.toFixed(1)}%`,
      icon: 'ri-mic-line',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      trend: overallStats.improvementPercent > 0 ? '+' + overallStats.improvementPercent.toFixed(1) + '%' : overallStats.improvementPercent.toFixed(1) + '%'
    },
    {
      title: 'Skills Score',
      value: `${overallStats.avgSkillsScore.toFixed(1)}%`,
      icon: 'ri-star-line',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      trend: '+12.3%'
    },
    {
      title: 'Total XP',
      value: overallStats.totalXP.toLocaleString(),
      icon: 'ri-trophy-line',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      trend: '+' + (data.interviews.length * 50 + data.additionalSkills.length * 30)
    },
    {
      title: 'Streak Days',
      value: overallStats.streakDays.toString(),
      icon: 'ri-fire-line',
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
      trend: overallStats.streakDays > 0 ? '🔥 Active' : 'Start today!'
    }
  ];

  const recentActivity = [
    ...data.interviews.slice(0, 3).map(interview => ({
      type: 'interview',
      title: `${interview.role || 'Technical'} Interview`,
      score: interview.overall_score,
      date: new Date(interview.started_at).toLocaleDateString(),
      icon: 'ri-mic-line',
      color: 'text-blue-600'
    })),
    ...data.additionalSkills.slice(0, 3).map(skill => ({
      type: 'skill',
      title: `${skill.domains?.[0] || 'Skills'} Assessment`,
      score: skill.overall_score,
      date: new Date(skill.started_at).toLocaleDateString(),
      icon: 'ri-star-line',
      color: 'text-yellow-600'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Motivational Header */}
      <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-yellow-50 dark:from-blue-900/20 dark:to-yellow-900/20 rounded-2xl border border-blue-200 dark:border-blue-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {motivationalMessage}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {overallStats.streakDays > 0 
            ? `🔥 You've been consistent for ${overallStats.streakDays} days!`
            : "Ready to start your learning streak? Let's go!"
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-160 hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <i className={`${stat.icon} text-xl ${stat.textColor}`} />
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trend</div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {stat.trend}
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </h3>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
            </div>

            {/* Mini sparkline effect */}
            <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(100, (parseFloat(stat.value) || 50))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Performance Overview Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Combined Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <i className="ri-line-chart-line text-blue-600" />
            Performance Trends
          </h3>
          
          <div className="space-y-6">
            {/* Interview Performance - Enhanced */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Interview Performance
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {overallStats.avgInterviewScore.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-full transition-all duration-1000 ease-out relative shadow-lg"
                  style={{ width: `${Math.min(100, overallStats.avgInterviewScore)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              </div>
            </div>

            {/* Skills Performance - Enhanced */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Additional Skills
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                    {overallStats.avgSkillsScore.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-orange-600 rounded-full transition-all duration-1000 ease-out relative shadow-lg"
                  style={{ width: `${Math.min(100, overallStats.avgSkillsScore)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              </div>
            </div>

            {/* XP Progress - Enhanced */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    XP Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {overallStats.totalXP.toLocaleString()} XP
                  </span>
                </div>
              </div>
              <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-pink-600 rounded-full transition-all duration-1000 ease-out relative shadow-lg"
                  style={{ width: `${Math.min(100, (overallStats.totalXP / 1000) * 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h3>
          
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <i className={`${activity.icon} ${activity.color} text-sm`} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {activity.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {activity.score?.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <i className="ri-calendar-line text-4xl text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  No recent activity. Start practicing to see your progress!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Achievement Badges
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'First Steps', icon: 'ri-footprint-line', earned: data.interviews.length > 0 || data.additionalSkills.length > 0 },
            { name: 'Streak Master', icon: 'ri-fire-line', earned: overallStats.streakDays >= 7 },
            { name: 'High Scorer', icon: 'ri-trophy-line', earned: overallStats.avgInterviewScore >= 80 },
            { name: 'Skill Explorer', icon: 'ri-compass-line', earned: data.additionalSkills.length >= 3 },
            { name: 'Consistent', icon: 'ri-calendar-check-line', earned: overallStats.streakDays >= 14 },
            { name: 'Expert Level', icon: 'ri-star-line', earned: overallStats.avgSkillsScore >= 90 }
          ].map((badge, index) => (
            <div
              key={index}
              className={`
                text-center p-4 rounded-xl transition-all duration-160 hover:scale-105
                ${badge.earned 
                  ? 'bg-white dark:bg-gray-700 shadow-lg border-2 border-yellow-400' 
                  : 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 opacity-50'
                }
              `}
            >
              <div className={`
                w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center
                ${badge.earned ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-gray-200 dark:bg-gray-700'}
              `}>
                <i className={`
                  ${badge.icon} text-xl
                  ${badge.earned ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'}
                `} />
              </div>
              <div className={`
                text-xs font-medium
                ${badge.earned ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}
              `}>
                {badge.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

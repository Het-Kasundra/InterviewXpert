import { motion } from 'framer-motion';

interface StreakTrackerProps {
  streakDays: number;
}

export const StreakTracker = ({ streakDays }: StreakTrackerProps) => {
  // Generate calendar for the last 14 days
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const isActive = i < streakDays;
      const isToday = i === 0;
      
      days.push({
        date: date.getDate(),
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        isActive,
        isToday,
        fullDate: date
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const streakMessage = streakDays > 0 
    ? `🔥 ${streakDays}-day streak!` 
    : "Start your streak today!";

  const getStreakLevel = (days: number) => {
    if (days >= 30) return { level: 'Legendary', color: 'from-purple-400 to-pink-500', icon: 'ri-vip-crown-line' };
    if (days >= 14) return { level: 'Master', color: 'from-amber-400 to-orange-500', icon: 'ri-fire-line' };
    if (days >= 7) return { level: 'Expert', color: 'from-blue-400 to-cyan-500', icon: 'ri-flashlight-line' };
    if (days >= 3) return { level: 'Rising', color: 'from-green-400 to-emerald-500', icon: 'ri-seedling-line' };
    return { level: 'Beginner', color: 'from-gray-400 to-gray-500', icon: 'ri-plant-line' };
  };

  const streakLevel = getStreakLevel(streakDays);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${streakLevel.color} rounded-xl flex items-center justify-center`}>
            <i className={`${streakLevel.icon} text-white text-lg`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Streak Tracker</h3>
            <p className="text-white/70 text-sm">{streakLevel.level} Level</p>
          </div>
        </div>
        
        {/* Streak Counter */}
        <div className="text-right">
          <motion.div
            key={streakDays}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold text-white"
          >
            {streakDays}
          </motion.div>
          <div className="text-white/70 text-sm">days</div>
        </div>
      </div>

      {/* Streak Message */}
      <div className={`p-4 rounded-xl border mb-6 ${
        streakDays > 0
          ? 'bg-orange-500/20 border-orange-400/30'
          : 'bg-blue-500/20 border-blue-400/30'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            streakDays > 0
              ? 'bg-orange-500'
              : 'bg-blue-500'
          }`}>
            <i className={`text-white text-sm ${
              streakDays > 0 ? 'ri-fire-line' : 'ri-play-line'
            }`} />
          </div>
          <div>
            <h4 className="font-semibold text-white">{streakMessage}</h4>
            <p className="text-white/70 text-sm">
              {streakDays > 0 
                ? "Keep it up! Don't break the chain." 
                : "Complete a daily goal to start your streak."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-3">
        <h4 className="text-white font-medium text-sm">Last 14 Days</h4>
        
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="text-center"
            >
              <div className="text-white/50 text-xs mb-1">
                {day.dayName}
              </div>
              
              <motion.div
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-300
                  ${day.isActive
                    ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/50 hover:bg-white/20'
                  }
                  ${day.isToday ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-800' : ''}
                `}
                animate={day.isActive ? {
                  boxShadow: [
                    '0 0 10px rgba(251, 146, 60, 0.5)',
                    '0 0 20px rgba(251, 146, 60, 0.8)',
                    '0 0 10px rgba(251, 146, 60, 0.5)',
                  ],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {day.date}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Streak Milestones */}
      <div className="mt-6 space-y-2">
        <h4 className="text-white font-medium text-sm">Streak Milestones</h4>
        
        <div className="space-y-2">
          {[
            { days: 3, title: 'Rising Star', reward: '50 XP' },
            { days: 7, title: 'Week Warrior', reward: '100 XP' },
            { days: 14, title: 'Streak Master', reward: '200 XP' },
            { days: 30, title: 'Legendary', reward: '500 XP' },
          ].map((milestone) => (
            <div
              key={milestone.days}
              className={`flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${
                streakDays >= milestone.days
                  ? 'bg-green-500/20 border border-green-400/30'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  streakDays >= milestone.days
                    ? 'bg-green-500'
                    : 'bg-gray-600'
                }`}>
                  {streakDays >= milestone.days && (
                    <i className="ri-check-line text-white text-xs" />
                  )}
                </div>
                <span className={`text-sm ${
                  streakDays >= milestone.days ? 'text-white' : 'text-white/60'
                }`}>
                  {milestone.days} days - {milestone.title}
                </span>
              </div>
              
              <span className={`text-xs ${
                streakDays >= milestone.days ? 'text-green-300' : 'text-white/40'
              }`}>
                {milestone.reward}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
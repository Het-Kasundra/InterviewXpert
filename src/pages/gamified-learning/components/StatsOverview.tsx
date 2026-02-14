import { motion } from 'framer-motion';

interface GamificationData {
  id: string;
  total_xp: number;
  level: number;
  streak_days: number;
  last_activity_date: string;
}

interface Badge {
  id: string;
  badge_id: string;
  title: string;
  description: string;
  icon: string;
  xp_value: number;
  unlocked: boolean;
  unlocked_at?: string;
}

interface StatsOverviewProps {
  gamificationData: GamificationData | null;
  badges: Badge[];
}

export const StatsOverview = ({ gamificationData, badges }: StatsOverviewProps) => {
  const unlockedBadges = badges.filter(badge => badge.unlocked).length;
  const totalBadges = badges.length;
  const nextLevelXp = gamificationData ? (gamificationData.level * 1000) : 1000;
  const currentLevelXp = gamificationData ? (gamificationData.total_xp % 1000) : 0;
  const progressToNextLevel = (currentLevelXp / 1000) * 100;

  const stats = [
    {
      label: 'Total XP',
      value: gamificationData?.total_xp || 0,
      icon: 'ri-star-line',
      color: 'from-amber-400 to-orange-500',
      suffix: ' XP'
    },
    {
      label: 'Current Level',
      value: gamificationData?.level || 1,
      icon: 'ri-trophy-line',
      color: 'from-blue-400 to-blue-600',
      suffix: ''
    },
    {
      label: 'Streak Days',
      value: gamificationData?.streak_days || 0,
      icon: 'ri-fire-line',
      color: 'from-red-400 to-orange-500',
      suffix: ' days'
    },
    {
      label: 'Badges Earned',
      value: unlockedBadges,
      icon: 'ri-award-line',
      color: 'from-purple-400 to-pink-500',
      suffix: `/${totalBadges}`
    }
  ];

  return (
    <div className="mb-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <i className={`${stat.icon} text-white text-xl`} />
                </div>
                <motion.div
                  className={`w-3 h-3 rounded-full bg-gradient-to-r ${stat.color}`}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-white/70 text-sm font-medium">{stat.label}</p>
                <div className="flex items-baseline space-x-1">
                  <motion.span
                    className="text-3xl font-bold text-white"
                    key={stat.value}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {stat.value.toLocaleString()}
                  </motion.span>
                  <span className="text-white/60 text-sm">{stat.suffix}</span>
                </div>
              </div>

              {/* Hover glow effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Level Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              Level {gamificationData?.level || 1} Progress
            </h3>
            <p className="text-white/70 text-sm">
              {currentLevelXp} / 1000 XP to next level
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {Math.round(progressToNextLevel)}%
            </div>
            <div className="text-white/70 text-sm">Complete</div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 via-blue-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressToNextLevel}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          {/* Animated glow effect */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400/50 via-blue-500/50 to-purple-500/50 rounded-full blur-sm"
            initial={{ width: 0 }}
            animate={{ width: `${progressToNextLevel}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Moving shine effect */}
          <motion.div
            className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            animate={{
              x: [-32, 400],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* XP Milestones */}
        <div className="flex justify-between mt-2 text-xs text-white/50">
          <span>0 XP</span>
          <span>250 XP</span>
          <span>500 XP</span>
          <span>750 XP</span>
          <span>1000 XP</span>
        </div>
      </motion.div>
    </div>
  );
};
import { motion } from 'framer-motion';

interface GamificationData {
  id: string;
  total_xp: number;
  level: number;
  streak_days: number;
  last_activity_date: string;
}

interface XPVisualizationProps {
  gamificationData: GamificationData | null;
}

export const XPVisualization = ({ gamificationData }: XPVisualizationProps) => {
  if (!gamificationData) return null;

  const currentLevelXp = gamificationData.total_xp % 1000;
  const progressToNextLevel = (currentLevelXp / 1000) * 100;
  const nextLevel = gamificationData.level + 1;

  const getLevelTitle = (level: number) => {
    if (level >= 50) return 'Grandmaster';
    if (level >= 25) return 'Expert';
    if (level >= 15) return 'Advanced';
    if (level >= 10) return 'Intermediate';
    if (level >= 5) return 'Novice';
    return 'Beginner';
  };

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'from-purple-400 to-pink-500';
    if (level >= 25) return 'from-amber-400 to-orange-500';
    if (level >= 15) return 'from-blue-400 to-cyan-500';
    if (level >= 10) return 'from-green-400 to-emerald-500';
    if (level >= 5) return 'from-yellow-400 to-amber-500';
    return 'from-gray-400 to-gray-500';
  };

  const levelTitle = getLevelTitle(gamificationData.level);
  const levelColor = getLevelColor(gamificationData.level);

  // Generate XP particles for animation
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: i * 0.2,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${levelColor} rounded-xl flex items-center justify-center`}>
            <i className="ri-star-line text-white text-lg" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">XP Progress</h3>
            <p className="text-white/70 text-sm">{levelTitle} Level</p>
          </div>
        </div>
        
        {/* Level Badge */}
        <div className={`px-4 py-2 bg-gradient-to-r ${levelColor} rounded-full`}>
          <span className="text-white font-bold">Level {gamificationData.level}</span>
        </div>
      </div>

      {/* XP Visualization */}
      <div className="relative mb-6">
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Main XP Display */}
        <div className="relative text-center py-8">
          <motion.div
            className="text-6xl font-bold text-white mb-2"
            key={gamificationData.total_xp}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {gamificationData.total_xp.toLocaleString()}
          </motion.div>
          <div className="text-white/70 text-lg">Total Experience Points</div>
          
          {/* XP Glow Effect */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${levelColor} opacity-20 rounded-2xl blur-xl`}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>

      {/* Level Progress */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-white font-semibold">Progress to Level {nextLevel}</h4>
            <p className="text-white/70 text-sm">
              {currentLevelXp} / 1000 XP ({1000 - currentLevelXp} XP remaining)
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {Math.round(progressToNextLevel)}%
            </div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="relative h-6 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${levelColor} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progressToNextLevel}%` }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          
          {/* Animated glow effect */}
          <motion.div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${levelColor} opacity-50 rounded-full blur-sm`}
            initial={{ width: 0 }}
            animate={{ width: `${progressToNextLevel}%` }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          {/* Moving shine effect */}
          <motion.div
            className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
            animate={{
              x: [-48, 400],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut",
            }}
          />

          {/* Progress text overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-medium text-sm drop-shadow-lg">
              {currentLevelXp} XP
            </span>
          </div>
        </div>

        {/* XP Milestones */}
        <div className="flex justify-between text-xs text-white/50 mt-2">
          <span>Level {gamificationData.level}</span>
          <span>250 XP</span>
          <span>500 XP</span>
          <span>750 XP</span>
          <span>Level {nextLevel}</span>
        </div>
      </div>

      {/* Level Benefits */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <h5 className="text-white font-medium mb-3">Level {nextLevel} Benefits</h5>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-white/70">
            <i className="ri-gift-line text-amber-400" />
            <span>Unlock new badge categories</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-white/70">
            <i className="ri-star-line text-blue-400" />
            <span>Increased XP multiplier</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-white/70">
            <i className="ri-trophy-line text-purple-400" />
            <span>Exclusive {getLevelTitle(nextLevel)} title</span>
          </div>
        </div>
      </div>

      {/* Recent XP Activity */}
      <div className="mt-6">
        <h5 className="text-white font-medium mb-3">Recent Activity</h5>
        <div className="space-y-2">
          {[
            { action: 'Completed Daily Goal', xp: 75, time: '2 hours ago' },
            { action: 'Practice Interview', xp: 100, time: '1 day ago' },
            { action: 'Badge Unlocked', xp: 150, time: '2 days ago' },
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
            >
              <div>
                <span className="text-white text-sm">{activity.action}</span>
                <p className="text-white/50 text-xs">{activity.time}</p>
              </div>
              <div className="text-amber-400 font-medium text-sm">
                +{activity.xp} XP
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
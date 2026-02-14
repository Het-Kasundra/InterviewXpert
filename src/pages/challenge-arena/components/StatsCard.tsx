import { motion } from 'framer-motion';
import { useChallengeArena } from '../../../contexts/ChallengeProvider';

const StatsCard = () => {
  const { userStats, loading } = useChallengeArena();

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-3/4"></div>
          <div className="h-8 bg-slate-700 rounded w-1/2"></div>
          <div className="h-8 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-amber-800/80 to-orange-800/80 backdrop-blur-sm border border-amber-700/50 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
          <i className="ri-trophy-line text-xl text-amber-400"></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Your Stats</h3>
          <p className="text-amber-200 text-sm">Arena Performance</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <i className="ri-star-line text-amber-400"></i>
            </div>
            <span className="text-white font-medium">Total XP</span>
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-amber-400"
          >
            {userStats?.total_xp?.toLocaleString() || '0'}
          </motion.div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <i className="ri-fire-line text-orange-400"></i>
            </div>
            <span className="text-white font-medium">Current Streak</span>
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-orange-400"
          >
            {userStats?.arena_streak || '0'}
          </motion.div>
        </div>
      </div>

      <div className="mt-6 p-3 bg-amber-900/30 rounded-xl">
        <div className="text-center">
          <div className="text-amber-200 text-sm mb-1">Next Milestone</div>
          <div className="flex items-center justify-center gap-2">
            <div className="flex-1 bg-amber-900/50 rounded-full h-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((userStats?.total_xp || 0) % 1000) / 10, 100)}%` }}
                className="bg-gradient-to-r from-amber-400 to-orange-400 h-2 rounded-full"
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <span className="text-amber-400 text-xs font-medium">
              {1000 - ((userStats?.total_xp || 0) % 1000)} XP
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
import { motion } from 'framer-motion';

const EmptyState = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-8">
        <i className="ri-trophy-line text-6xl text-blue-400"></i>
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-4">
        New Challenge Drops Monday
      </h2>
      
      <p className="text-slate-400 text-lg mb-8 max-w-md">
        Get ready for the next AI Challenge Arena! New challenges are released every Monday at 00:00 UTC.
      </p>
      
      <div className="flex items-center gap-6 mb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-500/20 rounded-xl flex items-center justify-center mb-2">
            <i className="ri-star-line text-2xl text-amber-400"></i>
          </div>
          <div className="text-white font-medium">Earn XP</div>
          <div className="text-slate-400 text-sm">Up to 250 XP</div>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mb-2">
            <i className="ri-medal-line text-2xl text-purple-400"></i>
          </div>
          <div className="text-white font-medium">Win Badges</div>
          <div className="text-slate-400 text-sm">Unlock rewards</div>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mb-2">
            <i className="ri-trophy-line text-2xl text-green-400"></i>
          </div>
          <div className="text-white font-medium">Compete</div>
          <div className="text-slate-400 text-sm">Global leaderboard</div>
        </div>
      </div>
      
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 max-w-md">
        <div className="flex items-center gap-3 mb-3">
          <i className="ri-notification-line text-blue-400"></i>
          <span className="text-white font-medium">Get Notified</span>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          Enable notifications to be alerted when new challenges are available.
        </p>
        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all duration-200">
          Enable Notifications
        </button>
      </div>
    </motion.div>
  );
};

export default EmptyState;
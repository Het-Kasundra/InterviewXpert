import { motion } from 'framer-motion';
import { useChallengeArena } from '../../../contexts/ChallengeProvider';

interface ActiveChallengeCardProps {
  onStartAttempt: () => void;
}

const ActiveChallengeCard = ({ onStartAttempt }: ActiveChallengeCardProps) => {
  const { activeChallenge, userAttempt, loading } = useChallengeArena();

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 h-80">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          <div className="h-20 bg-slate-700 rounded"></div>
          <div className="h-10 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!activeChallenge) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 h-80 flex flex-col items-center justify-center text-center"
      >
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
          <i className="ri-calendar-line text-2xl text-slate-400"></i>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Active Challenge</h3>
        <p className="text-slate-400">New challenge drops Monday at 00:00</p>
      </motion.div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/20';
      case 'hard': return 'text-red-400 bg-red-400/20';
      default: return 'text-blue-400 bg-blue-400/20';
    }
  };

  const getDomainIcon = (domain: string) => {
    switch (domain.toLowerCase()) {
      case 'technical': return 'ri-code-line';
      case 'behavioral': return 'ri-user-heart-line';
      case 'quiz mix': return 'ri-question-line';
      default: return 'ri-lightbulb-line';
    }
  };

  const hasAttempted = userAttempt && userAttempt.score > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <i className={`${getDomainIcon(activeChallenge.domain)} text-xl text-blue-400`}></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{activeChallenge.title}</h3>
            <p className="text-slate-400 text-sm">{activeChallenge.domain}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activeChallenge.difficulty)}`}>
          {activeChallenge.difficulty}
        </span>
      </div>

      <p className="text-slate-300 text-sm mb-6 line-clamp-3">
        {activeChallenge.description}
      </p>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-amber-400 font-bold text-lg">{activeChallenge.reward_xp}</div>
            <div className="text-slate-400 text-xs">XP Reward</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold text-lg">{Math.round(activeChallenge.time_limit_s / 60)}</div>
            <div className="text-slate-400 text-xs">Minutes</div>
          </div>
        </div>

        {activeChallenge.badge && (
          <div className="flex items-center gap-2">
            <img 
              src={activeChallenge.badge.art_url} 
              alt={activeChallenge.badge.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-amber-400 text-xs font-medium">Badge Available</span>
          </div>
        )}
      </div>

      {hasAttempted ? (
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
          <div className="text-green-400 font-bold text-lg mb-1">
            {userAttempt.score.toFixed(1)}%
          </div>
          <div className="text-green-300 text-sm">Challenge Completed</div>
        </div>
      ) : (
        <motion.button
          onClick={onStartAttempt}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <i className="ri-play-circle-line mr-2"></i>
          Start Challenge
        </motion.button>
      )}
    </motion.div>
  );
};

export default ActiveChallengeCard;
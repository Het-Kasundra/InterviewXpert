import { motion } from 'framer-motion';
import { useChallengeArena } from '../../../contexts/ChallengeProvider';

const AttemptHistory = () => {
  const { attemptHistory, loading } = useChallengeArena();

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/2"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-400/20';
    if (score >= 60) return 'bg-amber-400/20';
    return 'bg-red-400/20';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/20';
      case 'hard': return 'text-red-400 bg-red-400/20';
      default: return 'text-blue-400 bg-blue-400/20';
    }
  };

  const getDomainIcon = (domain: string) => {
    switch (domain?.toLowerCase()) {
      case 'technical': return 'ri-code-line';
      case 'behavioral': return 'ri-user-heart-line';
      case 'quiz mix': return 'ri-question-line';
      default: return 'ri-lightbulb-line';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <i className="ri-history-line text-xl text-purple-400"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Challenge History</h2>
          <p className="text-slate-400 text-sm">Your past 8 attempts</p>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {attemptHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-history-line text-2xl text-slate-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No History Yet</h3>
            <p className="text-slate-400">Complete your first challenge to see your history here!</p>
          </div>
        ) : (
          attemptHistory.map((attempt, index) => (
            <motion.div
              key={attempt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4 hover:bg-slate-700/50 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                    <i className={`${getDomainIcon(attempt.challenges?.domain)} text-slate-300`}></i>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">
                      {attempt.challenges?.title || 'Unknown Challenge'}
                    </h3>
                    <p className="text-slate-400 text-xs">
                      {new Date(attempt.submitted_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(attempt.challenges?.difficulty)}`}>
                    {attempt.challenges?.difficulty}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDomainIcon(attempt.challenges?.domain)} ${getScoreBg(attempt.score)} ${getScoreColor(attempt.score)}`}>
                    {attempt.score.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-slate-400">
                    <i className="ri-timer-line"></i>
                    <span>{Math.round(attempt.time_taken_s / 60)}m</span>
                  </div>
                  {attempt.rank_estimate && (
                    <div className="flex items-center gap-1 text-slate-400">
                      <i className="ri-trophy-line"></i>
                      <span>Rank #{attempt.rank_estimate}</span>
                    </div>
                  )}
                </div>

                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                  <i className="ri-eye-line mr-1"></i>
                  Review
                </button>
              </div>

              {/* Performance Indicator */}
              <div className="mt-3 pt-3 border-t border-slate-600/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Performance</span>
                  <span className={getScoreColor(attempt.score)}>
                    {attempt.score >= 80 ? 'Excellent' : 
                     attempt.score >= 60 ? 'Good' : 
                     attempt.score >= 40 ? 'Fair' : 'Needs Improvement'}
                  </span>
                </div>
                <div className="mt-1 bg-slate-600 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${attempt.score}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-1.5 rounded-full ${
                      attempt.score >= 80 ? 'bg-green-400' :
                      attempt.score >= 60 ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* View All Button */}
      {attemptHistory.length >= 8 && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <button className="w-full text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors">
            <i className="ri-arrow-down-line mr-1"></i>
            View All History
          </button>
        </div>
      )}

      {/* Stats Summary */}
      {attemptHistory.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-white">
                {attemptHistory.length}
              </div>
              <div className="text-slate-400 text-xs">Attempts</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">
                {(attemptHistory.reduce((sum, attempt) => sum + attempt.score, 0) / attemptHistory.length).toFixed(1)}%
              </div>
              <div className="text-slate-400 text-xs">Avg Score</div>
            </div>
            <div>
              <div className="text-lg font-bold text-amber-400">
                {attemptHistory.filter(attempt => attempt.score >= 80).length}
              </div>
              <div className="text-slate-400 text-xs">Badges</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AttemptHistory;
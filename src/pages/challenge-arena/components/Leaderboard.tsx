import { useState } from 'react';
import { motion } from 'framer-motion';
import { useChallengeArena } from '../../../contexts/ChallengeProvider';
import { useSession } from '../../../contexts/SessionProvider';

const Leaderboard = () => {
  const { leaderboard, loading, userAttempt } = useChallengeArena();
  const { user } = useSession();
  const [filter, setFilter] = useState<'global' | 'network' | 'college'>('global');

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const filters = [
    { id: 'global', label: 'Global', icon: 'ri-global-line' },
    { id: 'network', label: 'My Network', icon: 'ri-team-line', disabled: true },
    { id: 'college', label: 'My College', icon: 'ri-school-line', disabled: true }
  ] as const;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-amber-400';
      case 2: return 'text-slate-300';
      case 3: return 'text-amber-600';
      default: return 'text-slate-400';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const userRank = leaderboard.findIndex(entry => entry.user_id === user?.id) + 1;
  const userEntry = leaderboard.find(entry => entry.user_id === user?.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <i className="ri-trophy-line text-xl text-amber-400"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Leaderboard</h2>
            <p className="text-slate-400 text-sm">Weekly challenge rankings</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-slate-900/50 p-1 rounded-lg">
          {filters.map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => !filterOption.disabled && setFilter(filterOption.id)}
              disabled={filterOption.disabled}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                filter === filterOption.id
                  ? 'bg-blue-600 text-white'
                  : filterOption.disabled
                  ? 'text-slate-500 cursor-not-allowed'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <i className={filterOption.icon}></i>
              {filterOption.label}
              {filterOption.disabled && (
                <span className="text-xs bg-slate-600 px-1 rounded">Soon</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-trophy-line text-2xl text-slate-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Submissions Yet</h3>
            <p className="text-slate-400">Be the first to complete this challenge!</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                entry.user_id === user?.id
                  ? 'bg-blue-500/20 border-blue-500/50'
                  : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`text-2xl font-bold ${getRankColor(entry.rank)} min-w-[3rem] text-center`}>
                  {getRankIcon(entry.rank)}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {entry.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{entry.username}</div>
                    <div className="text-slate-400 text-sm">
                      Completed in {formatTime(entry.time_taken_s)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold text-white mb-1">
                  {entry.score.toFixed(1)}%
                </div>
                <div className="text-slate-400 text-sm">
                  {entry.total_xp?.toLocaleString() || '0'} XP
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* User Rank Card (if outside top 10) */}
      {userAttempt && userRank > 10 && userEntry && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-xl font-bold text-blue-400">
                  #{userRank}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {userEntry.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Your Rank</div>
                    <div className="text-blue-200 text-sm">
                      {formatTime(userEntry.time_taken_s)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {userEntry.score.toFixed(1)}%
                </div>
                <div className="text-blue-200 text-sm">Your Score</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Results */}
      {userAttempt && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="flex items-center justify-center gap-4">
            <span className="text-slate-400 text-sm">Share your result:</span>
            <div className="flex gap-2">
              <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <i className="ri-twitter-line"></i>
              </button>
              <button className="p-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors">
                <i className="ri-linkedin-line"></i>
              </button>
              <button className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                <i className="ri-share-line"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Leaderboard;
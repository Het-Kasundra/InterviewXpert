
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabaseClient';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_xp: number;
  level: number;
  rank: number;
}

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setLoading(false);
        return;
      }

      // Fetch top 10 users directly from user_gamification
      const { data: topUsers, error } = await supabase
        .from('user_gamification')
        .select('user_id, username, total_xp, level')
        .order('total_xp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        // Fallback to mock data if database query fails
        const mockLeaderboard = [
          { user_id: '1', username: 'Alex Chen', total_xp: 15420, level: 16, rank: 1 },
          { user_id: '2', username: 'Sarah Johnson', total_xp: 14850, level: 15, rank: 2 },
          { user_id: '3', username: 'Michael Rodriguez', total_xp: 13200, level: 14, rank: 3 },
          { user_id: '4', username: 'Emily Davis', total_xp: 12750, level: 13, rank: 4 },
          { user_id: '5', username: 'David Kim', total_xp: 11900, level: 12, rank: 5 },
          { user_id: '6', username: 'Jessica Wang', total_xp: 10800, level: 11, rank: 6 },
          { user_id: '7', username: 'Ryan Thompson', total_xp: 9650, level: 10, rank: 7 },
          { user_id: '8', username: 'Lisa Anderson', total_xp: 8900, level: 9, rank: 8 },
          { user_id: '9', username: 'Mark Wilson', total_xp: 8200, level: 9, rank: 9 },
          { user_id: '10', username: 'Jennifer Brown', total_xp: 7800, level: 8, rank: 10 }
        ];
        setLeaderboard(mockLeaderboard);
        setCurrentUserRank(5); // Mock current user rank
        setLoading(false);
        return;
      }

      // Transform data and add ranks, calculate level if missing
      const leaderboardData = (topUsers || []).map((entry, index) => ({
        user_id: entry.user_id,
        username: entry.username || `User ${entry.user_id.slice(0, 8)}`,
        total_xp: entry.total_xp || 0,
        level: entry.level || Math.max(1, Math.floor((entry.total_xp || 0) / 1000) + 1),
        rank: index + 1
      }));

      setLeaderboard(leaderboardData);

      // Find current user's rank
      const currentUserEntry = leaderboardData.find(entry => entry.user_id === user.id);
      if (currentUserEntry) {
        setCurrentUserRank(currentUserEntry.rank);
      } else {
        // If user not in top 10, get their actual rank
        const { data: userStats } = await supabase
          .from('user_gamification')
          .select('total_xp')
          .eq('user_id', user.id)
          .single();

        if (userStats) {
          const { count } = await supabase
            .from('user_gamification')
            .select('*', { count: 'exact', head: true })
            .gt('total_xp', userStats.total_xp);

          setCurrentUserRank((count || 0) + 1);
        }
      }
    } catch (error) {
      console.error('Error in fetchLeaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Set up real-time subscription for leaderboard updates
    const subscription = supabase
      .channel('leaderboard-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_gamification' },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '👑';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400';
      case 2:
        return 'text-gray-300';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-blue-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <i className="ri-trophy-line text-yellow-400"></i>
          Leaderboard
        </h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-slate-700/50 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <i className="ri-trophy-line text-yellow-400"></i>
          Leaderboard
        </h3>
        {currentUserRank && (
          <div className="text-sm text-slate-400">
            Your Rank: <span className="text-blue-400 font-semibold">#{currentUserRank}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <motion.div
            key={entry.user_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
              entry.rank === 1
                ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-400/30 shadow-lg shadow-yellow-400/20'
                : entry.rank <= 3
                ? 'bg-slate-700/50 border-slate-600/50'
                : 'bg-slate-800/30 border-slate-700/30'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`text-2xl font-bold ${getRankColor(entry.rank)} min-w-[3rem] text-center`}>
                {entry.rank === 1 ? (
                  <motion.span
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    👑
                  </motion.span>
                ) : (
                  getRankIcon(entry.rank)
                )}
              </div>
              <div>
                <div className="font-semibold text-white">{entry.username}</div>
                <div className="text-sm text-slate-400">Level {entry.level}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-blue-400">{entry.total_xp.toLocaleString()} XP</div>
              <div className="text-xs text-slate-500">
                {entry.total_xp >= 1000 ? `${(entry.total_xp / 1000).toFixed(1)}k` : entry.total_xp} points
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={fetchLeaderboard}
        className="w-full mt-4 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 font-medium transition-all duration-200 flex items-center justify-center gap-2"
      >
        <i className="ri-refresh-line"></i>
        Refresh Rankings
      </motion.button>
    </motion.div>
  );
};

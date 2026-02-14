import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { useSession } from '../../contexts/SessionProvider';
import { StatsOverview } from './components/StatsOverview';
import { DailyGoals } from './components/DailyGoals';
import { WeeklyChallenge } from './components/WeeklyChallenge';
import { BadgeCollection } from './components/BadgeCollection';
import { StreakTracker } from './components/StreakTracker';
import { XPVisualization } from './components/XPVisualization';
import { Leaderboard } from './components/Leaderboard';

interface GamificationData {
  id: string;
  total_xp: number;
  level: number;
  streak_days: number;
  last_activity_date: string;
}

interface DailyGoal {
  id: string;
  title: string;
  description: string;
  reward_xp: number;
  status: 'pending' | 'completed';
  goal_date: string;
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

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  reward_xp: number;
  progress: number;
  target_progress: number;
  deadline: string;
  status: 'active' | 'completed' | 'expired';
}

export const GamifiedLearningPage = () => {
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (user) {
      initializeUserData();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const initializeUserData = async () => {
    try {
      setLoading(true);
      
      // Initialize user gamification data
      await initializeGamificationData();
      
      // Fetch all data
      await Promise.all([
        fetchGamificationData(),
        fetchDailyGoals(),
        fetchBadges(),
        fetchWeeklyChallenge()
      ]);
    } catch (error) {
      console.error('Error initializing user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeGamificationData = async () => {
    if (!user) return;

    // Check if user already has gamification data
    const { data: existingData } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!existingData) {
      // Create initial gamification data
      await supabase
        .from('user_gamification')
        .insert({
          user_id: user.id,
          total_xp: 0,
          level: 1,
          streak_days: 0
        });

      // Create initial daily goals
      await supabase.rpc('create_initial_daily_goals', { target_user_id: user.id });

      // Create initial badges
      await supabase.rpc('create_initial_badges', { target_user_id: user.id });

      // Create initial weekly challenge
      await supabase
        .from('weekly_challenges')
        .insert({
          user_id: user.id,
          title: 'Interview Master Challenge',
          description: 'Complete 3 practice interviews this week',
          reward_xp: 300,
          progress: 0,
          target_progress: 3,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
    }
  };

  const fetchGamificationData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching gamification data:', error);
        // Create default data if doesn't exist
        const defaultData = {
          id: user.id,
          user_id: user.id,
          total_xp: 0,
          level: 1,
          streak_days: 0,
          last_activity_date: new Date().toISOString().split('T')[0]
        };
        setGamificationData(defaultData as any);
        return;
      }

      if (data) {
        // Ensure all fields are present
        const completeData = {
          ...data,
          total_xp: data.total_xp || 0,
          level: data.level || 1,
          streak_days: data.streak_days || 0,
          last_activity_date: data.last_activity_date || new Date().toISOString().split('T')[0]
        };
        setGamificationData(completeData);
      } else {
        // Fallback to default
        const defaultData = {
          id: user.id,
          user_id: user.id,
          total_xp: 0,
          level: 1,
          streak_days: 0,
          last_activity_date: new Date().toISOString().split('T')[0]
        };
        setGamificationData(defaultData as any);
      }
    } catch (error) {
      console.error('Error in fetchGamificationData:', error);
      // Set default data on error
      const defaultData = {
        id: user.id,
        user_id: user.id,
        total_xp: 0,
        level: 1,
        streak_days: 0,
        last_activity_date: new Date().toISOString().split('T')[0]
      };
      setGamificationData(defaultData as any);
    }
  };

  const fetchDailyGoals = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('goal_date', today)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching daily goals:', error);
        // Set default goals if table doesn't exist
        const defaultGoals = [
          {
            id: '1',
            user_id: user.id,
            title: 'Complete 1 Interview',
            description: 'Practice with a mock interview',
            reward_xp: 50,
            status: 'pending' as const,
            goal_date: today
          },
          {
            id: '2',
            user_id: user.id,
            title: 'Answer 5 Questions',
            description: 'Practice answering interview questions',
            reward_xp: 25,
            status: 'pending' as const,
            goal_date: today
          }
        ];
        setDailyGoals(defaultGoals);
        return;
      }

      // Ensure we have at least some goals
      if (!data || data.length === 0) {
        const defaultGoals = [
          {
            id: '1',
            user_id: user.id,
            title: 'Complete 1 Interview',
            description: 'Practice with a mock interview',
            reward_xp: 50,
            status: 'pending' as const,
            goal_date: today
          }
        ];
        setDailyGoals(defaultGoals);
      } else {
        setDailyGoals(data);
      }
    } catch (error) {
      console.error('Error in fetchDailyGoals:', error);
      setDailyGoals([]);
    }
  };

  const fetchBadges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked', { ascending: false });

      if (error) {
        console.error('Error fetching badges:', error);
        // Set default badges if table doesn't exist
        const defaultBadges = [
          {
            id: '1',
            user_id: user.id,
            badge_id: 'first_interview',
            title: 'First Interview',
            description: 'Complete your first interview',
            icon: 'ri-trophy-line',
            xp_value: 50,
            unlocked: false
          },
          {
            id: '2',
            user_id: user.id,
            badge_id: 'streak_master',
            title: 'Streak Master',
            description: 'Maintain a 7-day streak',
            icon: 'ri-fire-line',
            xp_value: 100,
            unlocked: false
          }
        ];
        setBadges(defaultBadges);
        return;
      }

      // Ensure we have at least some badges
      if (!data || data.length === 0) {
        const defaultBadges = [
          {
            id: '1',
            user_id: user.id,
            badge_id: 'first_interview',
            title: 'First Interview',
            description: 'Complete your first interview',
            icon: 'ri-trophy-line',
            xp_value: 50,
            unlocked: false
          }
        ];
        setBadges(defaultBadges);
      } else {
        setBadges(data);
      }
    } catch (error) {
      console.error('Error in fetchBadges:', error);
      setBadges([]);
    }
  };

  const fetchWeeklyChallenge = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('weekly_challenges')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching weekly challenge:', error);
      return;
    }

    setWeeklyChallenge(data);
  };

  const setupRealtimeSubscriptions = () => {
    if (!user) return;

    // Subscribe to gamification data changes
    const gamificationSubscription = supabase
      .channel('user_gamification_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_gamification',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setGamificationData(payload.new as GamificationData);
            
            // Check for level up
            const oldLevel = gamificationData?.level || 1;
            const newLevel = (payload.new as GamificationData).level;
            if (newLevel > oldLevel) {
              triggerCelebration('Level Up!', `Congratulations! You've reached Level ${newLevel}!`);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to daily goals changes
    const goalsSubscription = supabase
      .channel('daily_goals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_goals',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchDailyGoals();
        }
      )
      .subscribe();

    // Subscribe to badges changes
    const badgesSubscription = supabase
      .channel('badges_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          fetchBadges();
          
          // Check for new badge unlock
          if (payload.eventType === 'UPDATE' && payload.new.unlocked && !payload.old?.unlocked) {
            triggerCelebration('Badge Unlocked!', `You've earned the "${payload.new.title}" badge!`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gamificationSubscription);
      supabase.removeChannel(goalsSubscription);
      supabase.removeChannel(badgesSubscription);
    };
  };

  const triggerCelebration = (title: string, message: string) => {
    setShowCelebration(true);
    
    // Create confetti effect
    const confettiColors = ['#F59E0B', '#2563EB', '#10B981', '#EF4444', '#8B5CF6'];
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.animation = 'confetti-fall 3s linear forwards';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
          document.body.removeChild(confetti);
        }, 3000);
      }, i * 50);
    }

    setTimeout(() => setShowCelebration(false), 3000);
  };

  const completeGoal = async (goalId: string, rewardXp: number) => {
    if (!user || !gamificationData) return;

    try {
      // Update goal status
      await supabase
        .from('daily_goals')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', goalId);

      // Update user XP and level
      const newTotalXp = gamificationData.total_xp + rewardXp;
      const newLevel = Math.floor(newTotalXp / 1000) + 1;

      await supabase
        .from('user_gamification')
        .update({
          total_xp: newTotalXp,
          level: newLevel,
          last_activity_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      // Check for badge unlocks
      await checkBadgeUnlocks(newTotalXp, newLevel);

      triggerCelebration('Goal Completed!', `You earned ${rewardXp} XP!`);
    } catch (error) {
      console.error('Error completing goal:', error);
    }
  };

  const checkBadgeUnlocks = async (totalXp: number, level: number) => {
    if (!user) return;

    const completedGoalsCount = dailyGoals.filter(goal => goal.status === 'completed').length;
    
    // Check various badge conditions
    const badgeChecks = [
      { badge_id: 'first_interview', condition: totalXp >= 75 },
      { badge_id: 'streak_master', condition: (gamificationData?.streak_days || 0) >= 7 },
      { badge_id: 'early_bird', condition: completedGoalsCount >= 1 && new Date().getHours() < 10 },
      { badge_id: 'knowledge_seeker', condition: totalXp >= 500 },
    ];

    for (const check of badgeChecks) {
      if (check.condition) {
        await supabase
          .from('user_badges')
          .update({
            unlocked: true,
            unlocked_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('badge_id', check.badge_id)
          .eq('unlocked', false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="h-12 bg-white/10 rounded-lg w-96 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-white/10 rounded w-64 mx-auto animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-white/20 rounded w-32 mb-4" />
                <div className="h-32 bg-white/20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Gamified Learning Hub
            <motion.div
              className="h-1 bg-gradient-to-r from-amber-400 to-blue-500 mx-auto mt-2 rounded-full"
              style={{ width: '200px' }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(245, 158, 11, 0.5)',
                  '0 0 40px rgba(37, 99, 235, 0.5)',
                  '0 0 20px rgba(245, 158, 11, 0.5)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </h1>
          <p className="text-blue-200 text-xl">
            Level up your skills and unlock your potential
          </p>
        </motion.div>

        {/* Stats Overview */}
        <StatsOverview 
          gamificationData={gamificationData}
          badges={badges}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <DailyGoals 
              goals={dailyGoals}
              onCompleteGoal={completeGoal}
            />
            
            <WeeklyChallenge 
              challenge={weeklyChallenge}
            />
            
            <XPVisualization 
              gamificationData={gamificationData}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <BadgeCollection 
              badges={badges}
            />
            
            <StreakTracker 
              streakDays={gamificationData?.streak_days || 0}
            />
            
            <Leaderboard />
          </div>
        </div>

        {/* Celebration Modal */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-gradient-to-br from-amber-400 to-blue-500 p-8 rounded-3xl text-center max-w-md mx-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 text-white"
                >
                  <i className="ri-trophy-line text-6xl" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
                <p className="text-white/90">You're making amazing progress!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CSS for confetti animation */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
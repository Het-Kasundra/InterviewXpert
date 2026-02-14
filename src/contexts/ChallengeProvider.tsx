
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSession } from './SessionProvider';

interface Challenge {
  id: string;
  week_start: string;
  title: string;
  domain: string;
  difficulty: string;
  description: string;
  reward_xp: number;
  time_limit_s: number;
  badge_id: string;
  is_active: boolean;
  badge?: Badge;
}

interface Question {
  id: string;
  challenge_id: string;
  type: 'MCQ' | 'Scenario' | 'Code';
  prompt: string;
  options?: string[];
  correct_answer?: string;
  starter_code?: string;
  tests?: any;
  weight: number;
}

interface Attempt {
  id: string;
  challenge_id: string;
  user_id: string;
  score: number;
  details: any;
  time_taken_s: number;
  submitted_at: string;
  rank_estimate: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  art_url: string;
  xp_value: number;
  unlock_criteria: any;
}

interface UserStats {
  user_id: string;
  total_xp: number;
  arena_streak: number;
  updated_at: string;
}

interface LeaderboardEntry {
  user_id: string;
  username: string;
  score: number;
  time_taken_s: number;
  total_xp: number;
  rank: number;
}

interface ChallengeContextType {
  activeChallenge: Challenge | null;
  questions: Question[];
  userAttempt: Attempt | null;
  userStats: UserStats | null;
  leaderboard: LeaderboardEntry[];
  attemptHistory: Attempt[];
  loading: boolean;
  error: string | null;
  startAttempt: () => Promise<void>;
  submitAttempt: (answers: any[], timeSpent: number) => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const useChallengeArena = () => {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error('useChallengeArena must be used within a ChallengeProvider');
  }
  return context;
};

interface ChallengeProviderProps {
  children: ReactNode;
}

export const ChallengeProvider = ({ children }: ChallengeProviderProps) => {
  const { user } = useSession();
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAttempt, setUserAttempt] = useState<Attempt | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [attemptHistory, setAttemptHistory] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveChallenge = async () => {
    try {
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .single();

      if (challengeError && challengeError.code !== 'PGRST116') {
        console.error('Error fetching challenge:', challengeError);
        // Don't throw - just log and continue with null
        setActiveChallenge(null);
        setQuestions([]);
        return;
      }

      if (challenge) {
        // Fetch badge separately if badge_id exists
        let badge = null;
        if (challenge.badge_id) {
          const { data: badgeData, error: badgeError } = await supabase
            .from('badges')
            .select('*')
            .eq('id', challenge.badge_id)
            .single();

          if (!badgeError) {
            badge = badgeData;
          }
        }

        // Combine challenge with badge data
        const challengeWithBadge = { ...challenge, badge };
        setActiveChallenge(challengeWithBadge);

        // Fetch questions for the active challenge
        const { data: questionsData, error: questionsError } = await supabase
          .from('challenge_questions')
          .select('*')
          .eq('challenge_id', challenge.id)
          .order('weight');

        if (questionsError) {
          console.error('Error fetching questions:', questionsError);
          setQuestions([]);
        } else {
          setQuestions(questionsData || []);
        }

        // Check if user has already attempted this challenge
        if (user) {
          const { data: attempt, error: attemptError } = await supabase
            .from('challenge_attempts')
            .select('*')
            .eq('challenge_id', challenge.id)
            .eq('user_id', user.id)
            .single();

          if (attemptError && attemptError.code !== 'PGRST116') {
            console.error('Error fetching attempt:', attemptError);
          }

          setUserAttempt(attempt || null);
        }
      } else {
        setActiveChallenge(null);
        setQuestions([]);
      }
    } catch (err) {
      console.error('Error fetching active challenge:', err);
      // Don't set error - just set null data to show empty state
      setActiveChallenge(null);
      setQuestions([]);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      if (!stats) {
        // Create initial stats for new user using upsert to avoid duplicates
        const { data: newStats, error: createError } = await supabase
          .from('user_stats')
          .upsert({
            user_id: user.id,
            total_xp: 0,
            arena_streak: 0
          }, {
            onConflict: 'user_id'
          })
          .select()
          .single();

        if (createError) throw createError;
        setUserStats(newStats);
      } else {
        setUserStats(stats);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const fetchLeaderboard = async () => {
    if (!activeChallenge) return;

    try {
      const { data: attempts, error } = await supabase
        .from('challenge_attempts')
        .select('*')
        .eq('challenge_id', activeChallenge.id)
        .order('score', { ascending: false })
        .order('time_taken_s', { ascending: true })
        .limit(10);

      if (error) throw error;

      // Fetch usernames separately to avoid foreign key issues
      const userIds = attempts?.map(attempt => attempt.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profilesError) {
        console.warn('Could not fetch usernames:', profilesError);
      }

      const profilesMap = new Map(profiles?.map(p => [p.id, p.username]) || []);

      const leaderboardData = attempts?.map((attempt, index) => ({
        user_id: attempt.user_id,
        username: profilesMap.get(attempt.user_id) || 'Anonymous',
        score: attempt.score,
        time_taken_s: attempt.time_taken_s,
        total_xp: 0, // Will be fetched separately if needed
        rank: index + 1
      })) || [];

      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  const fetchAttemptHistory = async () => {
    if (!user) return;

    try {
      const { data: history, error } = await supabase
        .from('challenge_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(8);

      if (error) throw error;

      // Fetch challenge details separately
      const challengeIds = history?.map(attempt => attempt.challenge_id) || [];
      const { data: challenges, error: challengesError } = await supabase
        .from('challenges')
        .select('id, title, domain, difficulty')
        .in('id', challengeIds);

      if (challengesError) {
        console.warn('Could not fetch challenge details:', challengesError);
      }

      const challengesMap = new Map(challenges?.map(c => [c.id, c]) || []);

      const historyWithChallenges = history?.map(attempt => ({
        ...attempt,
        challenges: challengesMap.get(attempt.challenge_id) || null
      })) || [];

      setAttemptHistory(historyWithChallenges);
    } catch (err) {
      console.error('Error fetching attempt history:', err);
    }
  };

  const startAttempt = async () => {
    if (!activeChallenge || !user || userAttempt) return;

    try {
      // Create a draft attempt record
      const { data: attempt, error } = await supabase
        .from('challenge_attempts')
        .insert({
          challenge_id: activeChallenge.id,
          user_id: user.id,
          score: 0,
          details: { started_at: new Date().toISOString() },
          time_taken_s: 0
        })
        .select()
        .single();

      if (error) throw error;
      setUserAttempt(attempt);
    } catch (err) {
      console.error('Error starting attempt:', err);
      throw new Error('Failed to start challenge attempt');
    }
  };

  const submitAttempt = async (answers: any[], timeSpent: number) => {
    if (!activeChallenge || !user || !userAttempt) return;

    try {
      // Calculate score
      let totalScore = 0;
      let totalWeight = 0;

      questions.forEach((question, index) => {
        const answer = answers[index];
        let questionScore = 0;

        if (question.type === 'MCQ') {
          questionScore = answer === question.correct_answer ? 1 : 0;
        } else if (question.type === 'Scenario') {
          // Simple keyword matching for scenario questions
          const keywords = question.correct_answer?.toLowerCase().split(',') || [];
          const answerText = answer?.toLowerCase() || '';
          const matchedKeywords = keywords.filter(keyword =>
            answerText.includes(keyword.trim())
          );
          questionScore = matchedKeywords.length / keywords.length;
        } else if (question.type === 'Code') {
          // For code questions, check if the answer contains key improvements
          const answerText = answer?.toLowerCase() || '';
          const hasIndex = answerText.includes('index') || answerText.includes('where');
          const hasLimit = answerText.includes('limit');
          const hasOrder = answerText.includes('order');
          questionScore = (hasIndex ? 0.4 : 0) + (hasLimit ? 0.3 : 0) + (hasOrder ? 0.3 : 0);
        }

        totalScore += questionScore * question.weight;
        totalWeight += question.weight;
      });

      const finalScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
      const earnedXP = Math.max(Math.round(activeChallenge.reward_xp * (finalScore / 100)), 10);

      // Update attempt with final score
      const { error: updateError } = await supabase
        .from('challenge_attempts')
        .update({
          score: finalScore,
          details: { answers, submitted_at: new Date().toISOString() },
          time_taken_s: timeSpent
        })
        .eq('id', userAttempt.id);

      if (updateError) throw updateError;

      // Update user stats using upsert to avoid conflicts
      const newTotalXP = (userStats?.total_xp || 0) + earnedXP;
      const newStreak = finalScore >= 50 ? (userStats?.arena_streak || 0) + 1 : 0;

      const { error: statsError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          total_xp: newTotalXP,
          arena_streak: newStreak,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (statsError) throw statsError;

      // Check for badge unlock
      if (activeChallenge.badge && finalScore >= 80) {
        // Award badge logic would go here
        console.log('Badge unlocked!', activeChallenge.badge);
      }

      // Refresh data
      await refreshData();

      return { score: finalScore, earnedXP, badgeUnlocked: finalScore >= 80 };
    } catch (err) {
      console.error('Error submitting attempt:', err);
      throw new Error('Failed to submit challenge attempt');
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchActiveChallenge(),
        fetchUserStats(),
        fetchAttemptHistory()
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
      // Don't set error - allow page to load with whatever data we have
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  useEffect(() => {
    if (activeChallenge) {
      fetchLeaderboard();
    }
  }, [activeChallenge]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!activeChallenge || !user) return;

    const channel = supabase
      .channel('challenge_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_attempts',
          filter: `challenge_id=eq.${activeChallenge.id}`
        },
        () => {
          fetchLeaderboard();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUserStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChallenge, user]);

  const value: ChallengeContextType = {
    activeChallenge,
    questions,
    userAttempt,
    userStats,
    leaderboard,
    attemptHistory,
    loading,
    error,
    startAttempt,
    submitAttempt,
    fetchLeaderboard,
    refreshData
  };

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  );
};

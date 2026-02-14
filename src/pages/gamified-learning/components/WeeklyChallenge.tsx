import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

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

interface WeeklyChallengeProps {
  challenge: WeeklyChallenge | null;
}

export const WeeklyChallenge = ({ challenge }: WeeklyChallengeProps) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!challenge) return;

    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const deadline = new Date(challenge.deadline).getTime();
      const difference = deadline - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      } else {
        setTimeLeft('Expired');
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [challenge]);

  if (!challenge) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-calendar-line text-white/50 text-2xl" />
          </div>
          <p className="text-white/60">No active weekly challenge</p>
          <p className="text-white/40 text-sm">New challenges coming soon!</p>
        </div>
      </motion.div>
    );
  }

  const progressPercentage = (challenge.progress / challenge.target_progress) * 100;
  const isCompleted = challenge.status === 'completed';
  const isExpired = challenge.status === 'expired' || timeLeft === 'Expired';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isCompleted 
              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
              : isExpired
              ? 'bg-gradient-to-r from-gray-400 to-gray-500'
              : 'bg-gradient-to-r from-blue-400 to-purple-500'
          }`}>
            <i className={`text-white text-lg ${
              isCompleted ? 'ri-trophy-line' : 'ri-calendar-check-line'
            }`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Weekly Challenge</h3>
            <p className="text-white/70 text-sm">
              {challenge.progress} / {challenge.target_progress} completed
            </p>
          </div>
        </div>

        {/* Time Left */}
        <div className="text-right">
          <div className={`text-sm font-medium ${
            isExpired ? 'text-red-400' : 'text-white/70'
          }`}>
            {isExpired ? 'Expired' : 'Time Left'}
          </div>
          <div className={`text-lg font-bold ${
            isExpired ? 'text-red-400' : 'text-white'
          }`}>
            {timeLeft}
          </div>
        </div>
      </div>

      {/* Challenge Details */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-2">{challenge.title}</h4>
        <p className="text-white/70 text-sm mb-4">{challenge.description}</p>

        {/* Progress Bar */}
        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/70 text-sm">Progress</span>
            <span className="text-white font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          
          <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full ${
                isCompleted
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : 'bg-gradient-to-r from-blue-400 to-purple-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            
            {/* Animated glow effect */}
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full blur-sm ${
                isCompleted
                  ? 'bg-gradient-to-r from-green-400/50 to-emerald-500/50'
                  : 'bg-gradient-to-r from-blue-400/50 to-purple-500/50'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Reward Section */}
      <div className={`p-4 rounded-xl border ${
        isCompleted
          ? 'bg-green-500/20 border-green-400/30'
          : isExpired
          ? 'bg-gray-500/20 border-gray-400/30'
          : 'bg-blue-500/20 border-blue-400/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isCompleted
                ? 'bg-green-500'
                : isExpired
                ? 'bg-gray-500'
                : 'bg-blue-500'
            }`}>
              <i className="ri-gift-line text-white text-sm" />
            </div>
            <div>
              <h5 className="font-semibold text-white">Challenge Reward</h5>
              <p className="text-white/70 text-sm">
                {isCompleted ? 'Earned!' : isExpired ? 'Missed' : 'Available upon completion'}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
            isCompleted
              ? 'bg-green-500/20 text-green-300'
              : isExpired
              ? 'bg-gray-500/20 text-gray-300'
              : 'bg-blue-500/20 text-blue-300'
          }`}>
            <i className="ri-star-line text-xs" />
            <span>{challenge.reward_xp} XP</span>
          </div>
        </div>
      </div>

      {/* Completion Animation */}
      {isCompleted && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
        >
          <i className="ri-trophy-line text-white text-lg" />
        </motion.div>
      )}
    </motion.div>
  );
};
import { motion, AnimatePresence } from 'framer-motion';

interface DailyGoal {
  id: string;
  title: string;
  description: string;
  reward_xp: number;
  status: 'pending' | 'completed';
  goal_date: string;
}

interface DailyGoalsProps {
  goals: DailyGoal[];
  onCompleteGoal: (goalId: string, rewardXp: number) => void;
}

export const DailyGoals = ({ goals, onCompleteGoal }: DailyGoalsProps) => {
  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const totalGoals = goals.length;
  const progressPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
            <i className="ri-target-line text-white text-lg" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Daily Goals</h3>
            <p className="text-white/70 text-sm">
              {completedGoals} of {totalGoals} completed
            </p>
          </div>
        </div>
        
        {/* Progress Circle */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
              fill="none"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              stroke="url(#progressGradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progressPercentage / 100 }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                strokeDasharray: "175.929",
                strokeDashoffset: 175.929 * (1 - progressPercentage / 100),
              }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        <AnimatePresence>
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative p-4 rounded-xl border transition-all duration-300
                ${goal.status === 'completed'
                  ? 'bg-green-500/20 border-green-400/30 text-white'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {/* Checkbox */}
                  <motion.button
                    onClick={() => goal.status === 'pending' && onCompleteGoal(goal.id, goal.reward_xp)}
                    disabled={goal.status === 'completed'}
                    className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                      ${goal.status === 'completed'
                        ? 'bg-green-500 border-green-500'
                        : 'border-white/30 hover:border-amber-400 hover:bg-amber-400/20'
                      }
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {goal.status === 'completed' && (
                      <motion.i
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ri-check-line text-white text-sm"
                      />
                    )}
                  </motion.button>

                  {/* Goal Content */}
                  <div className="flex-1">
                    <h4 className={`font-semibold ${goal.status === 'completed' ? 'text-white line-through' : 'text-white'}`}>
                      {goal.title}
                    </h4>
                    <p className={`text-sm ${goal.status === 'completed' ? 'text-white/70' : 'text-white/60'}`}>
                      {goal.description}
                    </p>
                  </div>
                </div>

                {/* XP Reward */}
                <div className="flex items-center space-x-2">
                  <div className={`
                    px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1
                    ${goal.status === 'completed'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-amber-500/20 text-amber-300'
                    }
                  `}>
                    <i className="ri-star-line text-xs" />
                    <span>{goal.reward_xp} XP</span>
                  </div>
                </div>
              </div>

              {/* Completion Animation */}
              {goal.status === 'completed' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center"
                >
                  <i className="ri-trophy-line text-white text-sm" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {goals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-target-line text-white/50 text-2xl" />
            </div>
            <p className="text-white/60">No daily goals available</p>
            <p className="text-white/40 text-sm">Check back tomorrow for new challenges!</p>
          </motion.div>
        )}
      </div>

      {/* Daily Streak Bonus */}
      {completedGoals === totalGoals && totalGoals > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-xl"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <i className="ri-fire-line text-white text-sm" />
            </div>
            <div>
              <h4 className="font-semibold text-white">All Goals Completed!</h4>
              <p className="text-amber-200 text-sm">You're on fire! Keep up the streak tomorrow.</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
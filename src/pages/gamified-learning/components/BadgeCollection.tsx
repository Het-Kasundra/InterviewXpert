import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

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

interface BadgeCollectionProps {
  badges: Badge[];
}

export const BadgeCollection = ({ badges }: BadgeCollectionProps) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const unlockedBadges = badges.filter(badge => badge.unlocked);
  const lockedBadges = badges.filter(badge => !badge.unlocked);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
            <i className="ri-award-line text-white text-lg" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Badge Collection</h3>
            <p className="text-white/70 text-sm">
              {unlockedBadges.length} of {badges.length} earned
            </p>
          </div>
        </div>
        
        {/* Progress Ring */}
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
              fill="none"
            />
            <motion.circle
              cx="24"
              cy="24"
              r="20"
              stroke="url(#badgeGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: badges.length > 0 ? unlockedBadges.length / badges.length : 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                strokeDasharray: "125.664",
                strokeDashoffset: 125.664 * (1 - (badges.length > 0 ? unlockedBadges.length / badges.length : 0)),
              }}
            />
            <defs>
              <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              {badges.length > 0 ? Math.round((unlockedBadges.length / badges.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Unlocked Badges */}
        {unlockedBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedBadge(badge)}
            className="relative group cursor-pointer"
          >
            <div className="bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30 rounded-xl p-4 hover:from-amber-400/30 hover:to-orange-500/30 transition-all duration-300">
              <div className="text-center">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(245, 158, 11, 0.5)',
                      '0 0 30px rgba(245, 158, 11, 0.8)',
                      '0 0 20px rgba(245, 158, 11, 0.5)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <i className={`${badge.icon} text-white text-lg`} />
                </motion.div>
                <h4 className="font-semibold text-white text-sm mb-1">{badge.title}</h4>
                <p className="text-amber-300 text-xs">{badge.xp_value} XP</p>
              </div>
              
              {/* Unlock date */}
              {badge.unlocked_at && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <i className="ri-check-line text-white text-xs" />
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Locked Badges */}
        {lockedBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (unlockedBadges.length + index) * 0.1 }}
            onClick={() => setSelectedBadge(badge)}
            className="relative group cursor-pointer"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2 grayscale">
                  <i className={`${badge.icon} text-gray-400 text-lg`} />
                </div>
                <h4 className="font-semibold text-gray-400 text-sm mb-1">{badge.title}</h4>
                <p className="text-gray-500 text-xs">{badge.xp_value} XP</p>
              </div>
              
              {/* Lock icon */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                <i className="ri-lock-line text-gray-400 text-xs" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {badges.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-award-line text-white/50 text-2xl" />
          </div>
          <p className="text-white/60">No badges available</p>
          <p className="text-white/40 text-sm">Complete activities to earn badges!</p>
        </div>
      )}

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-white/20 rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  selectedBadge.unlocked
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                    : 'bg-gray-600 grayscale'
                }`}>
                  <i className={`${selectedBadge.icon} text-2xl ${
                    selectedBadge.unlocked ? 'text-white' : 'text-gray-400'
                  }`} />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{selectedBadge.title}</h3>
                <p className="text-white/70 text-sm mb-4">{selectedBadge.description}</p>
                
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
                  selectedBadge.unlocked
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-gray-500/20 text-gray-300'
                }`}>
                  <i className="ri-star-line" />
                  <span>{selectedBadge.xp_value} XP</span>
                </div>
                
                {selectedBadge.unlocked && selectedBadge.unlocked_at && (
                  <p className="text-green-400 text-xs mt-3">
                    Unlocked on {new Date(selectedBadge.unlocked_at).toLocaleDateString()}
                  </p>
                )}
                
                {!selectedBadge.unlocked && (
                  <p className="text-gray-400 text-xs mt-3">
                    Complete the requirements to unlock this badge
                  </p>
                )}
              </div>
              
              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
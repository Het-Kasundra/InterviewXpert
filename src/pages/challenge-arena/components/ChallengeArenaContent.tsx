import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChallengeArena } from '../../../contexts/ChallengeProvider';
import ChallengeHeader from './ChallengeHeader';
import ActiveChallengeCard from './ActiveChallengeCard';
import CountdownCard from './CountdownCard';
import StatsCard from './StatsCard';
import ChallengeDetails from './ChallengeDetails';
import AttemptPanel from './AttemptPanel';
import Leaderboard from './Leaderboard';
import AttemptHistory from './AttemptHistory';
import EmptyState from './EmptyState';
import { ChallengeGenerator } from './ChallengeGenerator';

const ChallengeArenaContent = () => {
  const { activeChallenge, refreshData } = useChallengeArena();
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'rewards'>('overview');
  const [showAttemptPanel, setShowAttemptPanel] = useState(false);

  // If no active challenge, show empty state instead of blank page
  if (!activeChallenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with refresh button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                AI Challenge Arena
              </h1>
              <p className="text-slate-400">
                Weekly challenges to test your skills
              </p>
            </div>
            <motion.button
              onClick={refreshData}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <i className="ri-refresh-line"></i>
              Refresh
            </motion.button>
          </div>

          {/* AI Challenge Generator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <ChallengeGenerator />
          </motion.div>

          {/* Empty State */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
            <EmptyState />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <ChallengeHeader />

        {/* Top Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <ActiveChallengeCard onStartAttempt={() => setShowAttemptPanel(true)} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <CountdownCard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <StatsCard />
          </motion.div>
        </div>

        {/* AI Challenge Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ChallengeGenerator />
        </motion.div>

        {/* Challenge Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ChallengeDetails 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="xl:col-span-2"
          >
            <Leaderboard />
          </motion.div>

          {/* Attempt History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="xl:col-span-1"
          >
            <AttemptHistory />
          </motion.div>
        </div>

        {/* Attempt Panel Modal */}
        <AnimatePresence>
          {showAttemptPanel && (
            <AttemptPanel onClose={() => setShowAttemptPanel(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChallengeArenaContent;
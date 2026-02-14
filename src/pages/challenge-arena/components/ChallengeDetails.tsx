import { motion } from 'framer-motion';
import { useChallengeArena } from '../../../contexts/ChallengeProvider';

interface ChallengeDetailsProps {
  activeTab: 'overview' | 'rules' | 'rewards';
  onTabChange: (tab: 'overview' | 'rules' | 'rewards') => void;
}

const ChallengeDetails = ({ activeTab, onTabChange }: ChallengeDetailsProps) => {
  const { activeChallenge, questions, loading } = useChallengeArena();

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex gap-4">
            <div className="h-10 bg-slate-700 rounded w-24"></div>
            <div className="h-10 bg-slate-700 rounded w-24"></div>
            <div className="h-10 bg-slate-700 rounded w-24"></div>
          </div>
          <div className="h-32 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!activeChallenge) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center"
      >
        <div className="text-slate-400">No active challenge to display details</div>
      </motion.div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-eye-line' },
    { id: 'rules', label: 'Rules', icon: 'ri-file-list-line' },
    { id: 'rewards', label: 'Rewards', icon: 'ri-gift-line' }
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl"
    >
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-slate-900/50 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Challenge Overview</h3>
              <p className="text-slate-300 leading-relaxed">{activeChallenge.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/30 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <i className="ri-question-line text-blue-400"></i>
                  <span className="text-white font-medium">Questions</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">{questions.length}</div>
                <div className="text-slate-400 text-sm">Total questions</div>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <i className="ri-timer-line text-amber-400"></i>
                  <span className="text-white font-medium">Time Limit</span>
                </div>
                <div className="text-2xl font-bold text-amber-400">
                  {Math.round(activeChallenge.time_limit_s / 60)}
                </div>
                <div className="text-slate-400 text-sm">Minutes</div>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <i className="ri-scales-line text-green-400"></i>
                  <span className="text-white font-medium">Scoring</span>
                </div>
                <div className="text-2xl font-bold text-green-400">Weighted</div>
                <div className="text-slate-400 text-sm">Partial credit</div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Question Types</h4>
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <div key={question.id} className="flex items-center justify-between bg-slate-700/20 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-white">{question.type}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        question.type === 'MCQ' ? 'bg-green-400/20 text-green-400' :
                        question.type === 'Scenario' ? 'bg-blue-400/20 text-blue-400' :
                        'bg-purple-400/20 text-purple-400'
                      }`}>
                        {question.type === 'MCQ' ? 'Multiple Choice' :
                         question.type === 'Scenario' ? 'Short Answer' : 'Code Review'}
                      </span>
                    </div>
                    <div className="text-slate-400 text-sm">Weight: {question.weight}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Challenge Rules</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center mt-0.5">1</div>
                  <div>
                    <div className="text-white font-medium">One Attempt Per Week</div>
                    <div className="text-slate-400 text-sm">You can only attempt each challenge once unless an admin grants a retry.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center mt-0.5">2</div>
                  <div>
                    <div className="text-white font-medium">Time Limit Enforcement</div>
                    <div className="text-slate-400 text-sm">You must complete all questions within the {Math.round(activeChallenge.time_limit_s / 60)}-minute time limit.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center mt-0.5">3</div>
                  <div>
                    <div className="text-white font-medium">Partial Scoring</div>
                    <div className="text-slate-400 text-sm">Questions are weighted differently. Scenario and code questions may award partial credit.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center mt-0.5">4</div>
                  <div>
                    <div className="text-white font-medium">Anti-Cheat Policy</div>
                    <div className="text-slate-400 text-sm">No external assistance, collaboration, or use of AI tools during the challenge.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center mt-0.5">5</div>
                  <div>
                    <div className="text-white font-medium">Progress Saving</div>
                    <div className="text-slate-400 text-sm">Your progress is automatically saved. You can safely refresh the page during an attempt.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center mt-0.5">6</div>
                  <div>
                    <div className="text-white font-medium">Leaderboard Ranking</div>
                    <div className="text-slate-400 text-sm">Rankings are based on score first, then time taken as a tiebreaker.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-information-line text-amber-400"></i>
                <span className="text-amber-400 font-medium">Important Note</span>
              </div>
              <p className="text-amber-200 text-sm">
                Challenges are designed to test your knowledge and problem-solving skills. Take your time to read each question carefully and provide thoughtful answers.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Rewards & Recognition</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* XP Rewards */}
                <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-700/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <i className="ri-star-line text-xl text-amber-400"></i>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">Experience Points</h4>
                      <p className="text-amber-200 text-sm">Earn XP based on performance</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white">Maximum XP:</span>
                      <span className="text-amber-400 font-bold">{activeChallenge.reward_xp}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white">Minimum XP:</span>
                      <span className="text-amber-400 font-bold">{Math.round(activeChallenge.reward_xp * 0.1)}</span>
                    </div>
                    <div className="text-slate-400 text-sm">
                      XP = Base Reward × (Your Score ÷ 100)
                    </div>
                  </div>
                </div>

                {/* Badge Rewards */}
                {activeChallenge.badge && (
                  <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-700/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <img 
                        src={activeChallenge.badge.art_url} 
                        alt={activeChallenge.badge.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="text-lg font-semibold text-white">{activeChallenge.badge.name}</h4>
                        <p className="text-purple-200 text-sm">Unlock with 80%+ score</p>
                      </div>
                    </div>
                    
                    <p className="text-slate-300 text-sm mb-3">{activeChallenge.badge.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white">Bonus XP:</span>
                      <span className="text-purple-400 font-bold">+{activeChallenge.badge.xp_value}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Streak Rewards */}
            <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-700/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <i className="ri-fire-line text-xl text-blue-400"></i>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Streak Bonuses</h4>
                  <p className="text-blue-200 text-sm">Maintain your weekly challenge streak</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">3</div>
                  <div className="text-slate-400 text-xs">Week Streak</div>
                  <div className="text-blue-300 text-sm">+50 XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">5</div>
                  <div className="text-slate-400 text-xs">Week Streak</div>
                  <div className="text-blue-300 text-sm">+100 XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">10</div>
                  <div className="text-slate-400 text-xs">Week Streak</div>
                  <div className="text-blue-300 text-sm">+250 XP</div>
                </div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-lightbulb-line text-green-400"></i>
                <span className="text-green-400 font-medium">Pro Tip</span>
              </div>
              <p className="text-green-200 text-sm">
                Scoring 50% or higher maintains your streak. Aim for 80% to unlock badges and maximize your XP gains!
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ChallengeDetails;
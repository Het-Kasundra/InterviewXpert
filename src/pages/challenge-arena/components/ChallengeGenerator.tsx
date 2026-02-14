import { useState } from 'react';
import { generateChallenge, getDomainChallenges, adaptChallengeDifficulty, type ChallengeSuggestion } from '../../../lib/aiChallengeService';
import { useChallengeArena } from '../../../contexts/ChallengeProvider';
import { motion } from 'framer-motion';

export const ChallengeGenerator = () => {
  const { userStats, attemptHistory } = useChallengeArena();
  const [domain, setDomain] = useState('Web Development');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [generatedChallenge, setGeneratedChallenge] = useState<ChallengeSuggestion | null>(null);
  const [domainChallenges, setDomainChallenges] = useState<ChallengeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'domain' | 'adapt'>('generate');

  const handleGenerateChallenge = async () => {
    setLoading(true);
    try {
      const userPerformance = {
        avgScore: userStats?.total_xp ? Math.min(100, (userStats.total_xp / 1000) * 10) : 50,
        weakAreas: [],
        strongAreas: [],
      };

      const challenge = await generateChallenge({
        domain,
        difficulty,
        userPerformance,
      });

      setGeneratedChallenge(challenge);
      setActiveTab('generate');
    } catch (error) {
      console.error('Error generating challenge:', error);
      alert('Failed to generate challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetDomainChallenges = async () => {
    setLoading(true);
    try {
      const challenges = await getDomainChallenges(domain, 3);
      setDomainChallenges(challenges);
      setActiveTab('domain');
    } catch (error) {
      console.error('Error getting domain challenges:', error);
      alert('Failed to load domain challenges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdaptDifficulty = async () => {
    setLoading(true);
    try {
      const recentScores = attemptHistory
        .slice(0, 5)
        .map(a => a.score || 0)
        .filter(s => s > 0);

      const adaptation = await adaptChallengeDifficulty(
        {
          avgScore: recentScores.length > 0
            ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
            : 50,
          recentScores,
          weakAreas: [],
          strongAreas: [],
        },
        difficulty
      );

      alert(`Recommended Difficulty: ${adaptation.recommendedDifficulty}\n\n${adaptation.reason}`);
      setDifficulty(adaptation.recommendedDifficulty);
    } catch (error) {
      console.error('Error adapting difficulty:', error);
      alert('Failed to adapt difficulty. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">AI Challenge Generator</h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-slate-700">
        {[
          { id: 'generate', label: 'Generate', icon: '✨' },
          { id: 'domain', label: 'Domain Challenges', icon: '🎯' },
          { id: 'adapt', label: 'Adapt Difficulty', icon: '📊' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Domain</label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="Web Development">Web Development</option>
            <option value="Backend Development">Backend Development</option>
            <option value="Full Stack">Full Stack</option>
            <option value="Data Science">Data Science</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="DevOps">DevOps</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        {activeTab === 'generate' && (
          <button
            onClick={handleGenerateChallenge}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Generating...' : 'Generate Challenge'}
          </button>
        )}
        {activeTab === 'domain' && (
          <button
            onClick={handleGetDomainChallenges}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Loading...' : 'Get Domain Challenges'}
          </button>
        )}
        {activeTab === 'adapt' && (
          <button
            onClick={handleAdaptDifficulty}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Analyzing...' : 'Adapt Difficulty'}
          </button>
        )}
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <p className="mt-4 text-slate-400">Generating challenge...</p>
        </div>
      )}

      {!loading && activeTab === 'generate' && generatedChallenge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-lg font-semibold text-white">{generatedChallenge.title}</h4>
            <span className={`px-2 py-1 text-xs font-medium rounded border ${getDifficultyColor(generatedChallenge.difficulty)}`}>
              {generatedChallenge.difficulty}
            </span>
          </div>
          <p className="text-slate-300 mb-3">{generatedChallenge.description}</p>
          <div className="mb-3">
            <p className="text-sm font-medium text-slate-400 mb-1">Topics:</p>
            <div className="flex flex-wrap gap-2">
              {generatedChallenge.topics.map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-400">
            <span className="font-medium">Why Relevant:</span> {generatedChallenge.whyRelevant}
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Estimated Time: {generatedChallenge.estimatedTime} minutes
          </p>
        </motion.div>
      )}

      {!loading && activeTab === 'domain' && domainChallenges.length > 0 && (
        <div className="space-y-3">
          {domainChallenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-white">{challenge.title}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded border ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty}
                </span>
              </div>
              <p className="text-sm text-slate-300 mb-2">{challenge.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>⏱️ {challenge.estimatedTime} min</span>
                <span>🎯 {challenge.skills.join(', ')}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};


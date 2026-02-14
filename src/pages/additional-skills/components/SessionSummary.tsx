import { useState, useEffect } from 'react';

interface SessionSummaryProps {
  sessionData: any;
  onClose: () => void;
}

export const SessionSummary = ({ sessionData, onClose }: SessionSummaryProps) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const getGradeBand = (score: number) => {
    if (score >= 95) return { grade: 'A+', color: 'from-green-500 to-emerald-600', emoji: '🏆' };
    if (score >= 90) return { grade: 'A', color: 'from-green-500 to-green-600', emoji: '🌟' };
    if (score >= 85) return { grade: 'A-', color: 'from-blue-500 to-green-500', emoji: '⭐' };
    if (score >= 80) return { grade: 'B+', color: 'from-blue-500 to-blue-600', emoji: '👍' };
    if (score >= 75) return { grade: 'B', color: 'from-blue-400 to-blue-500', emoji: '👌' };
    if (score >= 70) return { grade: 'B-', color: 'from-yellow-500 to-blue-400', emoji: '💪' };
    if (score >= 65) return { grade: 'C+', color: 'from-yellow-500 to-yellow-600', emoji: '📈' };
    if (score >= 60) return { grade: 'C', color: 'from-orange-400 to-yellow-500', emoji: '🎯' };
    return { grade: 'C-', color: 'from-orange-500 to-red-500', emoji: '🚀' };
  };

  const gradeBand = getGradeBand(sessionData.overall_score);

  const rubricAverages = {
    clarity: 0.75,
    relevance: 0.82,
    structure: 0.68,
    communication: 0.79,
    accuracy: 0.71
  };

  const domainScores = sessionData.domains.reduce((acc, domain) => {
    const domainQuestions = sessionData.details.filter(d => d.domain === domain);
    const avgScore = domainQuestions.reduce((sum, q) => sum + (q.correct ? 1 : 0.7), 0) / domainQuestions.length;
    acc[domain] = avgScore * 100;
    return acc;
  }, {});

  const strengths = Object.entries(domainScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([domain]) => domain.replace('-', ' '));

  const weaknesses = Object.entries(domainScores)
    .sort(([,a], [,b]) => a - b)
    .slice(0, 2)
    .map(([domain]) => domain.replace('-', ' '));

  const suggestions = [
    "Practice the STAR method for behavioral questions to improve structure and clarity",
    "Focus on quantifying your achievements with specific metrics and outcomes",
    "Develop domain-specific vocabulary to demonstrate deeper expertise",
    "Work on active listening skills to better understand stakeholder needs",
    "Practice explaining complex concepts in simple, accessible language"
  ];

  return (
    <div className="space-y-8">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-blue-500/20 to-purple-500/20 animate-pulse"></div>
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-blue-500/10 to-purple-500/10 rounded-3xl"></div>
        <div className="relative p-8">
          <div className="text-6xl mb-4">{gradeBand.emoji}</div>
          <h1 className="text-4xl font-bold mb-2">Assessment Complete!</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            You've leveled up your superpowers!
          </p>
        </div>
      </div>

      {/* Score Card */}
      <div className={`bg-gradient-to-r ${gradeBand.color} rounded-3xl p-8 text-white text-center shadow-2xl transform hover:scale-105 transition-all duration-200`}>
        <div className="text-6xl font-bold mb-2">{sessionData.overall_score}%</div>
        <div className="text-2xl font-semibold mb-2">Grade: {gradeBand.grade}</div>
        <div className="flex items-center justify-center space-x-6 text-sm opacity-90">
          <span>+{sessionData.flags?.xp || 0} XP</span>
          <span>🔥 {sessionData.flags?.streak || 0} Streak</span>
          <span>⏱️ {Math.floor(sessionData.duration_s / 60)}m {sessionData.duration_s % 60}s</span>
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Radar Chart Simulation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <i className="ri-radar-line mr-2 text-blue-500" />
            Skill Breakdown
          </h3>
          <div className="space-y-4">
            {Object.entries(rubricAverages).map(([skill, score]) => (
              <div key={skill} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300 capitalize">{skill}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{Math.round(score * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${score * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Domain Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <i className="ri-bar-chart-box-line mr-2 text-green-500" />
            Domain Scores
          </h3>
          <div className="space-y-4">
            {Object.entries(domainScores).map(([domain, score]) => (
              <div key={domain} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300 capitalize">{domain.replace('-', ' ')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{Math.round(score)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
          <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-4 flex items-center">
            <i className="ri-trophy-line mr-2" />
            Your Strengths
          </h3>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-center text-green-700 dark:text-green-300">
                <i className="ri-check-line mr-2" />
                <span className="capitalize">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
          <h3 className="text-xl font-bold text-orange-800 dark:text-orange-200 mb-4 flex items-center">
            <i className="ri-focus-3-line mr-2" />
            Growth Areas
          </h3>
          <ul className="space-y-2">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-center text-orange-700 dark:text-orange-300">
                <i className="ri-arrow-up-line mr-2" />
                <span className="capitalize">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Personalized Suggestions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <i className="ri-lightbulb-line mr-2 text-yellow-500" />
          Your Power-Up Plan
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {suggestions.slice(0, 4).map((suggestion, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-blue-800 dark:text-blue-200 text-sm">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Review */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <i className="ri-file-list-3-line mr-2 text-purple-500" />
          Question Review
        </h3>
        <div className="space-y-6">
          {sessionData.details.map((detail, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    detail.domain === 'finance' ? 'bg-green-100 text-green-700' :
                    detail.domain === 'soft-skills' ? 'bg-pink-100 text-pink-700' :
                    detail.domain === 'marketing' ? 'bg-purple-100 text-purple-700' :
                    detail.domain === 'sales' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {detail.domain.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{detail.type.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {detail.correct !== null && (
                    <i className={`ri-${detail.correct ? 'check' : 'close'}-line text-${detail.correct ? 'green' : 'red'}-500`} />
                  )}
                  <span className="text-sm text-gray-500">{detail.time_s}s</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Question:</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{detail.prompt}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Your Answer:</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {detail.answer_text || detail.transcript_text || detail.mcq_choice || 'No answer provided'}
                  </p>
                </div>
                
                {detail.rationale && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Explanation:</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{detail.rationale}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <i className="ri-arrow-left-line mr-2" />
          Back to Skills
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold hover:from-yellow-600 hover:to-orange-700 transition-all whitespace-nowrap"
        >
          <i className="ri-refresh-line mr-2" />
          Retake Assessment
        </button>
      </div>
    </div>
  );
};
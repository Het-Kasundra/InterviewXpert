import { motion } from 'framer-motion';
import { SkillNode } from '../types';

interface NodeDetailPanelProps {
  node: SkillNode;
  onClose: () => void;
}

export const NodeDetailPanel = ({ node, onClose }: NodeDetailPanelProps) => {
  const getCategoryColor = (category: string): string => {
    const colors = {
      'Technical': 'from-blue-500 to-blue-600',
      'Soft Skills': 'from-yellow-500 to-orange-500',
      'Additional Skills': 'from-purple-500 to-purple-600',
      'Achievements': 'from-green-500 to-emerald-600',
      'Learning': 'from-pink-500 to-rose-600'
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getScoreGrade = (score: number): { grade: string; color: string } => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-400' };
    if (score >= 80) return { grade: 'A', color: 'text-green-300' };
    if (score >= 70) return { grade: 'B+', color: 'text-blue-400' };
    if (score >= 60) return { grade: 'B', color: 'text-blue-300' };
    if (score >= 50) return { grade: 'C+', color: 'text-yellow-400' };
    return { grade: 'C', color: 'text-orange-400' };
  };

  const scoreGrade = getScoreGrade(node.score);

  const rubricData = [
    { name: 'Clarity', value: node.rubric.clarity || 0 },
    { name: 'Structure', value: node.rubric.structure || 0 },
    { name: 'Communication', value: node.rubric.communication || 0 },
    { name: 'Accuracy', value: node.rubric.accuracy || 0 },
    ...(node.rubric.depth ? [{ name: 'Depth', value: node.rubric.depth }] : []),
    ...(node.rubric.relevance ? [{ name: 'Relevance', value: node.rubric.relevance }] : [])
  ];

  const strengths = rubricData
    .filter(item => item.value >= 7)
    .map(item => item.name);

  const weaknesses = rubricData
    .filter(item => item.value < 5)
    .map(item => item.name);

  const suggestions = [
    node.category === 'Technical' 
      ? 'Practice coding problems daily to improve technical depth'
      : 'Focus on structured communication using frameworks like STAR',
    node.score < 70 
      ? 'Review fundamentals and take practice assessments'
      : 'Challenge yourself with advanced scenarios',
    'Join study groups or find a practice partner',
    'Set specific improvement goals for next session'
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="relative bg-black/80 backdrop-blur-md border border-white/20 rounded-2xl 
                 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ duration: 0.3, type: "spring", damping: 25 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <motion.div
                className={`px-3 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(node.category)} 
                          text-white text-sm font-semibold`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                {node.category}
              </motion.div>
              {node.streakDays > 0 && (
                <motion.div
                  className="flex items-center space-x-1 text-orange-400"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <i className="ri-fire-fill" />
                  <span className="text-sm font-semibold">{node.streakDays} day streak</span>
                </motion.div>
              )}
            </div>
            <motion.h2
              className="text-2xl font-bold text-white mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {node.name}
            </motion.h2>
            <p className="text-white/60 text-sm">
              Last updated: {node.lastUpdated.toLocaleDateString()}
            </p>
          </div>
          <motion.button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 
                     hover:text-white transition-all duration-160"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <i className="ri-close-line text-lg" />
          </motion.button>
        </div>

        {/* Score and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center">
              <div className={`text-3xl font-bold ${scoreGrade.color} mb-1`}>
                {scoreGrade.grade}
              </div>
              <div className="text-white text-lg font-semibold mb-1">
                {node.score.toFixed(1)}%
              </div>
              <div className="text-white/60 text-sm">Overall Score</div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {node.xp.toLocaleString()}
              </div>
              <div className="text-white/60 text-sm">XP Earned</div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${
                node.improvement >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {node.improvement >= 0 ? '+' : ''}{node.improvement.toFixed(1)}%
              </div>
              <div className="text-white/60 text-sm">Improvement</div>
            </div>
          </motion.div>
        </div>

        {/* Rubric Chart */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <i className="ri-radar-line mr-2" />
            Skill Breakdown
          </h3>
          <div className="space-y-3">
            {rubricData.map((item, index) => (
              <motion.div
                key={item.name}
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="w-20 text-white/80 text-sm">{item.name}</div>
                <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / 10) * 100}%` }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
                  />
                </div>
                <div className="w-8 text-white text-sm text-right">
                  {item.value.toFixed(1)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h3 className="text-green-400 font-semibold mb-3 flex items-center">
              <i className="ri-thumb-up-line mr-2" />
              Strengths
            </h3>
            <div className="space-y-2">
              {strengths.length > 0 ? (
                strengths.map((strength, index) => (
                  <motion.div
                    key={strength}
                    className="flex items-center space-x-2 text-white/80"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <i className="ri-check-line text-green-400" />
                    <span className="text-sm">{strength}</span>
                  </motion.div>
                ))
              ) : (
                <p className="text-white/60 text-sm">Keep practicing to develop strengths!</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-orange-400 font-semibold mb-3 flex items-center">
              <i className="ri-thumb-down-line mr-2" />
              Areas to Improve
            </h3>
            <div className="space-y-2">
              {weaknesses.length > 0 ? (
                weaknesses.map((weakness, index) => (
                  <motion.div
                    key={weakness}
                    className="flex items-center space-x-2 text-white/80"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                  >
                    <i className="ri-arrow-up-line text-orange-400" />
                    <span className="text-sm">{weakness}</span>
                  </motion.div>
                ))
              ) : (
                <p className="text-white/60 text-sm">Great job! No major weaknesses identified.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Suggestions */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h3 className="text-blue-400 font-semibold mb-3 flex items-center">
            <i className="ri-lightbulb-line mr-2" />
            Personalized Suggestions
          </h3>
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-2 text-white/80"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 + index * 0.1 }}
              >
                <i className="ri-star-line text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{suggestion}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <motion.button
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 
                     text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 
                     hover:to-purple-600 transition-all duration-160"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="ri-play-line" />
            <span>Practice</span>
          </motion.button>

          <motion.button
            className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg 
                     font-semibold hover:bg-white/20 transition-all duration-160 border border-white/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="ri-bar-chart-line" />
            <span>View Reports</span>
          </motion.button>

          <motion.button
            className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg 
                     font-semibold hover:bg-white/20 transition-all duration-160 border border-white/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="ri-history-line" />
            <span>History</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
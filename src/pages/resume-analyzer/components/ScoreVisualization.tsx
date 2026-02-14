import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScoreBreakdown } from '../types';

interface ScoreVisualizationProps {
  score: number;
  breakdown: ScoreBreakdown;
}

export const ScoreVisualization = ({ score, breakdown }: ScoreVisualizationProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-green-600';
    if (score >= 60) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const circumference = 2 * Math.PI * 90;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <motion.div
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overall Score Circle */}
        <div className="flex flex-col items-center justify-center">
          <motion.h3
            className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Overall Resume Score
          </motion.h3>
          
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-gray-200 dark:text-gray-700"
              />
              
              {/* Progress circle */}
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                stroke="url(#scoreGradient)"
                strokeWidth="12"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
              />
              
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'} />
                  <stop offset="100%" stopColor={score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#dc2626'} />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className={`text-5xl font-bold ${getScoreColor(score)}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
              >
                {Math.round(animatedScore)}
              </motion.span>
              <span className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                / 100
              </span>
            </div>
          </div>
          
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <p className={`text-lg font-semibold ${getScoreColor(score)}`}>
              {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {score >= 80 
                ? 'Your resume is well-optimized and ready for applications'
                : score >= 60 
                ? 'Your resume is solid but has room for improvement'
                : 'Your resume needs significant improvements to stand out'
              }
            </p>
          </motion.div>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-6">
          <motion.h3
            className="text-2xl font-bold text-gray-900 dark:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Score Breakdown
          </motion.h3>
          
          <div className="space-y-4">
            {Object.entries(breakdown).map(([key, value], index) => {
              const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
              const percentage = `${Math.round((value / 100) * 100)}%`;
              
              return (
                <motion.div
                  key={key}
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {label}
                    </span>
                    <span className={`font-bold ${getScoreColor(value)}`}>
                      {value}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(value)}`}
                      initial={{ width: 0 }}
                      animate={{ width: percentage }}
                      transition={{ duration: 1.5, delay: 0.7 + index * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <motion.div
            className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <div className="flex items-start gap-3">
              <i className="ri-lightbulb-line text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                  Quick Tip
                </p>
                <p className="text-blue-700 dark:text-blue-400">
                  Focus on improving your lowest-scoring areas first for maximum impact on your overall score.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
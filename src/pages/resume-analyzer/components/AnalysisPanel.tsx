import { motion } from 'framer-motion';
import type { AnalysisFeedback } from '../types';

interface AnalysisPanelProps {
  analysis: AnalysisFeedback;
}

export const AnalysisPanel = ({ analysis }: AnalysisPanelProps) => {
  return (
    <motion.div
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <i className="ri-search-eye-line text-blue-600 dark:text-blue-400" />
          AI Analysis
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Detailed insights and feedback on your resume
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <i className="ri-thumb-up-line text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Strengths</h4>
          </div>
          <div className="space-y-3">
            {analysis.strengths.map((strength, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <i className="ri-check-line text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <p className="text-emerald-800 dark:text-emerald-300 text-sm">{strength}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Weaknesses */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <i className="ri-error-warning-line text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Areas for Improvement</h4>
          </div>
          <div className="space-y-3">
            {analysis.weaknesses.map((weakness, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <i className="ri-alert-line text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-amber-800 dark:text-amber-300 text-sm">{weakness}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Missing Elements */}
        {analysis.missingElements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <i className="ri-close-circle-line text-red-600 dark:text-red-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Missing Elements</h4>
            </div>
            <div className="space-y-3">
              {analysis.missingElements.map((element, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <i className="ri-subtract-line text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-800 dark:text-red-300 text-sm">{element}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          className="pt-4 border-t border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.button
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="ri-download-line" />
              Export Analysis
            </motion.button>
            <motion.button
              className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="ri-share-line" />
              Share Results
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
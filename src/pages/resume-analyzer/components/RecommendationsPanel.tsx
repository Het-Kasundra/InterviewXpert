import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Recommendation } from '../types';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

export const RecommendationsPanel = ({ recommendations }: RecommendationsPanelProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedRec, setExpandedRec] = useState<number | null>(null);

  const categories = ['all', 'Content Improvements', 'Format Enhancements', 'Keyword Optimization', 'Grammar Fixes'];
  
  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === selectedCategory);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Content Improvements': return 'ri-file-edit-line';
      case 'Format Enhancements': return 'ri-layout-line';
      case 'Keyword Optimization': return 'ri-search-line';
      case 'Grammar Fixes': return 'ri-spell-check-line';
      default: return 'ri-lightbulb-line';
    }
  };

  return (
    <motion.div
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <i className="ri-lightbulb-line text-blue-600 dark:text-blue-400" />
          Recommendations
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Personalized suggestions to improve your resume
        </p>
      </div>

      {/* Category Filter */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category === 'all' ? 'All Categories' : category}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {filteredRecommendations.map((rec, index) => (
              <motion.div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => setExpandedRec(expandedRec === index ? null : index)}
                  className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className={`${getCategoryIcon(rec.category)} text-blue-600 dark:text-blue-400`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{rec.description}</p>
                      </div>
                    </div>
                    <motion.i
                      className={`ri-arrow-down-s-line text-gray-400 transition-transform duration-200 ${
                        expandedRec === index ? 'rotate-180' : ''
                      }`}
                      animate={{ rotate: expandedRec === index ? 180 : 0 }}
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {expandedRec === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="pt-4 space-y-4">
                          {/* Before/After Example */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                                <i className="ri-close-line" />
                                Before
                              </label>
                              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-800 dark:text-red-300 font-mono">{rec.before}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                                <i className="ri-check-line" />
                                After
                              </label>
                              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-sm text-green-800 dark:text-green-300 font-mono">{rec.after}</p>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex justify-end">
                            <motion.button
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <i className="ri-magic-line" />
                              Apply Example
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredRecommendations.length === 0 && (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <i className="ri-check-double-line text-4xl text-green-500 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No recommendations in this category
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Your resume looks great in this area!
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
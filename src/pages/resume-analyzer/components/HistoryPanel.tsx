import { motion } from 'framer-motion';
import { ResumeAnalysis } from '../types';

interface HistoryPanelProps {
  analyses: ResumeAnalysis[];
  selectedAnalysis: ResumeAnalysis | null;
  onAnalysisSelect: (analysis: ResumeAnalysis) => void;
  onNewAnalysis: () => void;
}

export const HistoryPanel = ({ 
  analyses, 
  selectedAnalysis, 
  onAnalysisSelect, 
  onNewAnalysis 
}: HistoryPanelProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 dark:bg-emerald-900/30';
    if (score >= 60) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <motion.div
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden h-fit"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <i className="ri-history-line text-blue-600 dark:text-blue-400" />
          Analysis History
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Your previous resume analyses
        </p>
      </div>

      <div className="p-6">
        <motion.button
          onClick={onNewAnalysis}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mb-6"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <i className="ri-add-line" />
          New Analysis
        </motion.button>

        {analyses.length === 0 ? (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <i className="ri-file-list-line text-4xl text-gray-400 dark:text-gray-500 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No analyses yet
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Upload your first resume to get started with AI-powered analysis
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis, index) => (
              <motion.button
                key={analysis.id}
                onClick={() => onAnalysisSelect(analysis)}
                className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                  selectedAnalysis?.id === analysis.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {analysis.filename}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(analysis.created_at)}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreBackground(analysis.score)} ${getScoreColor(analysis.score)}`}>
                    {Math.round(analysis.score)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <i className="ri-file-text-line" />
                  <span>Resume Analysis</span>
                  {selectedAnalysis?.id === analysis.id && (
                    <motion.i
                      className="ri-check-line text-blue-600 dark:text-blue-400 ml-auto"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {analyses.length > 0 && (
        <motion.div
          className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Total Analyses
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {analyses.length}
            </span>
          </div>
          
          {analyses.length > 0 && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600 dark:text-gray-400">
                Average Score
              </span>
              <span className={`font-semibold ${getScoreColor(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)}`}>
                {Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
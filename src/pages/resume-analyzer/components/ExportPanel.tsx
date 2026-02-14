import { motion } from 'framer-motion';
import { ExtractedData, AnalysisFeedback } from '../types';

interface ExportPanelProps {
  filename: string;
  extractedData: ExtractedData;
  analysis: AnalysisFeedback;
}

export const ExportPanel = ({ filename, extractedData, analysis }: ExportPanelProps) => {
  const handleExportPDF = () => {
    // Mock PDF export functionality
    console.log('Exporting analysis as PDF...');
    // In a real implementation, you would generate a PDF with the analysis data
  };

  const handleExportDOCX = () => {
    // Mock DOCX export functionality
    console.log('Exporting analysis as DOCX...');
    // In a real implementation, you would generate a DOCX with the analysis data
  };

  const handleShareResults = () => {
    // Mock share functionality
    console.log('Sharing results...');
    // In a real implementation, you would generate a shareable link or email
  };

  const handlePrintReport = () => {
    // Mock print functionality
    window.print();
  };

  return (
    <motion.div
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <i className="ri-download-line text-blue-600 dark:text-blue-400" />
          Export & Share
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Save your analysis results and share with others
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Export as PDF */}
          <motion.button
            onClick={handleExportPDF}
            className="p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg transition-all duration-200 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                <i className="ri-file-pdf-line text-2xl text-red-600 dark:text-red-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Export PDF</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete analysis report
              </p>
            </div>
          </motion.button>

          {/* Export as DOCX */}
          <motion.button
            onClick={handleExportDOCX}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition-all duration-200 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                <i className="ri-file-word-line text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Export DOCX</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Editable document format
              </p>
            </div>
          </motion.button>

          {/* Share Results */}
          <motion.button
            onClick={handleShareResults}
            className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg transition-all duration-200 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                <i className="ri-share-line text-2xl text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Share Link</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate shareable link
              </p>
            </div>
          </motion.button>

          {/* Print Report */}
          <motion.button
            onClick={handlePrintReport}
            className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg transition-all duration-200 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                <i className="ri-printer-line text-2xl text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Print Report</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Physical copy
              </p>
            </div>
          </motion.button>
        </div>

        {/* Quick Stats */}
        <motion.div
          className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analysis.overallScore}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {analysis.strengths.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Strengths</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {analysis.weaknesses.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Improvements</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {analysis.recommendations.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Recommendations</div>
            </div>
          </div>
        </motion.div>

        {/* File Info */}
        <motion.div
          className="mt-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <i className="ri-file-text-line" />
              <span>Analysis for: {filename}</span>
            </div>
            <div className="text-gray-500 dark:text-gray-500">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
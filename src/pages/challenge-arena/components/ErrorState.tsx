import { motion } from 'framer-motion';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-32 h-32 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mb-8">
        <i className="ri-error-warning-line text-6xl text-red-400"></i>
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-4">
        Something Went Wrong
      </h2>
      
      <p className="text-slate-400 text-lg mb-2 max-w-md">
        We encountered an error while loading the Challenge Arena.
      </p>
      
      <p className="text-red-400 text-sm mb-8 max-w-md font-mono bg-red-900/20 border border-red-700/30 rounded-lg p-3">
        {error}
      </p>
      
      <div className="flex items-center gap-4">
        <motion.button
          onClick={onRetry}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <i className="ri-refresh-line"></i>
          Try Again
        </motion.button>
        
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors"
        >
          <i className="ri-restart-line"></i>
          Reload Page
        </button>
      </div>
      
      <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6 max-w-md">
        <div className="flex items-center gap-3 mb-3">
          <i className="ri-customer-service-line text-blue-400"></i>
          <span className="text-white font-medium">Need Help?</span>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          If this problem persists, please contact our support team.
        </p>
        <button className="w-full bg-slate-700 text-white font-semibold py-2 rounded-lg hover:bg-slate-600 transition-colors">
          Contact Support
        </button>
      </div>
    </motion.div>
  );
};

export default ErrorState;
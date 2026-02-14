import { motion } from 'framer-motion';

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="h-10 bg-slate-700 rounded w-80 mb-2"></div>
              <div className="h-6 bg-slate-700 rounded w-48"></div>
            </div>
            <div className="h-12 bg-slate-700 rounded w-32"></div>
          </div>
        </div>

        {/* Top Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 h-80"
            >
              <div className="animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-700 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-slate-700 rounded w-32"></div>
                    <div className="h-4 bg-slate-700 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-20 bg-slate-700 rounded"></div>
                <div className="h-10 bg-slate-700 rounded"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Challenge Details Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
        >
          <div className="animate-pulse space-y-4">
            <div className="flex gap-4">
              <div className="h-10 bg-slate-700 rounded w-24"></div>
              <div className="h-10 bg-slate-700 rounded w-24"></div>
              <div className="h-10 bg-slate-700 rounded w-24"></div>
            </div>
            <div className="h-32 bg-slate-700 rounded"></div>
          </div>
        </motion.div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Leaderboard Skeleton */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
          >
            <div className="animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-8 bg-slate-700 rounded w-40"></div>
                <div className="h-8 bg-slate-700 rounded w-32"></div>
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-700 rounded"></div>
              ))}
            </div>
          </motion.div>

          {/* History Skeleton */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="xl:col-span-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
          >
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-700 rounded w-32"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-700 rounded"></div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Loading Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-8 right-8 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <i className="ri-loader-4-line"></i>
        </motion.div>
        <span className="text-sm font-medium">Loading Challenge Arena...</span>
      </motion.div>
    </div>
  );
};

export default LoadingState;
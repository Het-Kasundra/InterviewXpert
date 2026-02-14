import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeProvider';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  performanceMode: boolean;
  onPerformanceModeToggle: () => void;
  totalXP: number;
  badges: string[];
}

export const TopBar = ({
  searchQuery,
  onSearchChange,
  performanceMode,
  onPerformanceModeToggle,
  totalXP,
  badges
}: TopBarProps) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div
      className="absolute top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-md border-b border-white/10"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="ri-arrow-left-line text-lg" />
            <span className="hidden md:inline">Back</span>
          </motion.button>

          <div className="h-6 w-px bg-white/20" />

          <motion.h1
            className="text-xl font-bold bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Skill Galaxy
          </motion.h1>
        </div>

        {/* Center section - Search */}
        <motion.div
          className="flex-1 max-w-md mx-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
            <input
              type="text"
              placeholder="Search skills, domains, or achievements..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg 
                       text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 
                       focus:border-transparent backdrop-blur-sm transition-all duration-160"
            />
          </div>
        </motion.div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* XP Counter */}
          <motion.div
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                     backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <i className="ri-star-fill text-yellow-400" />
            <motion.span
              className="text-white font-semibold"
              key={totalXP}
              initial={{ scale: 1.2, color: '#fbbf24' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.3 }}
            >
              {totalXP.toLocaleString()} XP
            </motion.span>
          </motion.div>

          {/* Badges */}
          {badges.length > 0 && (
            <motion.div
              className="flex items-center space-x-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              {badges.slice(0, 3).map((badge, index) => (
                <motion.div
                  key={badge}
                  className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full 
                           flex items-center justify-center text-white text-xs font-bold shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  title={badge}
                >
                  <i className="ri-award-fill" />
                </motion.div>
              ))}
              {badges.length > 3 && (
                <motion.div
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full 
                           flex items-center justify-center text-white text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  +{badges.length - 3}
                </motion.div>
              )}
            </motion.div>
          )}

          <div className="h-6 w-px bg-white/20" />

          {/* Performance Toggle */}
          <motion.button
            onClick={onPerformanceModeToggle}
            className={`p-2 rounded-lg transition-all duration-160 ${
              performanceMode 
                ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                : 'bg-white/10 text-white/60 border border-white/20 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={`Performance mode: ${performanceMode ? 'ON' : 'OFF'}`}
          >
            <i className="ri-flashlight-line" />
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/10 text-white/60 border border-white/20 
                     hover:bg-white/20 transition-all duration-160"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <i className={`ri-${theme === 'light' ? 'moon' : 'sun'}-line`} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
import { motion } from 'framer-motion';
import { useChallengeArena } from '../../../contexts/ChallengeProvider';

const ChallengeHeader = () => {
  const { activeChallenge } = useChallengeArena();

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/challenge-arena`;
      await navigator.clipboard.writeText(shareUrl);
      
      // Show success feedback
      const button = document.getElementById('share-button');
      if (button) {
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = 'Share Arena';
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const getWeekLabel = () => {
    if (!activeChallenge) return '';
    const weekStart = new Date(activeChallenge.week_start);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return `Week of ${weekStart.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} - ${weekEnd.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          AI Challenge Arena
        </h1>
        <p className="text-blue-200 text-lg">
          {getWeekLabel()}
        </p>
      </div>

      <motion.button
        id="share-button"
        onClick={handleShare}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
      >
        <i className="ri-share-line mr-2"></i>
        Share Arena
      </motion.button>
    </motion.div>
  );
};

export default ChallengeHeader;
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CountdownCard = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextMonday = new Date();
      
      // Calculate next Monday at 00:00
      const daysUntilMonday = (8 - now.getDay()) % 7;
      nextMonday.setDate(now.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday));
      nextMonday.setHours(0, 0, 0, 0);

      const difference = nextMonday.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-purple-800/80 to-pink-800/80 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <i className="ri-timer-line text-xl text-purple-400"></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Next Challenge</h3>
          <p className="text-purple-200 text-sm">Countdown to Monday</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="text-center">
          <motion.div 
            key={timeLeft.days}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-white mb-1"
          >
            {timeLeft.days.toString().padStart(2, '0')}
          </motion.div>
          <div className="text-purple-300 text-xs">Days</div>
        </div>
        <div className="text-center">
          <motion.div 
            key={timeLeft.hours}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-white mb-1"
          >
            {timeLeft.hours.toString().padStart(2, '0')}
          </motion.div>
          <div className="text-purple-300 text-xs">Hours</div>
        </div>
        <div className="text-center">
          <motion.div 
            key={timeLeft.minutes}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-white mb-1"
          >
            {timeLeft.minutes.toString().padStart(2, '0')}
          </motion.div>
          <div className="text-purple-300 text-xs">Minutes</div>
        </div>
        <div className="text-center">
          <motion.div 
            key={timeLeft.seconds}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-white mb-1"
          >
            {timeLeft.seconds.toString().padStart(2, '0')}
          </motion.div>
          <div className="text-purple-300 text-xs">Seconds</div>
        </div>
      </div>

      <div className="mt-6 p-3 bg-purple-900/30 rounded-xl">
        <div className="flex items-center justify-center gap-2 text-purple-200 text-sm">
          <i className="ri-information-line"></i>
          <span>New challenges release every Monday</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CountdownCard;
import { motion } from 'framer-motion';

interface BottomCrumbsProps {
  path: string[];
}

export const BottomCrumbs = ({ path }: BottomCrumbsProps) => {
  return (
    <motion.div
      className="absolute bottom-4 left-4 z-30 bg-black/20 backdrop-blur-md border border-white/10 
               rounded-lg px-4 py-2"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
    >
      <div className="flex items-center space-x-2 text-sm">
        {path.map((segment, index) => (
          <motion.div
            key={index}
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            {index > 0 && (
              <i className="ri-arrow-right-s-line text-white/40" />
            )}
            <span
              className={`${
                index === path.length - 1
                  ? 'text-white font-semibold'
                  : 'text-white/60'
              }`}
            >
              {segment}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
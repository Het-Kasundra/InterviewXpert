
import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  hasProjects: boolean;
  onAddProject: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasProjects, onAddProject }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="max-w-md mx-auto">
        {/* Illustration */}
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-500/20 to-amber-500/20 rounded-3xl flex items-center justify-center">
          <i className={`${hasProjects ? 'ri-search-line' : 'ri-folder-add-line'} text-6xl text-slate-400`}></i>
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-4">
          {hasProjects ? 'No projects match your filters' : 'No projects yet'}
        </h3>
        
        <p className="text-slate-400 mb-8 leading-relaxed">
          {hasProjects 
            ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
            : 'Start building your portfolio by adding your first project. Showcase your skills and achievements to the world.'
          }
        </p>

        {/* Action Button */}
        {!hasProjects && (
          <motion.button
            onClick={onAddProject}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <i className="ri-add-line mr-2"></i>
            Add Your First Project
          </motion.button>
        )}

        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-amber-500/30 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-pulse delay-500"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmptyState;

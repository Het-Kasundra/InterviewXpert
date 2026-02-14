
import React from 'react';
import { motion } from 'framer-motion';
import { Project } from '../../../contexts/PortfolioProvider';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'upcoming':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'ri-check-line';
      case 'in_progress':
        return 'ri-time-line';
      case 'upcoming':
        return 'ri-calendar-line';
      default:
        return 'ri-question-line';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-amber-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {project.title}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-slate-400">{project.category}</span>
              <span className="text-slate-600">•</span>
              <span className="text-sm text-slate-400">{project.role}</span>
            </div>
          </div>
          
          {/* XP Badge */}
          <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
            <i className="ri-star-fill text-amber-400 text-sm"></i>
            <span className="text-amber-400 text-sm font-medium">{project.xp_value} XP</span>
          </div>
        </div>

        {/* Project Image or Placeholder */}
        <div className="mb-4 h-32 rounded-xl overflow-hidden bg-slate-700/50">
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
              <div className="text-center">
                <i className="ri-image-line text-3xl text-slate-500 mb-2"></i>
                <div className="text-lg font-semibold text-slate-400">
                  {project.title.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-slate-300 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tech_stack.slice(0, 3).map((tech, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-md border border-slate-600/50"
            >
              {tech}
            </span>
          ))}
          {project.tech_stack.length > 3 && (
            <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-md border border-slate-600/50">
              +{project.tech_stack.length - 3} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(project.status)}`}>
            <i className={getStatusIcon(project.status)}></i>
            {formatStatus(project.status)}
          </div>
          
          <div className="text-xs text-slate-500">
            {new Date(project.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10" />
    </motion.div>
  );
};

export default ProjectCard;

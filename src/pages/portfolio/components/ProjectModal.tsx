
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio, Project } from '../../../contexts/PortfolioProvider';

interface ProjectModalProps {
  projectId: string;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ projectId, onClose }) => {
  const { projects, updateProject, deleteProject } = usePortfolio();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return null;
  }

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteProject(project.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-64 rounded-t-2xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
            {project.image_url ? (
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <i className="ri-image-line text-6xl text-slate-500 mb-4"></i>
                  <div className="text-3xl font-bold text-slate-400">
                    {project.title.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-xl flex items-center justify-center text-white transition-colors"
          >
            <i className="ri-close-line text-xl"></i>
          </button>

          {/* XP Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl">
            <i className="ri-star-fill text-amber-400"></i>
            <span className="text-amber-400 font-semibold">{project.xp_value} XP</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and Meta */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
                <div className="flex items-center gap-4 text-slate-400">
                  <span>{project.category}</span>
                  <span>•</span>
                  <span>{project.role}</span>
                  <span>•</span>
                  <span>Created {formatDate(project.created_at)}</span>
                </div>
              </div>
              
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${getStatusColor(project.status)}`}>
                <i className={getStatusIcon(project.status)}></i>
                {formatStatus(project.status)}
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-300 text-lg leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Tech Stack */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-3">Technologies Used</h3>
            <div className="flex flex-wrap gap-3">
              {project.tech_stack.map((tech, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Achievements */}
          {project.achievements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-3">Key Achievements</h3>
              <div className="space-y-3">
                {project.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <i className="ri-trophy-line text-amber-400 text-sm"></i>
                    </div>
                    <span className="text-slate-300">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(project.links.github || project.links.site || project.links.pdf) && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-3">Project Links</h3>
              <div className="flex flex-wrap gap-3">
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl transition-all"
                  >
                    <i className="ri-github-line"></i>
                    GitHub
                  </a>
                )}
                {project.links.site && (
                  <a
                    href={project.links.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl transition-all"
                  >
                    <i className="ri-external-link-line"></i>
                    Live Site
                  </a>
                )}
                {project.links.pdf && (
                  <a
                    href={project.links.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl transition-all"
                  >
                    <i className="ri-file-pdf-line"></i>
                    Documentation
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-700/50">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-xl transition-all"
            >
              <i className="ri-edit-line"></i>
              Edit Project
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl transition-all"
            >
              <i className="ri-delete-bin-line"></i>
              Delete
            </button>

            <div className="flex-1"></div>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 rounded-2xl"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full"
              >
                <div className="text-center">
                  <i className="ri-error-warning-line text-4xl text-red-400 mb-4"></i>
                  <h3 className="text-xl font-semibold text-white mb-2">Delete Project</h3>
                  <p className="text-slate-400 mb-6">
                    Are you sure you want to delete "{project.title}"? This action cannot be undone.
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-700 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      {loading ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ProjectModal;

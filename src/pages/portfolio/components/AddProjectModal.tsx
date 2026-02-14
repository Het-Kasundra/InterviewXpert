
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../../../contexts/PortfolioProvider';

interface AddProjectModalProps {
  onClose: () => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ onClose }) => {
  const { addProject } = usePortfolio();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tech',
    role: '',
    tech_stack: [] as string[],
    image_url: '',
    status: 'in_progress' as 'in_progress' | 'completed' | 'upcoming',
    achievements: [] as string[],
    links: {
      github: '',
      site: '',
      pdf: '',
    },
    xp_value: 100,
  });

  const [techInput, setTechInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');

  const categories = ['Tech', 'Design', 'Marketing', 'AI/ML', 'Mobile', 'Web', 'Data Science', 'DevOps'];
  const statusOptions = [
    { value: 'in_progress', label: 'In Progress', icon: 'ri-time-line' },
    { value: 'completed', label: 'Completed', icon: 'ri-check-line' },
    { value: 'upcoming', label: 'Upcoming', icon: 'ri-calendar-line' },
  ];

  const handleAddTech = () => {
    if (techInput.trim() && !formData.tech_stack.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(t => t !== tech)
    }));
  };

  const handleAddAchievement = () => {
    if (achievementInput.trim() && !formData.achievements.includes(achievementInput.trim())) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievementInput.trim()]
      }));
      setAchievementInput('');
    }
  };

  const handleRemoveAchievement = (achievement: string) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a !== achievement)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Project title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addProject(formData);
      
      // Show success animation
      const confetti = document.createElement('div');
      confetti.innerHTML = '🎉';
      confetti.style.position = 'fixed';
      confetti.style.top = '50%';
      confetti.style.left = '50%';
      confetti.style.fontSize = '4rem';
      confetti.style.zIndex = '9999';
      confetti.style.pointerEvents = 'none';
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        document.body.removeChild(confetti);
      }, 2000);
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add project');
    } finally {
      setLoading(false);
    }
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
        className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Project</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-700/50 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Enter project title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              placeholder="Describe your project"
            />
          </div>

          {/* Category and Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all pr-8"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-slate-800">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Role
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="e.g., Full Stack Developer"
              />
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tech Stack
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Add technology"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors whitespace-nowrap"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tech_stack.map((tech, index) => (
                <span
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-sm"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(tech)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Status and XP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: option.value as any }))}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      formData.status === option.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50'
                    }`}
                  >
                    <i className={option.icon}></i>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                XP Value
              </label>
              <input
                type="number"
                value={formData.xp_value}
                onChange={(e) => setFormData(prev => ({ ...prev, xp_value: parseInt(e.target.value) || 0 }))}
                min="0"
                max="1000"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project Image URL
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Links */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project Links
            </label>
            <div className="space-y-3">
              <input
                type="url"
                value={formData.links.github}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  links: { ...prev.links, github: e.target.value }
                }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="GitHub repository URL"
              />
              <input
                type="url"
                value={formData.links.site}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  links: { ...prev.links, site: e.target.value }
                }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Live site URL"
              />
              <input
                type="url"
                value={formData.links.pdf}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  links: { ...prev.links, pdf: e.target.value }
                }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Documentation/PDF URL"
              />
            </div>
          </div>

          {/* Achievements */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Key Achievements
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAchievement())}
                className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Add achievement"
              />
              <button
                type="button"
                onClick={handleAddAchievement}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors whitespace-nowrap"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-3 py-2 bg-slate-700/50 rounded-lg"
                >
                  <i className="ri-trophy-line text-amber-400"></i>
                  <span className="flex-1 text-slate-300">{achievement}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAchievement(achievement)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400"
              >
                <i className="ri-error-warning-line mr-2"></i>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                'Add Project'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddProjectModal;

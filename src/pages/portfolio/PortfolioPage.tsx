
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../../contexts/SessionProvider';
import { PortfolioProvider, usePortfolio } from '../../contexts/PortfolioProvider';
import ProjectCard from './components/ProjectCard';
import ProjectModal from './components/ProjectModal';
import AddProjectModal from './components/AddProjectModal';
import ProfileSummary from './components/ProfileSummary';
import FilterBar from './components/FilterBar';
import SkeletonLoader from './components/SkeletonLoader';
import EmptyState from './components/EmptyState';
import ErrorBoundary from './components/ErrorBoundary';

const PortfolioContent = () => {
  const { projects, loading, error, refreshData } = usePortfolio();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tech_stack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'xp':
          return b.xp_value - a.xp_value;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default: // newest
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [projects, searchQuery, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-slate-800 rounded-lg w-64 mb-4 animate-pulse"></div>
            <div className="h-4 bg-slate-800 rounded w-96 animate-pulse"></div>
          </div>
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <i className="ri-error-warning-line text-4xl text-red-400 mb-4"></i>
            <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Portfolio</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={refreshData}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              My Portfolio
              <div className="h-1 w-24 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mt-2"></div>
            </h1>
            <p className="text-slate-400">Showcase your projects and achievements</p>
          </div>
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/25 whitespace-nowrap"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <i className="ri-add-line mr-2"></i>
            Add Project
          </motion.button>
        </div>

        {/* Profile Summary */}
        <ProfileSummary />

        {/* Filter Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalProjects={filteredAndSortedProjects.length}
        />

        {/* Projects Grid */}
        <ErrorBoundary>
          {filteredAndSortedProjects.length === 0 ? (
            <EmptyState
              hasProjects={projects.length > 0}
              onAddProject={() => setShowAddModal(true)}
            />
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              layout
            >
              <AnimatePresence>
                {filteredAndSortedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => setSelectedProject(project.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </ErrorBoundary>

        {/* Modals */}
        <AnimatePresence>
          {selectedProject && (
            <ProjectModal
              projectId={selectedProject}
              onClose={() => setSelectedProject(null)}
            />
          )}
          {showAddModal && (
            <AddProjectModal
              onClose={() => setShowAddModal(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PortfolioPage = () => {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-lock-line text-6xl text-slate-600 mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-slate-400">Please log in to access your portfolio.</p>
        </div>
      </div>
    );
  }

  return (
    <PortfolioProvider>
      <PortfolioContent />
    </PortfolioProvider>
  );
};

export default PortfolioPage;

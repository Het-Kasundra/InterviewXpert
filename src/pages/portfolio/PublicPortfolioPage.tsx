
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { Project, UserPortfolio } from '../../contexts/PortfolioProvider';
import ProjectCard from './components/ProjectCard';
import ProjectModal from './components/ProjectModal';

const PublicPortfolioPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicPortfolio = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch portfolio by slug
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('user_portfolio')
          .select('*')
          .eq('share_slug', slug)
          .single();

        if (portfolioError) {
          if (portfolioError.code === 'PGRST116') {
            setError('Portfolio not found');
          } else {
            throw portfolioError;
          }
          return;
        }

        setPortfolio(portfolioData);

        // Fetch projects for this user
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', portfolioData.user_id)
          .order('created_at', { ascending: false });

        if (projectsError) throw projectsError;

        setProjects(projectsData || []);
      } catch (err) {
        console.error('Error fetching public portfolio:', err);
        setError('Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicPortfolio();
  }, [slug]);

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

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <i className="ri-error-warning-line text-6xl text-slate-600 mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-2">Portfolio Not Found</h2>
          <p className="text-slate-400 mb-6">
            {error || 'The portfolio you\'re looking for doesn\'t exist or has been made private.'}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
          >
            <i className="ri-home-line"></i>
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-amber-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            {/* Avatar */}
            <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 to-amber-500 p-1">
              <div className="w-full h-full rounded-3xl bg-slate-800 flex items-center justify-center overflow-hidden">
                {portfolio.avatar_url ? (
                  <img
                    src={portfolio.avatar_url}
                    alt={portfolio.username || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl font-bold text-white">
                    {portfolio.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>

            {/* Name and Bio */}
            <h1 className="text-4xl font-bold text-white mb-4">
              {portfolio.username || 'Portfolio'}
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              {portfolio.bio || 'Passionate developer creating amazing projects'}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {portfolio.total_projects}
                </div>
                <div className="text-slate-400">Projects</div>
              </div>
              <div className="w-px h-12 bg-slate-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400 mb-1">
                  {portfolio.total_xp}
                </div>
                <div className="text-slate-400">Total XP</div>
              </div>
            </div>

            {/* Contact Button */}
            <motion.a
              href={`mailto:contact@${portfolio.username}.dev`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="ri-mail-line"></i>
              Get In Touch
            </motion.a>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Featured Projects</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Explore a collection of projects showcasing skills, creativity, and technical expertise.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <i className="ri-folder-line text-6xl text-slate-600 mb-4"></i>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No Projects Yet</h3>
            <p className="text-slate-500">This portfolio is still being built. Check back soon!</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            layout
          >
            <AnimatePresence>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => setSelectedProject(project.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-800/50 border-t border-slate-700/50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400">
            Built with ❤️ using InterviewXpert Portfolio Builder
          </p>
        </div>
      </footer>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            projectId={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicPortfolioPage;

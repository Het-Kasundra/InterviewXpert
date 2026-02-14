import { useState, useEffect } from 'react';
import { usePortfolio } from '../../../contexts/PortfolioProvider';
import { getProjectSuggestions, type ProjectSuggestion } from '../../../lib/aiPortfolioService';
import { motion } from 'framer-motion';

export const ProjectSuggestions = () => {
  const { projects } = usePortfolio();
  const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleGetSuggestions = async () => {
    setLoading(true);
    try {
      const currentSkills = projects.flatMap(p => p.tech_stack || []);
      const existingProjects = projects.map(p => p.title);
      
      const fetchedSuggestions = await getProjectSuggestions({
        currentSkills: [...new Set(currentSkills)],
        targetRole: 'Full Stack Developer', // Could be made dynamic
        experienceLevel: 'mid',
        existingProjects,
        timeAvailable: 'medium',
      });
      
      setSuggestions(fetchedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      alert('Failed to load suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!showSuggestions && suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Get AI-Powered Project Suggestions
          </h3>
          <p className="text-gray-600 mb-4">
            Get personalized project ideas based on your current skills and goals
          </p>
          <button
            onClick={handleGetSuggestions}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Get Suggestions'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          AI Project Suggestions
        </h3>
        <button
          onClick={() => setShowSuggestions(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Generating suggestions...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {suggestion.title}
                  </h4>
                  <p className="text-gray-700 mb-2">{suggestion.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(suggestion.difficulty)}`}>
                  {suggestion.difficulty}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Tech Stack:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Why Relevant:</p>
                <p className="text-sm text-gray-600">{suggestion.whyRelevant}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span className="text-gray-600">Estimated Time:</span>
                  <p className="font-medium text-gray-900">{suggestion.estimatedTime}</p>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <p className="font-medium text-gray-900">{suggestion.category}</p>
                </div>
              </div>

              {suggestion.learningOutcomes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Learning Outcomes:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {suggestion.learningOutcomes.map((outcome, idx) => (
                      <li key={idx}>{outcome}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};


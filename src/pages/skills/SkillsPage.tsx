import { useState, useEffect } from 'react';
import { useSession } from '../../contexts/SessionProvider';
import { supabase } from '../../lib/supabaseClient';
import { generateLearningPath, recommendTopics, type LearningPath } from '../../lib/aiLearningService';

export const SkillsPage = () => {
  const { user } = useSession();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetRole, setTargetRole] = useState<string>('Full Stack Developer');
  const [weakAreas, setWeakAreas] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchPerformanceData();
    }
  }, [user]);

  const fetchPerformanceData = async () => {
    if (!user) return;

    try {
      // Fetch recent interview performance to identify weak areas
      const { data: interviews } = await supabase
        .from('interviews')
        .select('transcript, overall_score, skills')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (interviews && interviews.length > 0) {
        // Analyze transcripts to find weak areas
        const weakAreasSet = new Set<string>();
        interviews.forEach(interview => {
          if (interview.transcript && Array.isArray(interview.transcript)) {
            interview.transcript.forEach((answer: any) => {
              if (answer.rubric) {
                const avgScore = (
                  answer.rubric.clarity +
                  answer.rubric.depth +
                  answer.rubric.relevance +
                  answer.rubric.structure +
                  answer.rubric.communication +
                  answer.rubric.accuracy
                ) / 6;
                if (avgScore < 6 && answer.tags && answer.tags.length > 0) {
                  answer.tags.forEach((tag: string) => weakAreasSet.add(tag));
                }
              }
            });
          }
        });
        setWeakAreas(Array.from(weakAreasSet).slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };

  const handleGenerateLearningPath = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: interviews } = await supabase
        .from('interviews')
        .select('overall_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const recentScores = interviews?.map(i => i.overall_score || 0) || [];
      
      const path = await generateLearningPath({
        userId: user.id,
        targetRole,
        performanceData: {
          userId: user.id,
          weakAreas: weakAreas.length > 0 ? weakAreas : ['General'],
          strongAreas: [],
          recentScores,
          interviewHistory: [],
        },
        availableHoursPerWeek: 10,
      });

      setLearningPath(path);
    } catch (error) {
      console.error('Error generating learning path:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Skills & Learning</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Explore and develop your interview skills with personalized learning paths
        </p>
      </div>

      {/* Learning Path Generator */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          <i className="ri-roadmap-line text-blue-600 mr-2" />
          Personalized Learning Path
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Full Stack Developer"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          {weakAreas.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Areas to Focus On
              </label>
              <div className="flex flex-wrap gap-2">
                {weakAreas.map((area, index) => (
                  <span key={index} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={handleGenerateLearningPath}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2" />
                Generating Learning Path...
              </>
            ) : (
              <>
                <i className="ri-magic-line mr-2" />
                Generate Learning Path
              </>
            )}
          </button>
        </div>
      </div>

      {/* Learning Path Display */}
      {learningPath && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Learning Path: {learningPath.targetRole}
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {learningPath.estimatedDuration} days • {learningPath.progress}% complete
            </span>
          </div>
          <div className="space-y-4">
            {learningPath.modules.map((module, index) => (
              <div
                key={module.id}
                className={`p-4 rounded-lg border ${
                  module.completed
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : index === learningPath.currentModule
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {index + 1}. {module.title}
                  </h3>
                  {module.completed && (
                    <i className="ri-check-circle-fill text-green-600 text-xl" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {module.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {module.topics.map((topic, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                      {topic}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <i className="ri-time-line mr-1" />
                  {module.estimatedTime} hours • {module.difficulty}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback: Skill Galaxy */}
      {!learningPath && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center py-12">
            <i className="ri-star-line text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Discover your skills</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Generate a personalized learning path to improve your interview skills
            </p>
            <button
              onClick={handleGenerateLearningPath}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 whitespace-nowrap"
            >
              Generate Learning Path
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

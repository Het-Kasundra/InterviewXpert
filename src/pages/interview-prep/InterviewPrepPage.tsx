import { useState, useEffect } from 'react';
import { useSession } from '../../contexts/SessionProvider';
import { getPrepTips, generatePrepPlan, getPracticeQuestions, type PrepTip, type PrepPlan } from '../../lib/aiInterviewPrepService';
import { motion } from 'framer-motion';

export const InterviewPrepPage = () => {
  const { user } = useSession();
  const [targetRole, setTargetRole] = useState('');
  const [interviewType, setInterviewType] = useState<'technical' | 'behavioral' | 'mix'>('mix');
  const [tips, setTips] = useState<PrepTip[]>([]);
  const [prepPlan, setPrepPlan] = useState<PrepPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tips' | 'plan' | 'practice'>('tips');

  const handleGetTips = async () => {
    if (!targetRole.trim()) {
      alert('Please enter a target role');
      return;
    }

    setLoading(true);
    try {
      const fetchedTips = await getPrepTips(targetRole, interviewType);
      setTips(fetchedTips);
      setActiveTab('tips');
    } catch (error) {
      console.error('Error getting tips:', error);
      alert('Failed to load tips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!targetRole.trim()) {
      alert('Please enter a target role');
      return;
    }

    setLoading(true);
    try {
      const plan = await generatePrepPlan({
        targetRole,
        currentSkills: [],
        experienceLevel: 'mid',
        availableHoursPerWeek: 10,
        interviewType,
      });
      setPrepPlan(plan);
      setActiveTab('plan');
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical':
        return '💻';
      case 'behavioral':
        return '🤝';
      case 'role-specific':
        return '🎯';
      default:
        return '📋';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Preparation Assistant</h1>
        <p className="text-gray-600">Get personalized tips, plans, and practice questions for your interview</p>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Full Stack Developer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interview Type
            </label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="mix">Mix</option>
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleGetTips}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Get Tips
            </button>
            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Plan
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'tips', label: 'Preparation Tips', icon: '💡' },
              { id: 'plan', label: 'Study Plan', icon: '📚' },
              { id: 'practice', label: 'Practice Questions', icon: '✏️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-3 text-center font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          )}

          {!loading && activeTab === 'tips' && (
            <div className="space-y-4">
              {tips.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Enter a target role and click "Get Tips" to see personalized preparation tips</p>
                </div>
              ) : (
                tips.map((tip, index) => (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(tip.category)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{tip.title}</h3>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(tip.priority)}`}>
                        {tip.priority}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{tip.content}</p>
                    {tip.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tip.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          )}

          {!loading && activeTab === 'plan' && (
            <div>
              {!prepPlan ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Click "Generate Plan" to create a personalized study plan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Study Plan Overview</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600 font-medium">Target Role:</span>
                        <p className="text-blue-900">{prepPlan.targetRole}</p>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Duration:</span>
                        <p className="text-blue-900">{prepPlan.duration} days</p>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Estimated Hours:</span>
                        <p className="text-blue-900">{prepPlan.estimatedHours} hours</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {prepPlan.modules.map((module, index) => (
                      <motion.div
                        key={module.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Module {module.order}: {module.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                          </div>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {module.estimatedTime}h
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Topics:</p>
                          <div className="flex flex-wrap gap-2">
                            {module.topics.map((topic) => (
                              <span
                                key={topic}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'practice' && (
            <div className="text-center py-12 text-gray-500">
              <p>Practice questions feature coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


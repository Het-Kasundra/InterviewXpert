import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../contexts/SessionProvider';

interface InterviewConfig {
  roles: string[];
  level: 'easy' | 'medium' | 'hard';
  type: 'technical' | 'behavioural' | 'mix';
  questionTypes: string[];
  duration: number;
  inputMode: 'text' | 'voice' | 'text-voice';
  resume?: string;
}

const PREDEFINED_ROLES = [
  'Web Development',
  'App Development', 
  'Full Stack',
  'Data Science',
  'DevOps',
  'Machine Learning',
  'Product Manager',
  'PM'
];

const QUESTION_TYPES = [
  { id: 'mcq', label: 'MCQ', icon: 'ri-checkbox-multiple-line' },
  { id: 'qa', label: 'Q&A', icon: 'ri-question-answer-line' },
  { id: 'code', label: 'Code', icon: 'ri-code-line' },
  { id: 'debugging', label: 'Debugging', icon: 'ri-bug-line' }
];

export const StartInterviewPage = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const [config, setConfig] = useState<InterviewConfig>({
    roles: [],
    level: 'medium',
    type: 'mix',
    questionTypes: ['mcq', 'qa', 'code', 'debugging'],
    duration: 30,
    inputMode: 'text-voice',
    resume: ''
  });
  const [customRole, setCustomRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleToggle = (role: string) => {
    setConfig(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleAddCustomRole = () => {
    if (customRole.trim() && !config.roles.includes(customRole.trim())) {
      setConfig(prev => ({
        ...prev,
        roles: [...prev.roles, customRole.trim()]
      }));
      setCustomRole('');
    }
  };

  const handleQuestionTypeToggle = (type: string) => {
    setConfig(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type]
    }));
  };

  const handleStartInterview = async (isQuick = false) => {
    if (!session?.user) {
      navigate('/login');
      return;
    }

    if (config.roles.length === 0) {
      alert('Please select at least one role');
      return;
    }

    if (config.questionTypes.length === 0) {
      alert('Please select at least one question type');
      return;
    }

    setIsLoading(true);
    
    try {
      const interviewConfig = {
        ...config,
        duration: isQuick ? 5 : config.duration,
        userId: session.user.id,
        source: 'a4f' // Mark as A4F-generated
      };
      
      // Store config in sessionStorage for the interview runner
      sessionStorage.setItem('interviewConfig', JSON.stringify(interviewConfig));
      
      // Navigate to interview runner (questions will be generated there)
      navigate('/interviews/runner');
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Start Mock Interview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your interview settings and begin practicing
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Roles Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <i className="ri-briefcase-line text-blue-600 mr-2" />
              Select Roles
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {PREDEFINED_ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleToggle(role)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-160 whitespace-nowrap ${
                    config.roles.includes(role)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Add custom role..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomRole()}
              />
              <button
                onClick={handleAddCustomRole}
                className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors duration-160 whitespace-nowrap"
              >
                <i className="ri-add-line" />
              </button>
            </div>
          </div>

          {/* Level & Type */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <i className="ri-bar-chart-line text-gold-500 mr-2" />
                Difficulty Level
              </h3>
              <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                {(['easy', 'medium', 'hard'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setConfig(prev => ({ ...prev, level }))}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-160 whitespace-nowrap ${
                      config.level === level
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <i className="ri-focus-3-line text-blue-600 mr-2" />
                Interview Type
              </h3>
              <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                {(['technical', 'behavioural', 'mix'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setConfig(prev => ({ ...prev, type }))}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-160 whitespace-nowrap ${
                      config.type === type
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question Types */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <i className="ri-question-line text-gold-500 mr-2" />
              Question Types
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {QUESTION_TYPES.map(type => (
                <label key={type.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.questionTypes.includes(type.id)}
                    onChange={() => handleQuestionTypeToggle(type.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <i className={`${type.icon} text-lg text-gray-600 dark:text-gray-400`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {type.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Duration & Input Mode */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <i className="ri-timer-line text-blue-600 mr-2" />
                Duration
              </h3>
              <select
                value={config.duration}
                onChange={(e) => setConfig(prev => ({ ...prev, duration: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-8"
              >
                <option value={10}>10 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
              </select>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <i className="ri-mic-line text-gold-500 mr-2" />
                Input Mode
              </h3>
              <select
                value={config.inputMode}
                onChange={(e) => setConfig(prev => ({ ...prev, inputMode: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-8"
              >
                <option value="text">Text Only</option>
                <option value="voice">Voice Only</option>
                <option value="text-voice">Text + Voice</option>
              </select>
            </div>
          </div>

          {/* Resume/JD */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <i className="ri-file-text-line text-blue-600 mr-2" />
              Resume or Job Description (Optional)
            </h3>
            <textarea
              value={config.resume}
              onChange={(e) => setConfig(prev => ({ ...prev, resume: e.target.value }))}
              placeholder="Paste your resume or job description to personalize questions..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              rows={4}
              maxLength={2000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {config.resume?.length || 0}/2000
            </div>
          </div>
        </div>

        {/* Summary & Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-gold-50 dark:from-blue-900/20 dark:to-gold-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <i className="ri-settings-3-line text-blue-600 mr-2" />
              Interview Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Roles:</span>
                <div className="mt-1">
                  {config.roles.length > 0 ? (
                    config.roles.map(role => (
                      <span key={role} className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs mr-1 mb-1">
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">None selected</span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Level:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">{config.level}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">{config.type}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{config.duration} min</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Input:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">{config.inputMode.replace('-', ' + ')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleStartInterview(false)}
              disabled={isLoading || config.roles.length === 0}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-160 whitespace-nowrap"
            >
              {isLoading ? (
                <i className="ri-loader-4-line animate-spin mr-2" />
              ) : (
                <i className="ri-play-circle-line mr-2" />
              )}
              Start Interview
            </button>
            
            <button
              onClick={() => handleStartInterview(true)}
              disabled={isLoading || config.roles.length === 0}
              className="w-full bg-gold-500 text-white py-3 rounded-xl font-semibold hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-160 whitespace-nowrap"
            >
              <i className="ri-flash-line mr-2" />
              Quick Practice (5 min)
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/interviews')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-160 whitespace-nowrap"
            >
              <i className="ri-arrow-left-line mr-1" />
              Back to My Interviews
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
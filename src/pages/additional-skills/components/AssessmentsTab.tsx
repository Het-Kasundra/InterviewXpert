import { useState } from 'react';
import { AssessmentRunner } from './AssessmentRunner';

export const AssessmentsTab = () => {
  const [showRunner, setShowRunner] = useState(false);
  const [config, setConfig] = useState({
    domains: [],
    level: 'Medium',
    timed: true,
    duration: 20,
    inputMode: 'Text'
  });

  const domains = [
    { id: 'finance', label: 'Finance', icon: 'ri-money-dollar-circle-line', color: 'from-green-400 to-emerald-600' },
    { id: 'soft-skills', label: 'Soft Skills', icon: 'ri-heart-line', color: 'from-pink-400 to-rose-600' },
    { id: 'marketing', label: 'Marketing', icon: 'ri-megaphone-line', color: 'from-purple-400 to-violet-600' },
    { id: 'sales', label: 'Sales', icon: 'ri-handshake-line', color: 'from-blue-400 to-cyan-600' },
    { id: 'hr', label: 'HR', icon: 'ri-team-line', color: 'from-orange-400 to-amber-600' },
    { id: 'operations', label: 'Operations', icon: 'ri-settings-3-line', color: 'from-gray-400 to-slate-600' },
    { id: 'consulting', label: 'Consulting', icon: 'ri-lightbulb-line', color: 'from-yellow-400 to-orange-600' },
    { id: 'custom', label: 'Custom', icon: 'ri-add-circle-line', color: 'from-indigo-400 to-purple-600' },
  ];

  const levels = ['Easy', 'Medium', 'Hard'];
  const durations = [10, 20, 30];
  const inputModes = ['Text', 'Voice', 'Both'];

  const handleDomainToggle = (domainId: string) => {
    setConfig(prev => ({
      ...prev,
      domains: prev.domains.includes(domainId)
        ? prev.domains.filter(d => d !== domainId)
        : [...prev.domains, domainId]
    }));
  };

  const handleStartAssessment = () => {
    if (config.domains.length === 0) {
      alert('Please select at least one domain');
      return;
    }
    setShowRunner(true);
  };

  if (showRunner) {
    return <AssessmentRunner config={config} onComplete={() => setShowRunner(false)} />;
  }

  return (
    <div className="space-y-8">
      {/* Domain Selection */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <i className="ri-compass-3-line mr-2 text-yellow-500" />
          Choose Your Adventure
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {domains.map((domain) => (
            <button
              key={domain.id}
              onClick={() => handleDomainToggle(domain.id)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105
                ${config.domains.includes(domain.id)
                  ? 'border-yellow-400 bg-gradient-to-br ' + domain.color + ' text-white shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-yellow-300'
                }
              `}
            >
              <div className="text-center">
                <i className={`${domain.icon} text-3xl mb-2 block`} />
                <span className="font-semibold">{domain.label}</span>
              </div>
              {config.domains.includes(domain.id) && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <i className="ri-check-line text-white text-sm" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Configuration */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Difficulty Level */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <i className="ri-trophy-line mr-2 text-yellow-500" />
            Difficulty Level
          </h4>
          <div className="space-y-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setConfig(prev => ({ ...prev, level }))}
                className={`
                  w-full p-3 rounded-lg text-left transition-all duration-200
                  ${config.level === level
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-300'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{level}</span>
                  <div className="flex">
                    {Array.from({ length: levels.indexOf(level) + 1 }).map((_, i) => (
                      <i key={i} className="ri-star-fill text-yellow-400 text-sm" />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Timer Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <i className="ri-timer-line mr-2 text-blue-500" />
            Timer Settings
          </h4>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={config.timed}
                onChange={(e) => setConfig(prev => ({ ...prev, timed: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Enable Timer</span>
            </label>
            {config.timed && (
              <div className="space-y-2">
                {durations.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setConfig(prev => ({ ...prev, duration }))}
                    className={`
                      w-full p-2 rounded-lg text-center transition-all duration-200
                      ${config.duration === duration
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {duration} minutes
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Mode */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <i className="ri-mic-line mr-2 text-purple-500" />
            Input Mode
          </h4>
          <div className="space-y-2">
            {inputModes.map((mode) => (
              <button
                key={mode}
                onClick={() => setConfig(prev => ({ ...prev, inputMode: mode }))}
                className={`
                  w-full p-3 rounded-lg text-left transition-all duration-200
                  ${config.inputMode === mode
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-2 border-purple-300'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center">
                  <i className={`${mode === 'Text' ? 'ri-keyboard-line' : mode === 'Voice' ? 'ri-mic-line' : 'ri-chat-voice-line'} mr-2`} />
                  {mode}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <button
          onClick={handleStartAssessment}
          disabled={config.domains.length === 0}
          className={`
            px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 whitespace-nowrap
            ${config.domains.length > 0
              ? 'bg-gradient-to-r from-yellow-500 to-blue-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <i className="ri-rocket-line mr-2" />
          Launch Assessment
        </button>
      </div>
    </div>
  );
};
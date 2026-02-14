import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AssessmentsTab } from './components/AssessmentsTab';
import { PracticeArenaTab } from './components/PracticeArenaTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { SessionSummary } from './components/SessionSummary';
import { supabase } from '../../lib/supabaseClient';

export const AdditionalSkillsPage = () => {
  const [activeTab, setActiveTab] = useState('assessments');
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    }
  }, [sessionId]);

  const loadSessionData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('additional_skills_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      setSessionData(data);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  if (sessionId && sessionData) {
    return <SessionSummary sessionData={sessionData} onClose={() => window.history.replaceState({}, '', '/additional-skills')} />;
  }

  if (sessionId && loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'assessments', label: 'Assessments', icon: 'ri-file-list-3-line' },
    { id: 'practice', label: 'Practice Arena', icon: 'ri-gamepad-line' },
    { id: 'analytics', label: 'Analytics', icon: 'ri-bar-chart-box-line' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-blue-500/10 to-purple-500/10 rounded-3xl"></div>
        <div className="relative p-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Level up your superpowers ⚡
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Master Finance, Soft Skills, and beyond with gamified assessments
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-yellow-500 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <i className={`${tab.icon} mr-2`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'assessments' && <AssessmentsTab />}
        {activeTab === 'practice' && <PracticeArenaTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
};
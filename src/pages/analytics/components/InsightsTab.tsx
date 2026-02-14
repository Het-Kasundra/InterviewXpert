import { useState, useEffect } from 'react';
import { useSession } from '../../../contexts/SessionProvider';
import { getAnalyticsInsights, predictSuccessProbability, identifyWeaknesses, type AnalyticsInsight, type WeaknessAnalysis } from '../../../lib/aiAnalyticsService';
import { supabase } from '../../../lib/supabaseClient';
import { motion } from 'framer-motion';

interface InsightsTabProps {
  interviews: any[];
  skills: any[];
}

export const InsightsTab = ({ interviews, skills }: InsightsTabProps) => {
  const { user } = useSession();
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [weaknesses, setWeaknesses] = useState<WeaknessAnalysis[]>([]);
  const [successProbability, setSuccessProbability] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetRole, setTargetRole] = useState('Software Engineer');

  useEffect(() => {
    if (user && interviews.length > 0) {
      loadInsights();
    } else {
      setLoading(false);
    }
  }, [user, interviews, skills]);

  const loadInsights = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get insights
      const insightsData = await getAnalyticsInsights({
        userId: user.id,
        interviews: interviews.map(i => ({
          id: i.id,
          role: i.role || 'General',
          overall_score: i.overall_score || 0,
          started_at: i.started_at,
          difficulty: i.difficulty || 'medium',
          skills: i.skills || [],
        })),
        skills: skills.map(s => ({
          id: s.id,
          domain: s.domains?.[0] || 'General',
          overall_score: s.overall_score || 0,
          started_at: s.started_at,
          level: s.level || 'medium',
        })),
        timeRange: 'month',
      });

      setInsights(insightsData);

      // Get weaknesses
      const weaknessesData = await identifyWeaknesses(
        interviews.map(i => ({
          id: i.id,
          role: i.role || 'General',
          overall_score: i.overall_score || 0,
          started_at: i.started_at,
          difficulty: i.difficulty || 'medium',
          skills: i.skills || [],
        })),
        skills.map(s => ({
          id: s.id,
          domain: s.domains?.[0] || 'General',
          overall_score: s.overall_score || 0,
          started_at: s.started_at,
          level: s.level || 'medium',
        }))
      );

      setWeaknesses(weaknessesData);

      // Get success probability
      const recentScores = interviews
        .slice(0, 5)
        .map(i => i.overall_score || 0)
        .filter(s => s > 0);

      if (recentScores.length > 0) {
        const probability = await predictSuccessProbability(
          user.id,
          targetRole,
          recentScores
        );
        setSuccessProbability(probability);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return '📈';
      case 'weakness':
        return '⚠️';
      case 'strength':
        return '✅';
      case 'recommendation':
        return '💡';
      default:
        return '📊';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Analyzing your performance...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Probability Card */}
      {successProbability !== null && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Interview Success Probability
              </h3>
              <p className="text-sm text-gray-600">
                Based on your recent performance for {targetRole}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-600">
                {successProbability}%
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {successProbability >= 80 ? 'Excellent!' : successProbability >= 60 ? 'Good!' : 'Keep practicing!'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
        {insights.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Complete more interviews to get personalized insights</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(insight.type)}</span>
                    <h4 className="text-lg font-semibold text-gray-900">{insight.title}</h4>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(insight.priority)}`}>
                    {insight.priority}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{insight.description}</p>
                {insight.actionableSteps && insight.actionableSteps.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Actionable Steps:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {insight.actionableSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Areas for Improvement</h3>
          <div className="space-y-3">
            {weaknesses.map((weakness, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-red-200 bg-red-50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-red-900">{weakness.area}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    weakness.impact === 'high' ? 'bg-red-200 text-red-800' :
                    weakness.impact === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {weakness.impact} impact
                  </span>
                </div>
                <p className="text-sm text-red-700 mb-2">
                  Appeared in {weakness.frequency} {weakness.frequency === 1 ? 'session' : 'sessions'}
                </p>
                {weakness.recommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-900 mb-1">Recommendations:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                      {weakness.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


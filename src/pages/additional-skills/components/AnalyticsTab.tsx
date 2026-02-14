import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export const AnalyticsTab = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    domain: 'all',
    level: 'all',
    period: '30'
  });

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(filters.period));

      let query = supabase
        .from('additional_skills_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (filters.level !== 'all') {
        query = query.eq('level', filters.level);
      }

      const { data, error } = await query;
      if (error) throw error;

      let filteredData = (data || []).map(session => ({
        ...session,
        domains: Array.isArray(session.domains) ? session.domains : (session.domains ? [session.domains] : [])
      }));
      
      if (filters.domain !== 'all') {
        filteredData = filteredData.filter(session => 
          Array.isArray(session.domains) && session.domains.includes(filters.domain)
        );
      }

      setSessions(filteredData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageScore: 0,
        totalXP: 0,
        bestStreak: 0,
        domainBreakdown: {},
        trendData: []
      };
    }

    const totalSessions = sessions.length;
    const averageScore = sessions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / totalSessions;
    const totalXP = sessions.reduce((sum, s) => sum + (s.flags?.xp || 0), 0);
    const bestStreak = Math.max(...sessions.map(s => s.flags?.streak || 0));

    // Domain breakdown
    const domainBreakdown: Record<string, { count: number; totalScore: number; average: number }> = {};
    sessions.forEach(session => {
      const domains = Array.isArray(session.domains) ? session.domains : [];
      domains.forEach(domain => {
        if (domain) {
          if (!domainBreakdown[domain]) {
            domainBreakdown[domain] = { count: 0, totalScore: 0, average: 0 };
          }
          domainBreakdown[domain].count++;
          domainBreakdown[domain].totalScore += session.overall_score || 0;
        }
      });
    });

    // Calculate averages
    Object.keys(domainBreakdown).forEach(domain => {
      if (domainBreakdown[domain].count > 0) {
        domainBreakdown[domain].average = domainBreakdown[domain].totalScore / domainBreakdown[domain].count;
      }
    });

    // Domain performance trends - group by date and domain
    const domainTrends: Record<string, Array<{ date: string; score: number }>> = {};
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.created_at || a.started_at || 0).getTime() - new Date(b.created_at || b.started_at || 0).getTime()
    );
    
    sortedSessions.forEach(session => {
      const date = new Date(session.created_at || session.started_at || Date.now()).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      const domains = Array.isArray(session.domains) ? session.domains : [];
      domains.forEach(domain => {
        if (domain) {
          if (!domainTrends[domain]) {
            domainTrends[domain] = [];
          }
          domainTrends[domain].push({
            date,
            score: session.overall_score || 0
          });
        }
      });
    });

    // Trend data (last 8 sessions)
    const trendData = sessions.slice(0, 8).reverse().map((session, index) => ({
      session: index + 1,
      score: session.overall_score || 0
    }));

    // Skill Rubric Analysis - extract from session details
    const rubricAnalysis: Record<string, { count: number; totalScore: number; average: number }> = {};
    sessions.forEach(session => {
      const details = session.details || [];
      if (Array.isArray(details)) {
        details.forEach((detail: any) => {
          if (detail.rubric && typeof detail.rubric === 'object') {
            Object.keys(detail.rubric).forEach(skill => {
              const score = detail.rubric[skill];
              if (typeof score === 'number') {
                if (!rubricAnalysis[skill]) {
                  rubricAnalysis[skill] = { count: 0, totalScore: 0, average: 0 };
                }
                rubricAnalysis[skill].count++;
                rubricAnalysis[skill].totalScore += score;
              }
            });
          }
        });
      }
    });

    // Calculate rubric averages
    Object.keys(rubricAnalysis).forEach(skill => {
      if (rubricAnalysis[skill].count > 0) {
        rubricAnalysis[skill].average = (rubricAnalysis[skill].totalScore / rubricAnalysis[skill].count) * 100;
      }
    });

    return {
      totalSessions,
      averageScore,
      totalXP,
      bestStreak,
      domainBreakdown,
      trendData,
      domainTrends,
      rubricAnalysis
    };
  };

  const stats = calculateStats();

  const exportData = () => {
    const csvContent = [
      ['Date', 'Domains', 'Level', 'Score', 'Duration', 'XP', 'Streak'],
      ...sessions.map(session => [
        new Date(session.created_at || session.started_at || Date.now()).toLocaleDateString(),
        Array.isArray(session.domains) ? session.domains.join(', ') : (session.domains || ''),
        session.level || '',
        session.overall_score || 0,
        Math.floor((session.duration_s || 0) / 60),
        session.flags?.xp || 0,
        session.flags?.streak || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'additional-skills-analytics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h3>
          
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filters.domain}
              onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Domains</option>
              <option value="finance">Finance</option>
              <option value="soft-skills">Soft Skills</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
              <option value="hr">HR</option>
              <option value="operations">Operations</option>
              <option value="consulting">Consulting</option>
            </select>

            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={filters.period}
              onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>

            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <i className="ri-download-line" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
          <i className="ri-bar-chart-line text-6xl text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No data yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Complete some assessments to see your analytics
          </p>
          <button
            onClick={() => window.location.hash = '#assessments'}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 whitespace-nowrap"
          >
            Start First Assessment
          </button>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Sessions</p>
                  <p className="text-3xl font-bold">{stats.totalSessions}</p>
                </div>
                <i className="ri-file-list-3-line text-3xl text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Average Score</p>
                  <p className="text-3xl font-bold">{Math.round(stats.averageScore)}%</p>
                </div>
                <i className="ri-trophy-line text-3xl text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Total XP</p>
                  <p className="text-3xl font-bold">{stats.totalXP}</p>
                </div>
                <i className="ri-star-fill text-3xl text-yellow-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Best Streak</p>
                  <p className="text-3xl font-bold">{stats.bestStreak}</p>
                </div>
                <i className="ri-fire-line text-3xl text-purple-200" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Performance Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <i className="ri-line-chart-line mr-2 text-blue-500" />
                Performance Trend
              </h3>
              <div className="space-y-4">
                {stats.trendData.length > 0 ? (
                  stats.trendData.map((point, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500 w-16">Session {point.session}</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, point.score)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white w-12">{Math.round(point.score)}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No trend data available</p>
                )}
              </div>
            </div>

            {/* Domain Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <i className="ri-bar-chart-box-line mr-2 text-green-500" />
                Domain Breakdown
              </h3>
              <div className="space-y-4">
                {Object.keys(stats.domainBreakdown).length > 0 ? (
                  Object.entries(stats.domainBreakdown).map(([domain, data]) => (
                    <div key={domain} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300 capitalize">{domain.replace('-', ' ')}</span>
                        <span className="text-sm text-gray-500">
                          {Math.round(data.average)}% ({data.count} sessions)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, data.average)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No domain data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Domain Performance Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <i className="ri-line-chart-line mr-2 text-purple-500" />
              Domain Performance Trends
            </h3>
            {Object.keys(stats.domainTrends || {}).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(stats.domainTrends).map(([domain, trendData]) => {
                  const maxScore = Math.max(...trendData.map(d => d.score), 1);
                  return (
                    <div key={domain} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {domain.replace('-', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {trendData.length} data points
                        </span>
                      </div>
                      <div className="flex items-end justify-between gap-2 h-32">
                        {trendData.map((point, index) => {
                          const heightPercent = maxScore > 0 ? (point.score / maxScore) * 100 : 0;
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center group relative">
                              <div 
                                className="w-full rounded-t-lg transition-all duration-500 hover:scale-105 relative shadow-lg bg-gradient-to-t from-purple-500 to-purple-600"
                                style={{ 
                                  height: `${Math.max(5, heightPercent)}%`, 
                                  minHeight: '10px'
                                }}
                                title={`${point.date}: ${Math.round(point.score)}%`}
                              >
                                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg" />
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center transform -rotate-45 origin-top-left whitespace-nowrap" style={{ maxWidth: '60px' }}>
                                {point.date}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No trend data available for domains</p>
            )}
          </div>

          {/* Skill Rubric Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <i className="ri-file-list-3-line mr-2 text-orange-500" />
              Skill Rubric Analysis
            </h3>
            {Object.keys(stats.rubricAnalysis || {}).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.rubricAnalysis).map(([skill, data]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{skill.replace(/_/g, ' ')}</span>
                      <span className="text-sm text-gray-500">
                        {Math.round(data.average)}% ({data.count} assessments)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, data.average)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No rubric data available. Complete assessments with detailed answers to see rubric analysis.
              </p>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <i className="ri-history-line mr-2 text-purple-500" />
              Recent Sessions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Domains</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Level</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Score</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Duration</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 10).map((session, index) => (
                    <tr key={session.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {new Date(session.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(session.domains) && session.domains.length > 0 ? (
                            session.domains.map((domain: string) => (
                              <span key={domain} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                                {domain.replace('-', ' ')}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                              N/A
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          session.level === 'Easy' ? 'bg-green-100 text-green-700' :
                          session.level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {session.level}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-semibold">
                        {Math.round(session.overall_score || 0)}%
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {Math.floor(session.duration_s / 60)}m {session.duration_s % 60}s
                      </td>
                      <td className="py-3 px-4 text-yellow-600 dark:text-yellow-400 font-semibold">
                        +{session.flags?.xp || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
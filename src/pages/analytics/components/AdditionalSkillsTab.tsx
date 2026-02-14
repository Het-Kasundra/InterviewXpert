
import { useState, useEffect } from 'react';

interface AdditionalSkillsTabProps {
  data: any[];
}

export const AdditionalSkillsTab = ({ data }: AdditionalSkillsTabProps) => {
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [chartData, setChartData] = useState<any[]>([]);

  const domains = ['Finance', 'Soft Skills', 'Marketing', 'Sales', 'HR', 'Operations', 'Consulting'];

  // Helper function to normalize domain names
  const normalizeDomain = (domain: string): string => {
    if (!domain) return '';
    // Convert data format to display format
    const domainMap: Record<string, string> = {
      'finance': 'Finance',
      'soft-skills': 'Soft Skills',
      'marketing': 'Marketing',
      'sales': 'Sales',
      'hr': 'HR',
      'operations': 'Operations',
      'consulting': 'Consulting'
    };
    return domainMap[domain.toLowerCase()] || domain;
  };

  // Helper function to convert display format to data format
  const toDataFormat = (domain: string): string => {
    const reverseMap: Record<string, string> = {
      'Finance': 'finance',
      'Soft Skills': 'soft-skills',
      'Marketing': 'marketing',
      'Sales': 'sales',
      'HR': 'hr',
      'Operations': 'operations',
      'Consulting': 'consulting'
    };
    return reverseMap[domain] || domain.toLowerCase();
  };

  useEffect(() => {
    processChartData();
  }, [data, selectedDomain]);

  const processChartData = () => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }

    // Normalize data - ensure domains is always an array
    const normalizedData = data.map(session => ({
      ...session,
      domains: Array.isArray(session.domains) 
        ? session.domains 
        : (session.domains ? [session.domains] : []),
      started_at: session.started_at || session.created_at || new Date().toISOString()
    }));

    const filteredData = selectedDomain === 'all' 
      ? normalizedData 
      : normalizedData.filter(session => {
          const sessionDomains = Array.isArray(session.domains) ? session.domains : [];
          const searchDomain = toDataFormat(selectedDomain);
          return sessionDomains.some((d: string) => 
            d.toLowerCase() === searchDomain.toLowerCase() || 
            normalizeDomain(d) === selectedDomain
          );
        });

    // Group by date and domain
    const groupedData = filteredData.reduce((acc, session) => {
      const date = new Date(session.started_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      if (!acc[date]) {
        acc[date] = {};
      }
      
      const sessionDomains = Array.isArray(session.domains) ? session.domains : [];
      sessionDomains.forEach((domain: string) => {
        const normalized = normalizeDomain(domain);
        if (normalized) {
          if (!acc[date][normalized]) {
            acc[date][normalized] = { scores: [], count: 0 };
          }
          acc[date][normalized].scores.push(session.overall_score || 0);
          acc[date][normalized].count++;
        }
      });
      
      return acc;
    }, {} as Record<string, Record<string, { scores: number[], count: number }>>);

    const processedData = Object.entries(groupedData).map(([date, domainData]) => {
      const result: any = { date };
      Object.entries(domainData).forEach(([domain, info]) => {
        if (info.scores.length > 0) {
          result[domain] = info.scores.reduce((sum, score) => sum + score, 0) / info.scores.length;
        }
      });
      return result;
    }).sort((a, b) => {
      try {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } catch {
        return 0;
      }
    });

    setChartData(processedData);
  };

  const calculateDomainStats = () => {
    const domainStats: Record<string, { avg: number, count: number, total_xp: number }> = {};
    
    if (!data || data.length === 0) {
      domains.forEach(domain => {
        domainStats[domain] = { avg: 0, count: 0, total_xp: 0 };
      });
      return domainStats;
    }

    // Normalize data - ensure domains is always an array
    const normalizedData = data.map(session => ({
      ...session,
      domains: Array.isArray(session.domains) 
        ? session.domains 
        : (session.domains ? [session.domains] : [])
    }));
    
    domains.forEach(domain => {
      const searchDomain = toDataFormat(domain);
      const domainSessions = normalizedData.filter(session => {
        const sessionDomains = Array.isArray(session.domains) ? session.domains : [];
        return sessionDomains.some((d: string) => 
          d.toLowerCase() === searchDomain.toLowerCase() || 
          normalizeDomain(d) === domain
        );
      });
      
      const scores = domainSessions.map(s => s.overall_score || 0).filter(s => s > 0);
      const avg = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 0;
      
      domainStats[domain] = {
        avg,
        count: domainSessions.length,
        total_xp: domainSessions.length * 30
      };
    });
    
    return domainStats;
  };

  const domainStats = calculateDomainStats();

  // Extract rubric data from session details
  const calculateRubricData = () => {
    if (!data || data.length === 0) {
      return { clarity: 0, relevance: 0, structure: 0, communication: 0, accuracy: 0 };
    }

    const rubricScores: Record<string, number[]> = {
      clarity: [],
      relevance: [],
      structure: [],
      communication: [],
      accuracy: []
    };

    data.forEach(session => {
      // Check if rubric is at session level
      if (session.rubric && typeof session.rubric === 'object') {
        Object.keys(rubricScores).forEach(key => {
          if (session.rubric[key] !== undefined && typeof session.rubric[key] === 'number') {
            rubricScores[key].push(session.rubric[key]);
          }
        });
      }

      // Check if rubric is in details array
      const details = session.details || [];
      if (Array.isArray(details)) {
        details.forEach((detail: any) => {
          if (detail.rubric && typeof detail.rubric === 'object') {
            Object.keys(rubricScores).forEach(key => {
              if (detail.rubric[key] !== undefined && typeof detail.rubric[key] === 'number') {
                rubricScores[key].push(detail.rubric[key]);
              }
            });
          }
        });
      }
    });

    // Calculate averages
    const rubricData: Record<string, number> = {};
    Object.keys(rubricScores).forEach(key => {
      const scores = rubricScores[key];
      rubricData[key] = scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;
    });

    return rubricData;
  };

  const rubricData = calculateRubricData();

  const totalXP = data && data.length > 0 ? data.reduce((sum, session) => sum + (session.flags?.xp || 30), 0) : 0;
  const avgScore = data && data.length > 0 ? data.reduce((sum, s) => sum + (s.overall_score || 0), 0) / data.length : 0;

  const domainColors = {
    Finance: 'from-green-500 to-emerald-500',
    'Soft Skills': 'from-blue-500 to-cyan-500',
    Marketing: 'from-purple-500 to-pink-500',
    Sales: 'from-orange-500 to-red-500',
    HR: 'from-indigo-500 to-purple-500',
    Operations: 'from-yellow-500 to-orange-500',
    Consulting: 'from-teal-500 to-green-500'
  };

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-star-line text-3xl opacity-80" />
            <div className="text-right">
              <div className="text-2xl font-bold">{avgScore.toFixed(1)}%</div>
              <div className="text-sm opacity-80">Average Score</div>
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${avgScore}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-trophy-line text-3xl opacity-80" />
            <div className="text-right">
              <div className="text-2xl font-bold">{totalXP}</div>
              <div className="text-sm opacity-80">Total XP</div>
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, totalXP / 50)}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-file-list-line text-3xl opacity-80" />
            <div className="text-right">
              <div className="text-2xl font-bold">{data.length}</div>
              <div className="text-sm opacity-80">Sessions</div>
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, data.length * 10)}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-compass-line text-3xl opacity-80" />
            <div className="text-right">
              <div className="text-2xl font-bold">{Object.keys(domainStats).filter(d => domainStats[d].count > 0).length}</div>
              <div className="text-sm opacity-80">Domains</div>
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${(Object.keys(domainStats).filter(d => domainStats[d].count > 0).length / domains.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Domain Performance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Domain Performance Trends
          </h3>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Domains</option>
            {domains.map(domain => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
        </div>

        {chartData.length > 0 || Object.keys(domainStats).some(d => domainStats[d].count > 0) ? (
          <div className="space-y-4">
            {/* Enhanced Multi-domain Bar Chart */}
            <div className="h-80 bg-gradient-to-b from-yellow-50 via-orange-50 to-transparent dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-transparent rounded-xl p-6 relative overflow-hidden border border-yellow-200 dark:border-yellow-800">
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-20">
                {[0, 25, 50, 75, 100].map((line) => (
                  <div
                    key={line}
                    className="absolute left-0 right-0 border-t border-yellow-400 dark:border-yellow-600"
                    style={{ bottom: `${line}%` }}
                  />
                ))}
              </div>
              
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-600 dark:text-gray-400 pr-2">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>
              
              {/* Chart representation */}
              <div className="relative h-full ml-12">
                {selectedDomain === 'all' ? (
                  // Enhanced multiple domain bars
                  <div className="flex items-end justify-between gap-3 h-full">
                    {domains.map((domain) => {
                      const avg = domainStats[domain]?.avg || 0;
                      const count = domainStats[domain]?.count || 0;
                      const heightPercent = Math.max(5, avg);
                      const hasData = count > 0;
                      
                      return (
                        <div key={domain} className="flex-1 flex flex-col items-center group relative">
                          {/* Bar */}
                          <div 
                            className={`w-full rounded-t-lg transition-all duration-500 hover:scale-105 relative shadow-lg ${
                              hasData 
                                ? `bg-gradient-to-t ${domainColors[domain as keyof typeof domainColors]}` 
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                            style={{ 
                              height: `${heightPercent}%`, 
                              minHeight: hasData ? '20px' : '4px',
                              boxShadow: hasData ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none'
                            }}
                          >
                            {hasData && (
                              <>
                                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg" />
                                {/* Value label */}
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {avg.toFixed(1)}%
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* Domain label */}
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center font-medium max-w-full truncate">
                            {domain}
                          </div>
                          
                          {/* Count badge */}
                          {count > 0 && (
                            <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {count}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Enhanced single domain trend
                  <div className="flex items-end justify-between gap-2 h-full">
                    {chartData.map((point, index) => {
                      const score = point[selectedDomain] || 0;
                      const heightPercent = Math.max(5, score);
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center group relative">
                          {/* Bar */}
                          <div 
                            className={`w-full rounded-t-lg transition-all duration-500 hover:scale-105 relative shadow-lg bg-gradient-to-t ${domainColors[selectedDomain as keyof typeof domainColors]}`}
                            style={{ 
                              height: `${heightPercent}%`, 
                              minHeight: '20px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg" />
                            
                            {/* Value label */}
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {score.toFixed(1)}%
                            </div>
                          </div>
                          
                          {/* Date label */}
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center font-medium">
                            {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Legend */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {selectedDomain === 'all' ? (
                  domains.filter(d => domainStats[d]?.count > 0).map(domain => (
                    <div key={domain} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 bg-gradient-to-r ${domainColors[domain as keyof typeof domainColors]} rounded`} />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{domain}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 bg-gradient-to-r ${domainColors[selectedDomain as keyof typeof domainColors]} rounded`} />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{selectedDomain} Performance</span>
                  </div>
                )}
              </div>
              {selectedDomain === 'all' && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Sessions: <span className="font-bold text-yellow-600 dark:text-yellow-400">
                    {data.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="ri-bar-chart-line text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No skills data</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Complete some skill assessments to see your performance trends
            </p>
          </div>
        )}
      </div>

      {/* Domain Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Domain Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Domain Breakdown
          </h3>
          
          <div className="space-y-4">
            {domains.map(domain => (
              <div key={domain} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {domain}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {domainStats[domain]?.avg.toFixed(1) || '0.0'}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ({domainStats[domain]?.count || 0} sessions)
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${domainColors[domain as keyof typeof domainColors]} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${domainStats[domain]?.avg || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rubric Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Skill Rubric Analysis
          </h3>

          <div className="space-y-4">
            {Object.entries(rubricData).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                    {key}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {value.toFixed(1)}/10
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(value / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Top Strength Badge */}
          {data.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <i className="ri-star-line text-yellow-600 dark:text-yellow-400 text-lg" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Top Strength</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {Object.entries(rubricData).reduce((a, b) => rubricData[a[0] as keyof typeof rubricData] > rubricData[b[0] as keyof typeof rubricData] ? a : b)[0]}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Recent Sessions
        </h3>

        {data.length > 0 ? (
          <div className="space-y-4">
            {data.slice(0, 5).map((session, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-160">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                    <i className="ri-star-line text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {session.domains?.join(', ') || 'Skills Assessment'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(session.started_at).toLocaleDateString()} • {session.level || 'Medium'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {session.overall_score?.toFixed(1) || '0.0'}%
                  </div>
                  <div className={`text-sm ${
                    (session.overall_score || 0) >= 80 ? 'text-green-600' :
                    (session.overall_score || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {(session.overall_score || 0) >= 80 ? 'Excellent' :
                     (session.overall_score || 0) >= 60 ? 'Good' : 'Needs Work'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <i className="ri-star-line text-4xl text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              No skill sessions completed yet. Start practicing to see your results!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


import { useState, useEffect } from 'react';

interface InterviewTabProps {
  data: any[];
}

export const InterviewTab = ({ data }: InterviewTabProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    processChartData();
  }, [data, selectedPeriod]);

  const processChartData = () => {
    const days = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredData = data.filter(interview => 
      new Date(interview.started_at) >= cutoffDate
    );

    // Group by date and calculate averages
    const groupedData = filteredData.reduce((acc, interview) => {
      const date = new Date(interview.started_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { scores: [], count: 0 };
      }
      acc[date].scores.push(interview.overall_score || 0);
      acc[date].count++;
      return acc;
    }, {} as Record<string, { scores: number[], count: number }>);

    const processedData = Object.entries(groupedData).map(([date, info]) => ({
      date,
      score: info.scores.reduce((sum, score) => sum + score, 0) / info.scores.length,
      count: info.count
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setChartData(processedData);
  };

  const calculateStats = () => {
    if (data.length === 0) return { avg: 0, improvement: 0, total: 0, bestScore: 0 };

    const scores = data.map(d => d.overall_score || 0);
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const firstScore = scores[scores.length - 1] || 0;
    const latestScore = scores[0] || 0;
    const improvement = firstScore > 0 ? ((latestScore - firstScore) / firstScore) * 100 : 0;

    return { avg, improvement, total: data.length, bestScore };
  };

  const stats = calculateStats();

  const rubricData = data.length > 0 ? {
    clarity: data.reduce((sum, d) => sum + (d.rubric?.clarity || 0), 0) / data.length,
    depth: data.reduce((sum, d) => sum + (d.rubric?.depth || 0), 0) / data.length,
    structure: data.reduce((sum, d) => sum + (d.rubric?.structure || 0), 0) / data.length,
    communication: data.reduce((sum, d) => sum + (d.rubric?.communication || 0), 0) / data.length,
    technical: data.reduce((sum, d) => sum + (d.rubric?.technical_accuracy || 0), 0) / data.length
  } : { clarity: 0, depth: 0, structure: 0, communication: 0, technical: 0 };

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-trophy-line text-3xl opacity-80" />
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.avg.toFixed(1)}%</div>
              <div className="text-sm opacity-80">Average Score</div>
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${stats.avg}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-trending-up-line text-3xl opacity-80" />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {stats.improvement > 0 ? '+' : ''}{stats.improvement.toFixed(1)}%
              </div>
              <div className="text-sm opacity-80">Improvement</div>
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.abs(stats.improvement))}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-file-list-line text-3xl opacity-80" />
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm opacity-80">Total Interviews</div>
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, stats.total * 10)}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-star-line text-3xl opacity-80" />
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.bestScore.toFixed(1)}%</div>
              <div className="text-sm opacity-80">Best Score</div>
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${stats.bestScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Performance Trend
          </h3>
          <div className="flex space-x-2">
            {['7', '30', '90'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all duration-160 whitespace-nowrap
                  ${selectedPeriod === period
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {period} days
              </button>
            ))}
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="space-y-4">
            {/* Enhanced Bar Chart with better visibility */}
            <div className="h-80 bg-gradient-to-b from-blue-50 via-purple-50 to-transparent dark:from-blue-900/20 dark:via-purple-900/20 dark:to-transparent rounded-xl p-6 relative overflow-hidden border border-blue-200 dark:border-blue-800">
              {/* Grid lines for better readability */}
              <div className="absolute inset-0 opacity-20">
                {[0, 25, 50, 75, 100].map((line) => (
                  <div
                    key={line}
                    className="absolute left-0 right-0 border-t border-blue-400 dark:border-blue-600"
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
              
              {/* Chart bars with better styling */}
              <div className="relative h-full ml-12 flex items-end justify-between gap-2">
                {chartData.map((point, index) => {
                  const heightPercent = Math.max(5, (point.score / 100) * 100);
                  const maxScore = Math.max(...chartData.map(p => p.score));
                  const isMax = point.score === maxScore;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group relative">
                      {/* Bar with gradient and glow */}
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-500 hover:scale-105 relative shadow-lg ${
                          isMax 
                            ? 'bg-gradient-to-t from-yellow-500 via-yellow-400 to-yellow-300' 
                            : 'bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400'
                        }`}
                        style={{ 
                          height: `${heightPercent}%`, 
                          minHeight: '20px',
                          boxShadow: isMax ? '0 0 20px rgba(234, 179, 8, 0.6)' : '0 4px 12px rgba(59, 130, 246, 0.4)'
                        }}
                      >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg" />
                        
                        {/* Value label on bar */}
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {point.score.toFixed(1)}%
                        </div>
                      </div>
                      
                      {/* Date label */}
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center font-medium">
                        {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      
                      {/* Count badge */}
                      {point.count > 1 && (
                        <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {point.count}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Chart legend and stats */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-400 rounded" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Interview Scores</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Best Score</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Average: <span className="font-bold text-blue-600 dark:text-blue-400">
                  {(chartData.reduce((sum, p) => sum + p.score, 0) / chartData.length).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="ri-line-chart-line text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No interview data</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Complete some interviews to see your performance trends
            </p>
          </div>
        )}
      </div>

      {/* Rubric Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Skill Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Enhanced Radar Chart */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-4">Performance Radar</h4>
            <div className="relative w-64 h-64 mx-auto bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full p-4">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                {/* Grid circles */}
                {[1, 2, 3, 4, 5].map((level) => (
                  <circle
                    key={level}
                    cx="100"
                    cy="100"
                    r={level * 18}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-gray-300 dark:text-gray-600"
                  />
                ))}
                
                {/* Grid lines (5 axes) */}
                {[0, 1, 2, 3, 4].map((index) => {
                  const angle = (index * 72 - 90) * (Math.PI / 180);
                  const x2 = 100 + Math.cos(angle) * 90;
                  const y2 = 100 + Math.sin(angle) * 90;
                  return (
                    <line
                      key={index}
                      x1="100"
                      y1="100"
                      x2={x2}
                      y2={y2}
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-gray-300 dark:text-gray-600"
                    />
                  );
                })}
                
                {/* Radar polygon */}
                <polygon
                  points={Object.entries(rubricData).map(([key, value], index) => {
                    const angle = (index * 72 - 90) * (Math.PI / 180);
                    const radius = (value / 10) * 90;
                    const x = 100 + Math.cos(angle) * radius;
                    const y = 100 + Math.sin(angle) * radius;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="rgba(59, 130, 246, 0.3)"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="2"
                />
                
                {/* Data points */}
                {Object.entries(rubricData).map(([key, value], index) => {
                  const angle = (index * 72 - 90) * (Math.PI / 180);
                  const radius = (value / 10) * 90;
                  const x = 100 + Math.cos(angle) * radius;
                  const y = 100 + Math.sin(angle) * radius;
                  
                  return (
                    <g key={key}>
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="rgb(59, 130, 246)"
                        stroke="white"
                        strokeWidth="2"
                      />
                      {/* Labels */}
                      <text
                        x={100 + Math.cos(angle) * 100}
                        y={100 + Math.sin(angle) * 100}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs font-medium fill-gray-700 dark:fill-gray-300"
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Rubric Bars */}
          <div className="space-y-4">
            {Object.entries(rubricData).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                    {key.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {value.toFixed(1)}/10
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(value / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Recent Interviews
        </h3>

        {data.length > 0 ? (
          <div className="space-y-4">
            {data.slice(0, 5).map((interview, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-160">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <i className="ri-mic-line text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {interview.role || 'Technical Interview'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(interview.started_at).toLocaleDateString()} • {interview.difficulty || 'Medium'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {interview.overall_score?.toFixed(1) || '0.0'}%
                  </div>
                  <div className={`text-sm ${
                    (interview.overall_score || 0) >= 80 ? 'text-green-600' :
                    (interview.overall_score || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {(interview.overall_score || 0) >= 80 ? 'Excellent' :
                     (interview.overall_score || 0) >= 60 ? 'Good' : 'Needs Work'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <i className="ri-mic-line text-4xl text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              No interviews completed yet. Start practicing to see your results!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

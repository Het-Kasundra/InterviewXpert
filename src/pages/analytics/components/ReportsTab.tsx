
import { useState } from 'react';

interface ReportsTabProps {
  data: {
    interviews: any[];
    additionalSkills: any[];
    overallStats: {
      avgInterviewScore: number;
      avgSkillsScore: number;
      totalXP: number;
      streakDays: number;
      improvementPercent: number;
    };
  };
}

export const ReportsTab = ({ data }: ReportsTabProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [exportFormat, setExportFormat] = useState('pdf');

  const generateReport = () => {
    const reportData = {
      period: selectedPeriod,
      generated: new Date().toISOString(),
      stats: data.overallStats,
      interviews: data.interviews.slice(0, parseInt(selectedPeriod)),
      skills: data.additionalSkills.slice(0, parseInt(selectedPeriod))
    };

    if (exportFormat === 'csv') {
      exportToCSV(reportData);
    } else {
      exportToPDF(reportData);
    }
  };

  const exportToCSV = (reportData: any) => {
    const csvContent = [
      ['Report Type', 'InterviewXpert Analytics Report'],
      ['Generated', new Date().toLocaleDateString()],
      ['Period', `Last ${selectedPeriod} entries`],
      [''],
      ['Overall Statistics'],
      ['Average Interview Score', `${reportData.stats.avgInterviewScore.toFixed(1)}%`],
      ['Average Skills Score', `${reportData.stats.avgSkillsScore.toFixed(1)}%`],
      ['Total XP', reportData.stats.totalXP],
      ['Streak Days', reportData.stats.streakDays],
      ['Improvement', `${reportData.stats.improvementPercent.toFixed(1)}%`],
      [''],
      ['Interview History'],
      ['Date', 'Role', 'Score', 'Difficulty'],
      ...reportData.interviews.map((interview: any) => [
        new Date(interview.started_at).toLocaleDateString(),
        interview.role || 'Technical',
        `${interview.overall_score?.toFixed(1) || '0.0'}%`,
        interview.difficulty || 'Medium'
      ]),
      [''],
      ['Skills History'],
      ['Date', 'Domains', 'Score', 'Level'],
      ...reportData.skills.map((skill: any) => [
        new Date(skill.started_at).toLocaleDateString(),
        skill.domains?.join(', ') || 'General',
        `${skill.overall_score?.toFixed(1) || '0.0'}%`,
        skill.level || 'Medium'
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interviewxpert-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (reportData: any) => {
    // Create a simple HTML report that can be printed as PDF
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>InterviewXpert Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
          .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>InterviewXpert Analytics Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <p>Period: Last ${selectedPeriod} entries</p>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <h3>Interview Performance</h3>
            <p>Average Score: ${reportData.stats.avgInterviewScore.toFixed(1)}%</p>
            <p>Improvement: ${reportData.stats.improvementPercent.toFixed(1)}%</p>
          </div>
          <div class="stat-card">
            <h3>Skills Performance</h3>
            <p>Average Score: ${reportData.stats.avgSkillsScore.toFixed(1)}%</p>
            <p>Total XP: ${reportData.stats.totalXP}</p>
          </div>
          <div class="stat-card">
            <h3>Activity</h3>
            <p>Streak Days: ${reportData.stats.streakDays}</p>
            <p>Total Sessions: ${reportData.interviews.length + reportData.skills.length}</p>
          </div>
        </div>

        <h2>Interview History</h2>
        <table class="table">
          <thead>
            <tr><th>Date</th><th>Role</th><th>Score</th><th>Difficulty</th></tr>
          </thead>
          <tbody>
            ${reportData.interviews.map((interview: any) => `
              <tr>
                <td>${new Date(interview.started_at).toLocaleDateString()}</td>
                <td>${interview.role || 'Technical'}</td>
                <td>${interview.overall_score?.toFixed(1) || '0.0'}%</td>
                <td>${interview.difficulty || 'Medium'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Skills History</h2>
        <table class="table">
          <thead>
            <tr><th>Date</th><th>Domains</th><th>Score</th><th>Level</th></tr>
          </thead>
          <tbody>
            ${reportData.skills.map((skill: any) => `
              <tr>
                <td>${new Date(skill.started_at).toLocaleDateString()}</td>
                <td>${skill.domains?.join(', ') || 'General'}</td>
                <td>${skill.overall_score?.toFixed(1) || '0.0'}%</td>
                <td>${skill.level || 'Medium'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interviewxpert-report-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateComparativeStats = () => {
    const interviewGrowth = data.overallStats.improvementPercent;
    const skillsGrowth = data.additionalSkills.length > 1 ? 
      ((data.additionalSkills[0]?.overall_score || 0) - (data.additionalSkills[data.additionalSkills.length - 1]?.overall_score || 0)) : 0;
    
    const bestPerformingArea = data.overallStats.avgInterviewScore > data.overallStats.avgSkillsScore ? 'Interviews' : 'Additional Skills';
    const weakestArea = data.overallStats.avgInterviewScore < data.overallStats.avgSkillsScore ? 'Interviews' : 'Additional Skills';

    return { interviewGrowth, skillsGrowth, bestPerformingArea, weakestArea };
  };

  const comparativeStats = calculateComparativeStats();

  const generateMilestones = () => {
    const milestones = [];
    
    if (data.interviews.length > 0) {
      milestones.push({
        date: data.interviews[data.interviews.length - 1].started_at,
        title: 'First Interview Completed',
        icon: 'ri-mic-line',
        color: 'text-blue-600'
      });
    }
    
    if (data.additionalSkills.length > 0) {
      milestones.push({
        date: data.additionalSkills[data.additionalSkills.length - 1].started_at,
        title: 'First Skills Assessment',
        icon: 'ri-star-line',
        color: 'text-yellow-600'
      });
    }

    if (data.overallStats.streakDays >= 7) {
      milestones.push({
        date: new Date().toISOString(),
        title: '7-Day Streak Achieved',
        icon: 'ri-fire-line',
        color: 'text-red-600'
      });
    }

    if (data.overallStats.avgInterviewScore >= 80) {
      milestones.push({
        date: new Date().toISOString(),
        title: 'High Performer Badge',
        icon: 'ri-trophy-line',
        color: 'text-purple-600'
      });
    }

    return milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const milestones = generateMilestones();

  return (
    <div className="space-y-8">
      {/* Export Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Export Analytics Report
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 entries</option>
              <option value="30">Last 30 entries</option>
              <option value="90">Last 90 entries</option>
              <option value="all">All time</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pdf">PDF Report</option>
              <option value="csv">CSV Data</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateReport}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-160 whitespace-nowrap"
            >
              <i className="ri-download-line mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Comparative Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Performance Comparison
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <i className="ri-mic-line text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Interview Growth</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">vs first interview</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  comparativeStats.interviewGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {comparativeStats.interviewGrowth >= 0 ? '+' : ''}{comparativeStats.interviewGrowth.toFixed(1)}%
                </div>
                <i className={`ri-arrow-${comparativeStats.interviewGrowth >= 0 ? 'up' : 'down'}-line text-sm ${
                  comparativeStats.interviewGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <i className="ri-star-line text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Skills Growth</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">vs first assessment</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  comparativeStats.skillsGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {comparativeStats.skillsGrowth >= 0 ? '+' : ''}{comparativeStats.skillsGrowth.toFixed(1)}%
                </div>
                <i className={`ri-arrow-${comparativeStats.skillsGrowth >= 0 ? 'up' : 'down'}-line text-sm ${
                  comparativeStats.skillsGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <i className="ri-trophy-line text-2xl text-green-600 dark:text-green-400 mb-2" />
                <div className="font-semibold text-gray-900 dark:text-white">Best Area</div>
                <div className="text-sm text-green-600 dark:text-green-400">{comparativeStats.bestPerformingArea}</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <i className="ri-focus-line text-2xl text-orange-600 dark:text-orange-400 mb-2" />
                <div className="font-semibold text-gray-900 dark:text-white">Focus Area</div>
                <div className="text-sm text-orange-600 dark:text-orange-400">{comparativeStats.weakestArea}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Achievement Timeline
          </h3>
          
          <div className="space-y-4">
            {milestones.length > 0 ? (
              milestones.map((milestone, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <i className={`${milestone.icon} ${milestone.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {milestone.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(milestone.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <i className="ri-calendar-line text-4xl text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  Complete activities to unlock achievements!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Activity Heatmap
        </h3>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Your learning activity over the past 12 weeks
          </div>
          
          {/* Simplified heatmap representation */}
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 84 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (83 - i));
              
              const dayActivity = [
                ...data.interviews.filter(interview => 
                  new Date(interview.started_at).toDateString() === date.toDateString()
                ),
                ...data.additionalSkills.filter(skill => 
                  new Date(skill.started_at).toDateString() === date.toDateString()
                )
              ].length;
              
              const intensity = Math.min(dayActivity, 4);
              const colors = [
                'bg-gray-100 dark:bg-gray-700',
                'bg-green-200 dark:bg-green-800',
                'bg-green-300 dark:bg-green-700',
                'bg-green-400 dark:bg-green-600',
                'bg-green-500 dark:bg-green-500'
              ];
              
              return (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-sm ${colors[intensity]} transition-all duration-160 hover:scale-125`}
                  title={`${date.toLocaleDateString()}: ${dayActivity} activities`}
                />
              );
            })}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>12 weeks ago</span>
            <div className="flex items-center space-x-2">
              <span>Less</span>
              <div className="flex space-x-1">
                {[0, 1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded-sm ${
                      level === 0 ? 'bg-gray-100 dark:bg-gray-700' :
                      level === 1 ? 'bg-green-200 dark:bg-green-800' :
                      level === 2 ? 'bg-green-300 dark:bg-green-700' :
                      level === 3 ? 'bg-green-400 dark:bg-green-600' :
                      'bg-green-500 dark:bg-green-500'
                    }`}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Summary Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {data.interviews.length + data.additionalSkills.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {data.overallStats.totalXP}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Experience Points</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {data.overallStats.streakDays}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
};

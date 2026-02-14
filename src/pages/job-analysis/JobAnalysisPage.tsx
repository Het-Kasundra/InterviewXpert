import { useState } from 'react';
import { useSession } from '../../contexts/SessionProvider';
import { parseJobDescription, analyzeJobMatch, type ParsedJobDescription, type JobMatchAnalysis } from '../../lib/aiJobDescriptionService';
import { motion } from 'framer-motion';

export const JobAnalysisPage = () => {
  const { user } = useSession();
  const [jobDescription, setJobDescription] = useState('');
  const [userSkills, setUserSkills] = useState('');
  const [userExperience, setUserExperience] = useState<'junior' | 'mid' | 'senior'>('mid');
  const [parsedJD, setParsedJD] = useState<ParsedJobDescription | null>(null);
  const [matchAnalysis, setMatchAnalysis] = useState<JobMatchAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'parse' | 'match' | 'prep'>('parse');

  const handleParseJD = async () => {
    if (!jobDescription.trim()) {
      alert('Please paste a job description');
      return;
    }

    setLoading(true);
    try {
      const parsed = await parseJobDescription(jobDescription);
      setParsedJD(parsed);
      setActiveTab('parse');
    } catch (error) {
      console.error('Error parsing JD:', error);
      alert('Failed to parse job description. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeMatch = async () => {
    if (!jobDescription.trim()) {
      alert('Please paste a job description');
      return;
    }

    if (!userSkills.trim()) {
      alert('Please enter your skills (comma-separated)');
      return;
    }

    setLoading(true);
    try {
      const skillsArray = userSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const analysis = await analyzeJobMatch({
        jobDescription,
        userSkills: skillsArray,
        userExperience,
      });
      setMatchAnalysis(analysis);
      setActiveTab('match');
    } catch (error) {
      console.error('Error analyzing match:', error);
      alert('Failed to analyze job match. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Description Analysis</h1>
        <p className="text-gray-600">Analyze job descriptions and see how well you match</p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Skills (comma-separated)
            </label>
            <input
              type="text"
              value={userSkills}
              onChange={(e) => setUserSkills(e.target.value)}
              placeholder="e.g., React, Node.js, TypeScript"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              value={userExperience}
              onChange={(e) => setUserExperience(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid-Level</option>
              <option value="senior">Senior</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleParseJD}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Parse Job Description
          </button>
          <button
            onClick={handleAnalyzeMatch}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze Match
          </button>
        </div>
      </div>

      {/* Results Tabs */}
      {(!loading && (parsedJD || matchAnalysis)) && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'parse', label: 'Parsed JD', icon: '📄', show: !!parsedJD },
                { id: 'match', label: 'Match Analysis', icon: '🎯', show: !!matchAnalysis },
                { id: 'prep', label: 'Interview Prep', icon: '📚', show: !!matchAnalysis },
              ].filter(tab => tab.show).map((tab) => (
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
            {activeTab === 'parse' && parsedJD && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Title:</span>
                      <p className="text-gray-900">{parsedJD.title}</p>
                    </div>
                    {parsedJD.company && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Company:</span>
                        <p className="text-gray-900">{parsedJD.company}</p>
                      </div>
                    )}
                    {parsedJD.experienceLevel && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Experience Level:</span>
                        <p className="text-gray-900 capitalize">{parsedJD.experienceLevel}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedJD.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {parsedJD.preferredSkills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Preferred Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedJD.preferredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {parsedJD.responsibilities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Responsibilities</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {parsedJD.responsibilities.map((resp, idx) => (
                        <li key={idx}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'match' && matchAnalysis && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${getMatchColor(matchAnalysis.overallMatch)}`}>
                    <p className="text-sm font-medium mb-1">Overall Match</p>
                    <p className="text-3xl font-bold">{matchAnalysis.overallMatch}%</p>
                  </div>
                  <div className={`p-4 rounded-lg ${getMatchColor(matchAnalysis.skillMatch)}`}>
                    <p className="text-sm font-medium mb-1">Skill Match</p>
                    <p className="text-3xl font-bold">{matchAnalysis.skillMatch}%</p>
                  </div>
                  <div className={`p-4 rounded-lg ${getMatchColor(matchAnalysis.experienceMatch)}`}>
                    <p className="text-sm font-medium mb-1">Experience Match</p>
                    <p className="text-3xl font-bold">{matchAnalysis.experienceMatch}%</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Skill Matches</h4>
                  <div className="space-y-2">
                    {matchAnalysis.skillMatches.map((match, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-gray-900">{match.skill}</span>
                        <div className="flex items-center gap-2">
                          {match.match ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              ✓ Match
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              Missing
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {matchAnalysis.missingSkills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-900 mb-2">Missing Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {matchAnalysis.missingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {matchAnalysis.strongMatches.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">Strong Matches</h4>
                    <div className="flex flex-wrap gap-2">
                      {matchAnalysis.strongMatches.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {matchAnalysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {matchAnalysis.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'prep' && matchAnalysis && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Focus Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {matchAnalysis.interviewPrep.focusAreas.map((area) => (
                      <span
                        key={area}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {matchAnalysis.interviewPrep.likelyQuestions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Likely Interview Questions</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {matchAnalysis.interviewPrep.likelyQuestions.map((question, idx) => (
                        <li key={idx}>{question}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Analyzing...</p>
        </div>
      )}
    </div>
  );
};


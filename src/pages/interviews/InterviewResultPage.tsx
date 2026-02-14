
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../contexts/SessionProvider';
import { supabase } from '../../lib/supabaseClient';

interface Interview {
  id: string;
  user_id: string;
  role: string;
  skills: string[];
  mode: string;
  difficulty: string;
  started_at: string;
  ended_at: string;
  overall_score: number;
  transcript: any[];
}

interface RubricScore {
  clarity: number;
  depth: number;
  relevance: number;
  structure: number;
  communication: number;
  technical: number;
}

export const InterviewResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [rubricScores, setRubricScores] = useState<RubricScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'feedback'>('overview');

  useEffect(() => {
    if (!session?.user) {
      navigate('/login');
      return;
    }
    
    fetchInterview();
  }, [id, session, navigate]);

  const fetchInterview = async () => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', id)
        .eq('user_id', session!.user.id)
        .single();

      if (error) throw error;
      
      setInterview(data);
      calculateRubricScores(data);
    } catch (error) {
      console.error('Error fetching interview:', error);
      navigate('/interviews');
    } finally {
      setLoading(false);
    }
  };

  const calculateRubricScores = (interview: Interview) => {
    const answers = interview.transcript || [];
    
    if (answers.length === 0) {
      setRubricScores({
        clarity: 0,
        depth: 0,
        relevance: 0,
        structure: 0,
        communication: 0,
        technical: 0
      });
      return;
    }
    
    // Calculate MCQ accuracy
    const mcqAnswers = answers.filter(a => a.type === 'mcq');
    const mcqCorrect = mcqAnswers.filter(a => a.correct === true).length;
    const mcqAccuracy = mcqAnswers.length > 0 
      ? (mcqCorrect / mcqAnswers.length) * 100 
      : 0;
    
    // Calculate code/debugging scores
    const codeAnswers = answers.filter(a => a.type === 'code' || a.type === 'debugging');
    let codeAccuracy = 0;
    if (codeAnswers.length > 0) {
      const totalPassed = codeAnswers.reduce((acc, answer) => {
        if (answer.tests && answer.tests.total > 0) {
          return acc + (answer.tests.passed / answer.tests.total);
        }
        return acc;
      }, 0);
      codeAccuracy = (totalPassed / codeAnswers.length) * 100;
    }
    
    // Calculate text answer scores from rubrics
    const textAnswers = answers.filter(a => a.type === 'qa');
    const rubricSum = textAnswers.reduce((acc, answer) => {
      if (answer.rubric) {
        return {
          clarity: acc.clarity + (answer.rubric.clarity || 0),
          depth: acc.depth + (answer.rubric.depth || 0),
          relevance: acc.relevance + (answer.rubric.relevance || 0),
          structure: acc.structure + (answer.rubric.structure || 0),
          communication: acc.communication + (answer.rubric.communication || 0),
          accuracy: acc.accuracy + (answer.rubric.accuracy || 0)
        };
      }
      return acc;
    }, { clarity: 0, depth: 0, relevance: 0, structure: 0, communication: 0, accuracy: 0 });
    
    // Calculate averages and convert to 0-100 scale
    const textCount = textAnswers.length || 1;
    const avgRubric = {
      clarity: (rubricSum.clarity / textCount) * 10,
      depth: (rubricSum.depth / textCount) * 10,
      relevance: (rubricSum.relevance / textCount) * 10,
      structure: (rubricSum.structure / textCount) * 10,
      communication: (rubricSum.communication / textCount) * 10,
      accuracy: (rubricSum.accuracy / textCount) * 10
    };

    // Combine all answer types for comprehensive scoring
    const totalAnswers = answers.length;
    const textWeight = textAnswers.length / totalAnswers;
    const mcqWeight = mcqAnswers.length / totalAnswers;
    const codeWeight = codeAnswers.length / totalAnswers;

    const scores: RubricScore = {
      clarity: Math.min(100, Math.max(0, 
        (avgRubric.clarity * textWeight) + 
        (mcqAccuracy * mcqWeight * 0.3) + 
        (codeAccuracy * codeWeight * 0.2)
      )),
      depth: Math.min(100, Math.max(0, 
        (avgRubric.depth * textWeight) + 
        (codeAccuracy * codeWeight * 0.5)
      )),
      relevance: Math.min(100, Math.max(0, 
        (avgRubric.relevance * textWeight) + 
        (mcqAccuracy * mcqWeight * 0.4)
      )),
      structure: Math.min(100, Math.max(0, 
        (avgRubric.structure * textWeight) + 
        (avgRubric.communication * textWeight * 0.3)
      )),
      communication: Math.min(100, Math.max(0, 
        (avgRubric.communication * textWeight) + 
        (avgRubric.clarity * textWeight * 0.3)
      )),
      technical: Math.min(100, Math.max(0, 
        (mcqAccuracy * mcqWeight) + 
        (codeAccuracy * codeWeight) + 
        (avgRubric.accuracy * textWeight * 0.3)
      ))
    };

    setRubricScores(scores);
  };

  const getGradeBand = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' };
    if (score >= 70) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    if (score >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    if (score >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' };
  };

  const getStrengths = () => {
    if (!rubricScores) return [];
    
    const scores = Object.entries(rubricScores);
    return scores
      .filter(([_, score]) => score >= 70)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([area, score]) => ({
        area: area.charAt(0).toUpperCase() + area.slice(1),
        score: Math.round(score)
      }));
  };

  const getWeaknesses = () => {
    if (!rubricScores) return [];
    
    const scores = Object.entries(rubricScores);
    return scores
      .filter(([_, score]) => score < 70)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([area, score]) => ({
        area: area.charAt(0).toUpperCase() + area.slice(1),
        score: Math.round(score)
      }));
  };

  const getSuggestions = () => {
    const weaknesses = getWeaknesses();
    const suggestions = [];

    if (weaknesses.some(w => w.area === 'Structure')) {
      suggestions.push('Practice using the STAR method (Situation, Task, Action, Result) for behavioral questions');
    }
    if (weaknesses.some(w => w.area === 'Technical')) {
      suggestions.push('Review fundamental concepts and practice coding problems on platforms like LeetCode');
    }
    if (weaknesses.some(w => w.area === 'Communication')) {
      suggestions.push('Practice explaining technical concepts in simple terms and reduce filler words');
    }
    if (weaknesses.some(w => w.area === 'Clarity')) {
      suggestions.push('Structure your answers more clearly with introduction, main points, and conclusion');
    }
    if (weaknesses.some(w => w.area === 'Depth')) {
      suggestions.push('Provide more detailed examples and elaborate on your thought process');
    }

    // Add general suggestions
    suggestions.push('Record yourself practicing to improve delivery and confidence');
    suggestions.push('Research the company and role thoroughly before real interviews');

    return suggestions.slice(0, 5);
  };

  const handleRetake = () => {
    // Reconstruct config from interview data
    const config = {
      roles: interview!.skills,
      level: interview!.difficulty,
      type: 'mix', // Default since we don't store this
      questionTypes: ['mcq', 'qa', 'code', 'debugging'],
      duration: 30, // Default
      inputMode: interview!.mode === 'voice' ? 'voice' : interview!.mode === 'text' ? 'text' : 'text-voice'
    };
    
    sessionStorage.setItem('interviewConfig', JSON.stringify(config));
    navigate('/interviews/runner');
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    return `${diffMins} minutes`;
  };

  const calculateAccurateScore = (answers: any[]) => {
    if (!answers || answers.length === 0) return 0;
    
    const weights = { mcq: 1, qa: 1.5, code: 2, debugging: 2 };
    let totalScore = 0;
    let totalWeight = 0;
    
    answers.forEach(answer => {
      if (!answer || !answer.type) return;
      
      let score = 0;
      const weight = weights[answer.type as keyof typeof weights] || 1;
      
      switch (answer.type) {
        case 'mcq':
          score = answer.correct === true ? 1 : 0;
          break;
        case 'code':
        case 'debugging':
          if (answer.tests && answer.tests.total > 0) {
            score = answer.tests.passed / answer.tests.total;
          } else {
            // If no tests, give partial credit if code exists
            score = answer.code && answer.code.trim().length > 10 ? 0.3 : 0;
          }
          break;
        case 'qa':
          if (answer.rubric) {
            const rubricValues = [
              answer.rubric.clarity || 0,
              answer.rubric.depth || 0,
              answer.rubric.relevance || 0,
              answer.rubric.structure || 0,
              answer.rubric.communication || 0,
              answer.rubric.accuracy || 0
            ];
            const avg = rubricValues.reduce((sum, val) => sum + val, 0) / rubricValues.length;
            score = avg / 10; // Convert from 0-10 to 0-1
          } else if (answer.answerText && answer.answerText.trim().length > 10) {
            // Give partial credit for text answers without rubric
            score = 0.5;
          }
          break;
      }
      
      totalScore += score * weight;
      totalWeight += weight;
    });
    
    if (totalWeight === 0) return 0;
    
    const finalScore = (totalScore / totalWeight) * 100;
    return Math.round(finalScore * 10) / 10; // One decimal place
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-12">
        <i className="ri-file-search-line text-6xl text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Interview not found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The interview you're looking for doesn't exist or you don't have access to it.
        </p>
        <button
          onClick={() => navigate('/interviews')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-160 whitespace-nowrap"
        >
          Back to My Interviews
        </button>
      </div>
    );
  }

  const accurateScore = calculateAccurateScore(interview.transcript || []);
  const gradeBand = getGradeBand(accurateScore);
  const strengths = getStrengths();
  const weaknesses = getWeaknesses();
  const suggestions = getSuggestions();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Interview Results
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Completed on {new Date(interview.ended_at).toLocaleDateString()}
        </p>
      </div>

      {/* Score Overview with Confetti Effect */}
      <div className="bg-gradient-to-br from-blue-50 to-gold-50 dark:from-blue-900/20 dark:to-gold-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800 relative overflow-hidden">
        {/* Confetti Animation */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gold-400 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white dark:bg-gray-800 shadow-lg mb-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {accurateScore.toFixed(1)}%
              </div>
              <div className={`text-sm font-semibold ${gradeBand.color}`}>{gradeBand.grade}</div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Excellent work on your interview!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You completed {interview.transcript?.length || 0} questions in {formatDuration(interview.started_at, interview.ended_at)}
          </p>
          <div className="mt-4 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full inline-block">
            Score calculated with weighted accuracy: MCQ (1x), Q&A (1x), Code (2x), Debug (2x)
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative z-10">
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <i className="ri-briefcase-line text-2xl text-blue-600 mb-2" />
              <div className="font-semibold text-gray-900 dark:text-white">Role</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{interview.role}</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <i className="ri-bar-chart-line text-2xl text-gold-500 mb-2" />
              <div className="font-semibold text-gray-900 dark:text-white">Difficulty</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{interview.difficulty}</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <i className="ri-mic-line text-2xl text-blue-600 mb-2" />
              <div className="font-semibold text-gray-900 dark:text-white">Mode</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{interview.mode}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
              { id: 'questions', label: 'Question Review', icon: 'ri-question-answer-line' },
              { id: 'feedback', label: 'Detailed Feedback', icon: 'ri-feedback-line' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors duration-160 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <i className={tab.icon} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Radar Chart Placeholder */}
              {rubricScores && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Breakdown</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(rubricScores).map(([area, score]) => (
                      <div key={area} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {area}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {Math.round(score)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              score >= 80 ? 'bg-green-500' :
                              score >= 60 ? 'bg-blue-500' :
                              score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, score)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">
                    <i className="ri-thumb-up-line mr-2" />
                    Strengths
                  </h3>
                  {strengths.length > 0 ? (
                    <ul className="space-y-2">
                      {strengths.map((strength, index) => (
                        <li key={index} className="flex items-center justify-between text-green-700 dark:text-green-400">
                          <span>{strength.area}</span>
                          <span className="font-semibold">{strength.score}%</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-green-600 dark:text-green-400 text-sm">
                      Keep practicing to identify your strengths!
                    </p>
                  )}
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-4">
                    <i className="ri-thumb-down-line mr-2" />
                    Areas for Improvement
                  </h3>
                  {weaknesses.length > 0 ? (
                    <ul className="space-y-2">
                      {weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-center justify-between text-red-700 dark:text-red-400">
                          <span>{weakness.area}</span>
                          <span className="font-semibold">{weakness.score}%</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      Great job! No major areas for improvement identified.
                    </p>
                  )}
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">
                  <i className="ri-lightbulb-line mr-2" />
                  Personalized Action-Oriented Suggestions
                </h3>
                <ul className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start space-x-3 text-blue-700 dark:text-blue-400">
                      <i className="ri-arrow-right-circle-line mt-0.5 text-blue-500" />
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-6">
              {interview.transcript?.map((answer, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Question {index + 1}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                        answer.type === 'mcq' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                        answer.type === 'qa' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        answer.type === 'code' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
                        'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                      }`}>
                        {answer.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {answer.timeSpentS}s
                      </span>
                      {answer.tags && answer.tags.map((tag: string) => (
                        <span key={tag} className="bg-gold-100 dark:bg-gold-900/30 text-gold-800 dark:text-gold-300 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Question:</h5>
                      <p className="text-gray-600 dark:text-gray-400">{answer.prompt}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Your Answer:</h5>
                      {answer.type === 'mcq' ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            Choice {(answer.mcqChoice || 0) + 1}
                          </span>
                          {answer.correct ? (
                            <i className="ri-check-circle-line text-green-500" />
                          ) : (
                            <i className="ri-close-circle-line text-red-500" />
                          )}
                        </div>
                      ) : answer.code ? (
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{answer.code}</code>
                        </pre>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400">
                          {answer.answerText || 'No answer provided'}
                        </p>
                      )}
                    </div>
                    
                    {answer.tests && (
                      <div>
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Test Results:</h5>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <div className="text-sm text-gray-300 mb-2">
                            Passed: {answer.tests.passed} / {answer.tests.total} tests
                          </div>
                          {answer.tests.logs && answer.tests.logs.map((log: string, i: number) => (
                            <div key={i} className="text-xs text-gray-400">{log}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {answer.rubric && (
                      <div>
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Rubric Scores:</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(answer.rubric).map(([key, value]) => (
                            <div key={key} className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
                              <div className="text-xs text-blue-600 dark:text-blue-400 capitalize">{key}</div>
                              <div className="font-semibold text-blue-800 dark:text-blue-300">{value}/10</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {answer.transcriptText && (
                      <div>
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Voice Transcript:</h5>
                        <p className="text-gray-600 dark:text-gray-400 italic">{answer.transcriptText}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">
                  Detailed Performance Analysis
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <strong className="text-blue-700 dark:text-blue-400">Overall Performance:</strong>
                    <p className="text-blue-600 dark:text-blue-300 mt-1">
                      You scored {accurateScore.toFixed(1)}% overall using weighted accuracy calculation, which places you in the {gradeBand.grade} grade band. 
                      This indicates {accurateScore >= 80 ? 'excellent' : accurateScore >= 60 ? 'good' : 'developing'} interview skills.
                    </p>
                  </div>
                  
                  <div>
                    <strong className="text-blue-700 dark:text-blue-400">Scoring Methodology:</strong>
                    <p className="text-blue-600 dark:text-blue-300 mt-1">
                      MCQ questions (1x weight): Direct accuracy scoring<br />
                      Q&A questions (1x weight): 6-dimension rubric averaging<br />
                      Code challenges (2x weight): Test case pass rate<br />
                      Debugging tasks (2x weight): Test fixes + explanation quality
                    </p>
                  </div>
                  
                  <div>
                    <strong className="text-blue-700 dark:text-blue-400">Time Management:</strong>
                    <p className="text-blue-600 dark:text-blue-300 mt-1">
                      You completed the interview in {formatDuration(interview.started_at, interview.ended_at)}, 
                      showing {interview.transcript && interview.transcript.length > 8 ? 'good' : 'room for improvement in'} time management skills.
                    </p>
                  </div>
                  
                  <div>
                    <strong className="text-blue-700 dark:text-blue-400">Question Coverage:</strong>
                    <p className="text-blue-600 dark:text-blue-300 mt-1">
                      You answered {interview.transcript?.length || 0} questions across multiple categories, 
                      demonstrating {interview.transcript && interview.transcript.length >= 10 ? 'comprehensive' : 'basic'} coverage of the topic areas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gold-50 dark:bg-gold-900/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gold-800 dark:text-gold-300 mb-4">
                  Next Steps
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <i className="ri-number-1 text-gold-600 mt-0.5" />
                    <div>
                      <strong className="text-gold-700 dark:text-gold-400">Practice Regularly:</strong>
                      <p className="text-gold-600 dark:text-gold-300 text-sm mt-1">
                        Schedule regular mock interviews to build confidence and improve your skills.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="ri-number-2 text-gold-600 mt-0.5" />
                    <div>
                      <strong className="text-gold-700 dark:text-gold-400">Focus on Weak Areas:</strong>
                      <p className="text-gold-600 dark:text-gold-300 text-sm mt-1">
                        Spend extra time on the areas identified for improvement above.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="ri-number-3 text-gold-600 mt-0.5" />
                    <div>
                      <strong className="text-gold-700 dark:text-gold-400">Seek Feedback:</strong>
                      <p className="text-gold-600 dark:text-gold-300 text-sm mt-1">
                        Practice with peers or mentors to get additional perspectives on your performance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handleRetake}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-160 whitespace-nowrap"
        >
          <i className="ri-refresh-line mr-2" />
          Retake Interview
        </button>
        
        <button
          onClick={() => window.print()}
          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-160 whitespace-nowrap"
        >
          <i className="ri-download-line mr-2" />
          Export Report
        </button>
        
        <button
          onClick={() => navigate('/interviews')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-160 whitespace-nowrap"
        >
          <i className="ri-arrow-left-line mr-1" />
          Back to My Interviews
        </button>
      </div>
    </div>
  );
};

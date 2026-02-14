import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { generateQuestions } from '../utils/questionGenerator';
import { calculateScore } from '../utils/scoreCalculator';
import { generateQuestionsA4F, type A4FQuestion } from '../../../lib/a4fService';

interface AssessmentRunnerProps {
  config: {
    domains: string[];
    level: string;
    timed: boolean;
    duration: number;
    inputMode: string;
  };
  onComplete: () => void;
}

export const AssessmentRunner = ({ config, onComplete }: AssessmentRunnerProps) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(config.timed ? config.duration * 60 : null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [notes, setNotes] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime] = useState(new Date());
  const [questionStartTime, setQuestionStartTime] = useState(new Date());
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const [questionsSource, setQuestionsSource] = useState<'a4f' | 'static' | null>(null);

  useEffect(() => {
    initializeAssessment();
    if (config.inputMode === 'Voice' || config.inputMode === 'Both') {
      initializeSpeechRecognition();
    }
  }, []);

  useEffect(() => {
    if (config.timed && timeLeft !== null && timeLeft > 0 && !isPaused) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, isPaused]);

  const initializeAssessment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's last asked questions to prevent repeats
      const { data: recentSessions } = await supabase
        .from('additional_skills_sessions')
        .select('details')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      const usedIds: string[] = [];
      recentSessions?.forEach(session => {
        session.details?.forEach((detail: any) => {
          if (detail.qid) usedIds.push(detail.qid);
        });
      });

      // Map Additional Skills config to A4F format
      const levelMap: Record<string, 'easy' | 'medium' | 'hard'> = {
        'Easy': 'easy',
        'Medium': 'medium',
        'Hard': 'hard',
      };

      const inputModeMap: Record<string, 'text' | 'voice' | 'text-voice'> = {
        'Text': 'text',
        'Voice': 'voice',
        'Both': 'text-voice',
      };

      // Try to generate questions using A4F API FIRST (priority)
      console.log('🚀 Attempting to generate Additional Skills questions with A4F API...', {
        domains: config.domains,
        level: config.level,
        duration: config.duration,
        inputMode: config.inputMode,
      });

      try {
        // First, verify backend is reachable
        const healthCheck = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/health`).catch(() => null);
        if (!healthCheck || !healthCheck.ok) {
          console.warn('⚠️ Backend server not reachable, will use fallback questions');
          throw new Error('Backend server not available');
        }

        const a4fResponse = await generateQuestionsA4F({
          roles: config.domains.map(d => d.charAt(0).toUpperCase() + d.slice(1).replace('-', ' ')),
          level: levelMap[config.level] || 'medium',
          interviewType: 'mix', // Additional skills are typically mixed
          questionTypes: ['mcq', 'qa'], // Map to available types
          durationMin: config.duration || 30,
          inputMode: inputModeMap[config.inputMode] || 'text',
          resumeText: '',
          usedIds: usedIds,
          userId: user.id,
        });

        if (a4fResponse && a4fResponse.questions && a4fResponse.questions.length > 0) {
          console.log('✅ A4F API successfully generated', a4fResponse.questions.length, 'questions for Additional Skills');
          
          // Convert A4F questions to Additional Skills format
          const convertedQuestions = a4fResponse.questions.map((q: A4FQuestion, index: number) => {
            // Distribute questions across selected domains
            const domainIndex = index % config.domains.length;
            const domain = config.domains[domainIndex];

            // Map A4F question types to Additional Skills types
            let questionType = 'scenario'; // default
            if (q.type === 'mcq') {
              questionType = 'mcq';
            } else if (q.type === 'code' || q.type === 'debugging') {
              questionType = 'case_mini';
            } else if (q.type === 'qa') {
              questionType = 'scenario'; // QA questions become scenario questions
            }

            return {
              id: q.id || `q-${Date.now()}-${index}`,
              domain: domain,
              level: config.level,
              type: questionType,
              tags: q.tags || [domain],
              prompt: q.prompt,
              context: q.hint ? `Hint: ${q.hint}` : undefined,
              options: q.options || [],
              correctAnswer: typeof q.correctAnswer === 'number' 
                ? (q.options?.[q.correctAnswer] || String(q.correctAnswer))
                : (q.correctAnswer || undefined),
              hint: q.hint,
              rationale: `AI-generated question for ${domain}`,
              estimatedTime: q.estimatedTime || 120,
            };
          });

          setQuestions(convertedQuestions);
          setQuestionsSource('a4f');
          console.log('✅ Successfully set', convertedQuestions.length, 'A4F-generated questions for Additional Skills');
          return; // Exit early - don't fall back to static questions
        } else {
          console.warn('⚠️ A4F API returned empty or invalid response:', a4fResponse);
          throw new Error('A4F API returned empty questions array');
        }
      } catch (a4fError: any) {
        console.error('❌ A4F API failed with error:', a4fError);
        console.error('❌ Error details:', {
          message: a4fError?.message,
          stack: a4fError?.stack,
        });
        console.warn('⚠️ Falling back to local question generation due to A4F error');
      }

      // Fallback to local generation ONLY if A4F fails
      console.warn('⚠️ Using FALLBACK local question generation (A4F API unavailable)');
      console.warn('⚠️ This means questions will be static. Check backend server and A4F_API_KEY configuration.');
      
      const generatedQuestions = generateQuestions(config, usedIds, user.id);
      setQuestions(generatedQuestions);
      setQuestionsSource('static');
      console.log('📝 Generated', generatedQuestions.length, 'fallback questions');
    } catch (error) {
      console.error('Error initializing assessment:', error);
      // Final fallback
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const generatedQuestions = generateQuestions(config, [], user.id);
        setQuestions(generatedQuestions);
        setQuestionsSource('static');
      }
    }
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript + ' ');
        }
      };

      recognitionRef.current = recognition;
    }
  };

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (value: any) => {
    const questionTime = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        value,
        timeSpent: questionTime,
        transcript: transcript
      }
    }));
    
    // Add XP for answering
    setXp(prev => prev + 2);
    
    // Check for streak
    if (currentIndex > 0 && answers[currentIndex - 1]) {
      setStreak(prev => prev + 1);
      if (streak > 0 && streak % 5 === 0) {
        setXp(prev => prev + 5); // Bonus XP for streak
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setQuestionStartTime(new Date());
      setTranscript('');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setQuestionStartTime(new Date());
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const endTime = new Date();
      const sessionDetails = questions.map((q, index) => {
        const answer = answers[index];
        return {
          qid: q.id,
          domain: q.domain,
          level: q.level,
          type: q.type,
          prompt: q.prompt,
          answer_text: answer?.value || '',
          transcript_text: answer?.transcript || '',
          mcq_choice: q.type === 'mcq' ? answer?.value : null,
          correct: q.type === 'mcq' ? answer?.value === q.correctAnswer : null,
          numeric_value: q.type === 'case_mini' ? answer?.value : null,
          rationale: q.rationale || '',
          rubric: answer?.rubric || {},
          time_s: answer?.timeSpent || 0
        };
      });

      const overallScore = calculateScore(questions, answers);

      const { data: session, error } = await supabase
        .from('additional_skills_sessions')
        .insert({
          user_id: user.id,
          domains: config.domains,
          level: config.level,
          timed: config.timed,
          duration_s: config.timed ? config.duration * 60 : Math.floor((endTime.getTime() - startTime.getTime()) / 1000),
          input_mode: config.inputMode,
          started_at: startTime.toISOString(),
          ended_at: endTime.toISOString(),
          overall_score: overallScore,
          details: sessionDetails,
          flags: { xp, streak }
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/additional-skills?session=${session.id}`);
    } catch (error) {
      console.error('Error submitting assessment:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {config.timed && timeLeft !== null && (
              <div className={`flex items-center space-x-2 ${timeLeft < 60 ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
                <i className="ri-timer-line" />
                <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <i className="ri-file-list-line" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {currentIndex + 1} / {questions.length}
                {questionsSource === 'a4f' && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                    <i className="ri-checkbox-circle-line"></i>
                    AI Generated
                  </span>
                )}
                {questionsSource === 'static' && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center gap-1">
                    <i className="ri-information-line"></i>
                    Static Questions
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <i className={`ri-${isPaused ? 'play' : 'pause'}-line`} />
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-yellow-500">
              <i className="ri-star-fill" />
              <span className="font-semibold">{xp} XP</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-500">
              <i className="ri-fire-line" />
              <span className="font-semibold">{streak}</span>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
                  onComplete();
                }
              }}
              className="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 whitespace-nowrap"
            >
              Quit
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Question Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${
                  currentQuestion.domain === 'finance' ? 'from-green-400 to-emerald-600' :
                  currentQuestion.domain === 'soft-skills' ? 'from-pink-400 to-rose-600' :
                  currentQuestion.domain === 'marketing' ? 'from-purple-400 to-violet-600' :
                  currentQuestion.domain === 'sales' ? 'from-blue-400 to-cyan-600' :
                  currentQuestion.domain === 'hr' ? 'from-orange-400 to-amber-600' :
                  currentQuestion.domain === 'operations' ? 'from-gray-400 to-slate-600' :
                  currentQuestion.domain === 'consulting' ? 'from-yellow-400 to-orange-600' :
                  'from-indigo-400 to-purple-600'
                } text-white`}>
                  {currentQuestion.domain.replace('-', ' ').toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  currentQuestion.level === 'Easy' ? 'bg-green-100 text-green-700' :
                  currentQuestion.level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {currentQuestion.level}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentQuestion.type.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Question Content */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentQuestion.prompt}
              </h3>
              
              {currentQuestion.context && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                  <p className="text-blue-800 dark:text-blue-200">{currentQuestion.context}</p>
                </div>
              )}
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              {currentQuestion.type === 'mcq' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="mcq-answer"
                        value={option}
                        checked={answers[currentIndex]?.value === option}
                        onChange={(e) => handleAnswer(e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {(currentQuestion.type === 'scenario' || currentQuestion.type === 'roleplay') && (
                <div className="space-y-4">
                  {(config.inputMode === 'Voice' || config.inputMode === 'Both') && (
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={toggleRecording}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                          isRecording 
                            ? 'bg-red-500 text-white' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        <i className={`ri-${isRecording ? 'stop' : 'mic'}-line`} />
                        <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                      </button>
                      {transcript && (
                        <span className="text-sm text-gray-500">Recording active...</span>
                      )}
                    </div>
                  )}
                  
                  {(config.inputMode === 'Text' || config.inputMode === 'Both') && (
                    <textarea
                      value={answers[currentIndex]?.value || ''}
                      onChange={(e) => handleAnswer(e.target.value)}
                      placeholder={currentQuestion.type === 'roleplay' ? 'Describe how you would handle this situation...' : 'Use the STAR method: Situation, Task, Action, Result...'}
                      className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={500}
                    />
                  )}
                  
                  {transcript && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Live Transcript:</h4>
                      <p className="text-gray-700 dark:text-gray-300">{transcript}</p>
                    </div>
                  )}
                </div>
              )}

              {currentQuestion.type === 'case_mini' && (
                <div className="space-y-4">
                  <input
                    type="number"
                    value={answers[currentIndex]?.value || ''}
                    onChange={(e) => handleAnswer(parseFloat(e.target.value) || 0)}
                    placeholder="Enter your calculated answer"
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Formula Helper:</h4>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">{currentQuestion.hint}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <i className="ri-arrow-left-line" />
                <span>Previous</span>
              </button>

              <div className="flex space-x-3">
                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    className="flex items-center space-x-2 px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 whitespace-nowrap"
                  >
                    <i className="ri-check-line" />
                    <span>Submit Assessment</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 whitespace-nowrap"
                  >
                    <span>Next</span>
                    <i className="ri-arrow-right-line" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Rail */}
        <div className="space-y-6">
          {/* Hints */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white">Live Hints</h4>
              <i className={`ri-${showHints ? 'eye-off' : 'eye'}-line text-gray-500`} />
            </button>
            {showHints && currentQuestion.hint && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm">{currentQuestion.hint}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Notes</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down your thoughts..."
              className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Gamified HUD */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
            <h4 className="font-bold mb-4">Power-Up Stats</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <i className="ri-star-fill" />
                  <span>XP</span>
                </span>
                <span className="font-bold">{xp}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <i className="ri-fire-line" />
                  <span>Streak</span>
                </span>
                <span className="font-bold">{streak}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <i className="ri-trophy-line" />
                  <span>Progress</span>
                </span>
                <span className="font-bold">{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
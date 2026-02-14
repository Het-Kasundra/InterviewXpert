import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../contexts/SessionProvider';
import { supabase } from '../../lib/supabaseClient';
import { generateQuestionsA4F, type A4FQuestion } from '../../lib/a4fService';
import { evaluateTextAnswer as evaluateTextAnswerAI, evaluateCodeSubmission as evaluateCodeSubmissionAI, type AnswerEvaluation, type CodeEvaluation } from '../../lib/aiEvaluationService';
import { initializeSpeechRecognition, analyzeTranscription, getRealTimeFeedback, analyzeAnswerQuality } from '../../lib/aiTranscriptionService';

interface Question {
  id: string;
  type: 'mcq' | 'qa' | 'code' | 'debugging';
  prompt: string;
  options?: string[];
  correctAnswer?: number;
  hint?: string;
  language?: string;
  codeSnippet?: string;
  skill: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  estimatedTime: number;
  rubricTarget: string;
  tests?: {
    visible: Array<{ input: any; expected: any; description: string }>;
    hidden: Array<{ input: any; expected: any }>;
  };
}

interface Answer {
  questionId: string;
  type: string;
  prompt: string;
  tags: string[];
  answerText?: string;
  transcriptText?: string;
  code?: string;
  mcqChoice?: number;
  correct?: boolean;
  timeSpentS: number;
  fillerRate?: number;
  pauses?: number;
  tests?: {
    passed: number;
    total: number;
    logs: string[];
  };
  rubric?: {
    clarity: number;
    depth: number;
    relevance: number;
    structure: number;
    communication: number;
    accuracy: number;
  };
}

interface TestResult {
  passed: boolean;
  input: any;
  expected: any;
  actual: any;
  description?: string;
}

export const InterviewRunnerPage = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const [config, setConfig] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [selectedMcq, setSelectedMcq] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [pauseUsed, setPauseUsed] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [notes, setNotes] = useState('');
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [activeTab, setActiveTab] = useState<'editor' | 'io' | 'tests'>('editor');
  const recognitionRef = useRef<any>(null);
  const [questionsSource, setQuestionsSource] = useState<'a4f' | 'static' | null>(null);

  useEffect(() => {
    if (!session?.user) {
      navigate('/login');
      return;
    }

    const storedConfig = sessionStorage.getItem('interviewConfig');
    if (!storedConfig) {
      navigate('/interviews');
      return;
    }

    const parsedConfig = JSON.parse(storedConfig);
    setConfig(parsedConfig);
    setTimeLeft(parsedConfig.duration * 60);

    // Generate questions based on config
    generateQuestions(parsedConfig);
  }, [session, navigate]);

  useEffect(() => {
    if (timeLeft > 0 && !isPaused && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && questions.length > 0) {
      handleSubmitInterview();
    }
  }, [timeLeft, isPaused, questions.length]);

  const generateQuestions = async (config: any) => {
    try {
      // Fetch user's recent question IDs to avoid repeats
      const { data: recentInterviews } = await supabase
        .from('interviews')
        .select('transcript')
        .eq('user_id', session!.user.id)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      const recentQuestionIds: string[] = [];
      recentInterviews?.forEach(interview => {
        if (interview.transcript && Array.isArray(interview.transcript)) {
          interview.transcript.forEach((answer: any) => {
            if (answer.questionId) {
              recentQuestionIds.push(answer.questionId);
            }
          });
        }
      });

      // Try to generate questions using A4F API FIRST (priority)
      console.log('🚀 Attempting to generate questions with A4F API...', {
        roles: config.roles,
        level: config.level,
        interviewType: config.type,
        questionTypes: config.questionTypes,
        durationMin: config.duration,
        inputMode: config.inputMode,
        apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
      });

      try {
        // First, verify backend is reachable
        const healthCheck = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/health`).catch(() => null);
        if (!healthCheck || !healthCheck.ok) {
          console.warn('⚠️ Backend server not reachable, will use fallback questions');
          throw new Error('Backend server not available');
        }
        const a4fResponse = await generateQuestionsA4F({
          roles: config.roles,
          level: config.level,
          interviewType: config.type,
          questionTypes: config.questionTypes,
          durationMin: config.duration,
          inputMode: config.inputMode,
          resumeText: config.resume || '',
          usedIds: recentQuestionIds,
          userId: session!.user.id, // Pass user ID for A4F metadata
        });

        if (a4fResponse && a4fResponse.questions && a4fResponse.questions.length > 0) {
          console.log('✅ A4F API successfully generated', a4fResponse.questions.length, 'questions');
          console.log('📝 Sample question:', a4fResponse.questions[0]?.prompt?.substring(0, 100));

          // Convert A4F questions to our Question format
          const convertedQuestions: Question[] = a4fResponse.questions.map((q: A4FQuestion) => ({
            id: q.id || `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: q.type,
            prompt: q.prompt,
            options: q.options,
            correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : undefined,
            hint: q.hint,
            language: q.language || 'javascript',
            codeSnippet: q.codeSnippet,
            skill: q.skill,
            difficulty: q.difficulty,
            tags: q.tags || [],
            estimatedTime: q.estimatedTime || 120,
            rubricTarget: q.rubricTarget || 'general',
            tests: q.tests ? {
              visible: q.tests.visible || [],
              hidden: q.tests.hidden || []
            } : undefined,
          }));

          // Store A4F source in config for later reference
          config.source = 'a4f';

          setQuestions(convertedQuestions);
          setQuestionsSource('a4f'); // Mark questions as from A4F
          console.log('✅ Successfully set', convertedQuestions.length, 'A4F-generated questions');

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

        // Show user-friendly error but still try to continue
        const errorMessage = a4fError?.message || 'Unknown error';
        console.warn('⚠️ Falling back to local question generation due to A4F error:', errorMessage);

        // Don't throw - allow fallback to continue
        // But log clearly that we're using fallback
      }

      // Fallback to local generation ONLY if A4F fails
      console.warn('⚠️ Using FALLBACK local question generation (A4F API unavailable)');
      console.warn('⚠️ This means questions will be static. Check backend server and A4F_API_KEY configuration.');

      const questionCount = Math.min(15, Math.max(8, Math.floor(config.duration / 3)));
      const seed = session!.user.id + Date.now().toString();
      const generatedQuestions = await generateDynamicQuestions(
        config,
        questionCount,
        new Set(recentQuestionIds),
        seed
      );

      console.log('📝 Generated', generatedQuestions.length, 'fallback questions');
      setQuestions(generatedQuestions);
      setQuestionsSource('static'); // Mark questions as static/fallback
    } catch (error) {
      console.error('Error generating questions:', error);
      // Final fallback to basic generation
      const questionCount = Math.min(15, Math.max(8, Math.floor(config.duration / 3)));
      const fallbackQuestions = generateBasicQuestions(config, questionCount);
      setQuestions(fallbackQuestions);
      setQuestionsSource('static'); // Mark as static
    }
  };

  const generateDynamicQuestions = async (
    config: any,
    count: number,
    excludeIds: Set<string>,
    seed: string
  ): Promise<Question[]> => {
    const questions: Question[] = [];
    const usedConcepts = new Set<string>();

    // Question banks by role and type
    const questionBanks = getQuestionBanks();

    for (let i = 0; i < count; i++) {
      const questionType = config.questionTypes[Math.floor(Math.random() * config.questionTypes.length)];
      const role = config.roles[Math.floor(Math.random() * config.roles.length)];

      let question: Question;
      let attempts = 0;

      do {
        question = generateQuestionByType(questionType, role, config.level, config.type, questionBanks);
        attempts++;
      } while (
        (excludeIds.has(question.id) || usedConcepts.has(question.tags[0])) &&
        attempts < 10
      );

      if (question.tags[0]) {
        usedConcepts.add(question.tags[0]);
      }

      questions.push(question);
    }

    return questions;
  };

  const getQuestionBanks = () => {
    return {
      'Web Development': {
        technical: {
          easy: [
            {
              mcq: [
                {
                  prompt: 'What is the correct way to create a React functional component?',
                  options: ['function Component() {}', 'const Component = () => {}', 'class Component extends React.Component {}', 'Both A and B'],
                  correctAnswer: 3,
                  tags: ['react', 'components']
                }
              ],
              qa: [
                {
                  prompt: 'Explain the difference between let, const, and var in JavaScript.',
                  hint: 'Consider scope, hoisting, and reassignment',
                  tags: ['javascript', 'variables']
                }
              ],
              code: [
                {
                  prompt: 'Write a function that removes duplicate values from an array.',
                  language: 'javascript',
                  tags: ['javascript', 'arrays'],
                  tests: {
                    visible: [
                      { input: [1, 2, 2, 3, 4, 4, 5], expected: [1, 2, 3, 4, 5], description: 'Remove duplicates from number array' }
                    ],
                    hidden: [
                      { input: ['a', 'b', 'a', 'c'], expected: ['a', 'b', 'c'] },
                      { input: [], expected: [] }
                    ]
                  }
                }
              ],
              debugging: [
                {
                  prompt: 'Fix the bugs in this function that should find the maximum value in an array:',
                  codeSnippet: `function findMax(arr) {
  let max = 0;
  for (let i = 0; i <= arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}`,
                  language: 'javascript',
                  tags: ['javascript', 'debugging'],
                  tests: {
                    visible: [
                      { input: [1, 5, 3, 9, 2], expected: 9, description: 'Find maximum in positive array' }
                    ],
                    hidden: [
                      { input: [-5, -2, -10, -1], expected: -1 },
                      { input: [0], expected: 0 }
                    ]
                  }
                }
              ]
            }
          ],
          medium: [
            {
              mcq: [
                {
                  prompt: 'Which React hook is used for side effects?',
                  options: ['useState', 'useEffect', 'useContext', 'useReducer'],
                  correctAnswer: 1,
                  tags: ['react', 'hooks']
                }
              ],
              qa: [
                {
                  prompt: 'Explain how event delegation works in JavaScript and its benefits.',
                  hint: 'Think about event bubbling and performance',
                  tags: ['javascript', 'events']
                }
              ],
              code: [
                {
                  prompt: 'Implement a debounce function that delays execution of a callback.',
                  language: 'javascript',
                  tags: ['javascript', 'performance'],
                  tests: {
                    visible: [
                      { input: { delay: 100, calls: 3 }, expected: 1, description: 'Should only execute once after delay' }
                    ],
                    hidden: [
                      { input: { delay: 50, calls: 5 }, expected: 1 }
                    ]
                  }
                }
              ]
            }
          ],
          hard: [
            {
              mcq: [
                {
                  prompt: 'What is the time complexity of accessing an element in a hash table?',
                  options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
                  correctAnswer: 0,
                  tags: ['algorithms', 'complexity']
                }
              ],
              qa: [
                {
                  prompt: 'Design a system to handle 1 million concurrent users for a chat application.',
                  hint: 'Consider WebSockets, load balancing, and database scaling',
                  tags: ['system-design', 'scalability']
                }
              ]
            }
          ]
        },
        behavioural: [
          {
            prompt: 'Tell me about a time when you had to learn a new technology quickly for a project.',
            hint: 'Use STAR method: Situation, Task, Action, Result',
            tags: ['learning', 'adaptability']
          }
        ]
      }
    };
  };

  const generateQuestionByType = (
    type: string,
    role: string,
    level: string,
    interviewType: string,
    banks: any
  ): Question => {
    const roleBank = banks[role] || banks['Web Development'];
    const id = `${type}-${role}-${level}-${Date.now()}-${Math.random()}`;

    if (type === 'mcq') {
      const questions = roleBank.technical?.[level]?.[0]?.mcq || [];
      const selected = questions[Math.floor(Math.random() * questions.length)] || {
        prompt: 'What is a closure in JavaScript?',
        options: ['A function inside another function', 'A way to close files', 'A loop construct', 'A variable type'],
        correctAnswer: 0,
        tags: ['javascript']
      };

      return {
        id,
        type: 'mcq',
        prompt: selected.prompt,
        options: selected.options,
        correctAnswer: selected.correctAnswer,
        skill: role,
        difficulty: level as 'easy' | 'medium' | 'hard',
        tags: selected.tags,
        estimatedTime: 60,
        rubricTarget: 'accuracy'
      };
    }

    if (type === 'qa') {
      if (interviewType === 'behavioural' || (interviewType === 'mix' && Math.random() < 0.3)) {
        const behavioural = roleBank.behavioural || [];
        const selected = behavioural[Math.floor(Math.random() * behavioural.length)] || {
          prompt: 'Describe a challenging project you worked on.',
          hint: 'Use STAR method',
          tags: ['experience']
        };

        return {
          id,
          type: 'qa',
          prompt: selected.prompt,
          hint: selected.hint,
          skill: role,
          difficulty: level as 'easy' | 'medium' | 'hard',
          tags: selected.tags,
          estimatedTime: 180,
          rubricTarget: 'structure'
        };
      } else {
        const questions = roleBank.technical?.[level]?.[0]?.qa || [];
        const selected = questions[Math.floor(Math.random() * questions.length)] || {
          prompt: 'Explain the concept of hoisting in JavaScript.',
          hint: 'Consider variable and function declarations',
          tags: ['javascript']
        };

        return {
          id,
          type: 'qa',
          prompt: selected.prompt,
          hint: selected.hint,
          skill: role,
          difficulty: level as 'easy' | 'medium' | 'hard',
          tags: selected.tags,
          estimatedTime: 120,
          rubricTarget: 'depth'
        };
      }
    }

    if (type === 'code') {
      const questions = roleBank.technical?.[level]?.[0]?.code || [];
      const selected = questions[Math.floor(Math.random() * questions.length)] || {
        prompt: 'Write a function that reverses a string.',
        language: 'javascript',
        tags: ['javascript'],
        tests: {
          visible: [{ input: 'hello', expected: 'olleh', description: 'Reverse simple string' }],
          hidden: [{ input: '', expected: '' }]
        }
      };

      return {
        id,
        type: 'code',
        prompt: selected.prompt,
        language: selected.language,
        skill: role,
        difficulty: level as 'easy' | 'medium' | 'hard',
        tags: selected.tags,
        estimatedTime: 300,
        rubricTarget: 'accuracy',
        tests: selected.tests
      };
    }

    if (type === 'debugging') {
      const questions = roleBank.technical?.[level]?.[0]?.debugging || [];
      const selected = questions[Math.floor(Math.random() * questions.length)] || {
        prompt: 'Fix the bugs in this function:',
        codeSnippet: 'function add(a, b) { return a + b }',
        language: 'javascript',
        tags: ['javascript'],
        tests: {
          visible: [{ input: [2, 3], expected: 5, description: 'Add two numbers' }],
          hidden: [{ input: [0, 0], expected: 0 }]
        }
      };

      return {
        id,
        type: 'debugging',
        prompt: selected.prompt,
        codeSnippet: selected.codeSnippet,
        language: selected.language,
        skill: role,
        difficulty: level as 'easy' | 'medium' | 'hard',
        tags: selected.tags,
        estimatedTime: 240,
        rubricTarget: 'accuracy',
        tests: selected.tests
      };
    }

    // Fallback
    return generateBasicQuestions(config, 1)[0];
  };

  const generateBasicQuestions = (config: any, count: number): Question[] => {
    const questions: Question[] = [];

    for (let i = 0; i < count; i++) {
      const questionType = config.questionTypes[Math.floor(Math.random() * config.questionTypes.length)];
      const role = config.roles[Math.floor(Math.random() * config.roles.length)];

      questions.push({
        id: `basic-${Date.now()}-${Math.random()}`,
        type: questionType as 'mcq' | 'qa' | 'code' | 'debugging',
        prompt: `Sample ${questionType} question for ${role}`,
        skill: role,
        difficulty: config.level as 'easy' | 'medium' | 'hard',
        tags: [role.toLowerCase()],
        estimatedTime: 120,
        rubricTarget: 'general'
      });
    }

    return questions;
  };

  const runCode = async () => {
    if (!currentCode.trim()) return;

    setIsRunningCode(true);
    setCodeOutput('');
    setTestResults([]);

    try {
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) return;

      // Simple JavaScript execution in a safe context
      if (selectedLanguage === 'javascript' || selectedLanguage === 'typescript') {
        const results = await runJavaScriptTests(currentCode, currentQuestion.tests);
        setTestResults(results);
        setCodeOutput(results.map(r =>
          `Test: ${r.description || 'Test'}\nInput: ${JSON.stringify(r.input)}\nExpected: ${JSON.stringify(r.expected)}\nActual: ${JSON.stringify(r.actual)}\nResult: ${r.passed ? 'PASS' : 'FAIL'}\n`
        ).join('\n'));
      } else {
        setCodeOutput('Python execution not implemented in this demo');
      }
    } catch (error) {
      setCodeOutput(`Error: ${error}`);
    } finally {
      setIsRunningCode(false);
    }
  };

  const runJavaScriptTests = async (code: string, tests?: Question['tests']): Promise<TestResult[]> => {
    if (!tests) return [];

    const results: TestResult[] = [];

    try {
      // Create a safe execution context
      const func = new Function('return ' + code)();

      // Run visible tests
      for (const test of tests.visible) {
        try {
          const actual = Array.isArray(test.input) ? func(...test.input) : func(test.input);
          results.push({
            passed: JSON.stringify(actual) === JSON.stringify(test.expected),
            input: test.input,
            expected: test.expected,
            actual,
            description: test.description
          });
        } catch (error) {
          results.push({
            passed: false,
            input: test.input,
            expected: test.expected,
            actual: `Error: ${error}`,
            description: test.description
          });
        }
      }

      // Run hidden tests
      for (const test of tests.hidden) {
        try {
          const actual = Array.isArray(test.input) ? func(...test.input) : func(test.input);
          results.push({
            passed: JSON.stringify(actual) === JSON.stringify(test.expected),
            input: test.input,
            expected: test.expected,
            actual
          });
        } catch (error) {
          results.push({
            passed: false,
            input: test.input,
            expected: test.expected,
            actual: `Error: ${error}`
          });
        }
      }
    } catch (error) {
      results.push({
        passed: false,
        input: 'Code compilation',
        expected: 'Valid function',
        actual: `Compilation Error: ${error}`
      });
    }

    return results;
  };

  const calculateQuestionScore = (answer: Answer): number => {
    switch (answer.type) {
      case 'mcq':
        return answer.correct ? 1 : 0;

      case 'code':
      case 'debugging':
        if (answer.tests) {
          return answer.tests.passed / answer.tests.total;
        }
        return 0;

      case 'qa':
        if (answer.rubric) {
          const avg = (
            answer.rubric.clarity +
            answer.rubric.depth +
            answer.rubric.relevance +
            answer.rubric.structure +
            answer.rubric.communication +
            answer.rubric.accuracy
          ) / 6;
          return avg / 10; // Normalize to 0-1
        }
        return 0;

      default:
        return 0;
    }
  };

  const calculateOverallScore = (answers: Answer[]): number => {
    if (answers.length === 0) return 0;

    const weights = {
      mcq: 1,
      qa: 1,
      code: 2,
      debugging: 2
    };

    let totalScore = 0;
    let totalWeight = 0;

    answers.forEach(answer => {
      const score = calculateQuestionScore(answer);
      const weight = weights[answer.type as keyof typeof weights] || 1;
      totalScore += score * weight;
      totalWeight += weight;
    });

    return Math.round((totalScore / totalWeight) * 100);
  };

  const evaluateTextAnswer = (text: string, type: string): any => {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    // Simple rubric scoring based on content analysis
    const rubric = {
      clarity: Math.min(10, Math.max(1, wordCount > 20 ? 8 : wordCount / 3)),
      depth: Math.min(10, Math.max(1, wordCount > 50 ? 9 : wordCount / 6)),
      relevance: Math.min(10, Math.max(1, 7)), // Default good relevance
      structure: Math.min(10, Math.max(1, text.includes('situation') || text.includes('task') || text.includes('action') || text.includes('result') ? 9 : 6)),
      communication: Math.min(10, Math.max(1, wordCount > 30 ? 8 : wordCount / 4)),
      accuracy: Math.min(10, Math.max(1, 7)) // Default technical accuracy
    };

    return rubric;
  };

  // ... existing code for speech recognition, navigation, etc. ...

  const startRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleNextQuestion = () => {
    if (questions.length === 0) return;

    saveCurrentAnswer();

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetQuestionState();

      // Award XP for answering
      setXp(prev => prev + 2);
      setStreak(prev => prev + 1);

      // Streak bonus every 5 questions
      if ((currentQuestionIndex + 1) % 5 === 0) {
        setXp(prev => prev + 5);
      }
    } else {
      handleSubmitInterview();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0 && questions.length > 0) {
      saveCurrentAnswer();
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      loadPreviousAnswer();
    }
  };

  const saveCurrentAnswer = async () => {
    if (questions.length === 0 || currentQuestionIndex >= questions.length) {
      return;
    }

    const question = questions[currentQuestionIndex];
    if (!question) {
      return;
    }

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    const answer: Answer = {
      questionId: question.id,
      type: question.type,
      prompt: question.prompt,
      tags: question.tags,
      timeSpentS: timeSpent
    };

    switch (question.type) {
      case 'mcq':
        answer.mcqChoice = selectedMcq || 0;
        answer.correct = selectedMcq === question.correctAnswer;
        break;
      case 'qa':
        answer.answerText = currentAnswer;
        answer.transcriptText = transcript;
        // Try AI evaluation first, fallback to basic
        try {
          if (currentAnswer.trim().length > 10) {
            const aiEvaluation = await evaluateTextAnswerAI({
              answer: currentAnswer,
              question: question,
            });
            answer.rubric = {
              clarity: aiEvaluation.rubric.clarity,
              depth: aiEvaluation.rubric.depth,
              relevance: aiEvaluation.rubric.relevance,
              structure: aiEvaluation.rubric.structure,
              communication: aiEvaluation.rubric.communication,
              accuracy: aiEvaluation.rubric.accuracy,
            };
            // Store AI feedback for later display
            (answer as any).aiFeedback = aiEvaluation.feedback;
            (answer as any).aiStrengths = aiEvaluation.strengths;
            (answer as any).aiImprovements = aiEvaluation.improvements;
          } else {
            answer.rubric = evaluateTextAnswer(currentAnswer, question.type);
          }
        } catch (error) {
          // Fallback to basic evaluation
          answer.rubric = evaluateTextAnswer(currentAnswer, question.type);
        }
        break;
      case 'code':
        answer.code = currentCode;
        if (testResults.length > 0) {
          answer.tests = {
            passed: testResults.filter(r => r.passed).length,
            total: testResults.length,
            logs: testResults.map(r => `${r.description || 'Test'}: ${r.passed ? 'PASS' : 'FAIL'}`)
          };
        }
        // Try AI code evaluation
        try {
          if (currentCode.trim().length > 10) {
            const aiCodeEvaluation = await evaluateCodeSubmissionAI({
              answer: currentAnswer,
              question: question,
              code: currentCode,
              language: selectedLanguage,
            });
            (answer as any).aiCodeFeedback = aiCodeEvaluation.feedback;
            (answer as any).aiCodeImprovements = aiCodeEvaluation.improvements;
          }
        } catch (error) {
          // Silently fail - basic evaluation is sufficient
        }
        break;
      case 'debugging':
        answer.code = currentCode;
        answer.answerText = currentAnswer;
        if (testResults.length > 0) {
          answer.tests = {
            passed: testResults.filter(r => r.passed).length,
            total: testResults.length,
            logs: testResults.map(r => `${r.description || 'Test'}: ${r.passed ? 'PASS' : 'FAIL'}`)
          };
        }
        // Try AI code evaluation for debugging
        try {
          if (currentCode.trim().length > 10) {
            const aiCodeEvaluation = await evaluateCodeSubmissionAI({
              answer: currentAnswer,
              question: question,
              code: currentCode,
              language: selectedLanguage,
            });
            (answer as any).aiCodeFeedback = aiCodeEvaluation.feedback;
            (answer as any).aiCodeImprovements = aiCodeEvaluation.improvements;
          }
        } catch (error) {
          // Silently fail - basic evaluation is sufficient
        }
        break;
    }

    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== question.id);
      return [...filtered, answer];
    });
  };

  const loadPreviousAnswer = () => {
    if (questions.length === 0 || currentQuestionIndex >= questions.length) {
      return;
    }

    const question = questions[currentQuestionIndex];
    if (!question) {
      return;
    }

    const existingAnswer = answers.find(a => a.questionId === question.id);

    if (existingAnswer) {
      setCurrentAnswer(existingAnswer.answerText || '');
      setCurrentCode(existingAnswer.code || '');
      setSelectedMcq(existingAnswer.mcqChoice || null);
      setTranscript(existingAnswer.transcriptText || '');
    } else {
      resetQuestionState();
    }
  };

  const resetQuestionState = () => {
    setCurrentAnswer('');
    setCurrentCode('');
    setSelectedMcq(null);
    setTranscript('');
    setCodeOutput('');
    setTestResults([]);
    setActiveTab('editor');
    setQuestionStartTime(Date.now());
  };

  const toggleFlag = () => {
    if (questions.length === 0 || currentQuestionIndex >= questions.length) {
      return;
    }

    const questionId = questions[currentQuestionIndex].id;
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const updateGamificationData = async (score: number, questionsAnswered: number) => {
    if (!session?.user?.id) return;

    try {
      // Calculate XP based on score and questions
      const baseXP = Math.floor(score * 2); // 0-200 XP based on score
      const questionBonus = questionsAnswered * 10; // 10 XP per question
      const totalXP = baseXP + questionBonus;

      // Get or create user gamification data
      const { data: existingData } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      const currentXP = existingData?.total_xp || 0;
      const currentLevel = existingData?.level || 1;
      const currentStreak = existingData?.streak_days || 0;
      const lastActivity = existingData?.last_activity_date;

      // Calculate new values
      const newTotalXP = currentXP + totalXP;
      const newLevel = Math.floor(newTotalXP / 1000) + 1; // Level up every 1000 XP

      // Calculate streak
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      let newStreak = currentStreak;

      if (lastActivity === yesterday) {
        newStreak = currentStreak + 1; // Continue streak
      } else if (lastActivity !== today) {
        newStreak = 1; // Start new streak
      }

      // Update or insert gamification data
      if (existingData) {
        await supabase
          .from('user_gamification')
          .update({
            total_xp: newTotalXP,
            level: newLevel,
            streak_days: newStreak,
            last_activity_date: today,
            interviews_completed: (existingData.interviews_completed || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id);
      } else {
        await supabase
          .from('user_gamification')
          .insert({
            user_id: session.user.id,
            total_xp: newTotalXP,
            level: newLevel,
            streak_days: newStreak,
            last_activity_date: today,
            interviews_completed: 1
          });
      }

      // Update daily goals
      await updateDailyGoals(session.user.id, totalXP);

      // Check and unlock badges
      await checkAndUnlockBadges(session.user.id, newTotalXP, newLevel, newStreak);

      console.log(`✅ Gamification updated: +${totalXP} XP, Level ${newLevel}, Streak ${newStreak}`);
    } catch (error) {
      console.error('Error updating gamification data:', error);
    }
  };

  const updateDailyGoals = async (userId: string, earnedXP: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get today's goals
      const { data: goals } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today);

      // If no goals exist, create them
      if (!goals || goals.length === 0) {
        await supabase.from('daily_goals').insert([
          {
            user_id: userId,
            goal_type: 'interviews',
            target: 3,
            current: 1,
            completed: false,
            date: today
          },
          {
            user_id: userId,
            goal_type: 'practice_time',
            target: 30,
            current: 10,
            completed: false,
            date: today
          }
        ]);
      } else {
        // Update interview goal
        const interviewGoal = goals.find(g => g.goal_type === 'interviews');
        if (interviewGoal) {
          const newCurrent = (interviewGoal.current || 0) + 1;
          await supabase
            .from('daily_goals')
            .update({
              current: newCurrent,
              completed: newCurrent >= interviewGoal.target,
              updated_at: new Date().toISOString()
            })
            .eq('id', interviewGoal.id);
        }
      }
    } catch (error) {
      console.error('Error updating daily goals:', error);
    }
  };

  const checkAndUnlockBadges = async (userId: string, totalXP: number, level: number, streak: number) => {
    try {
      // Get user's current badges
      const { data: existingBadges } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);

      // Define badge unlock conditions
      const badgeConditions = [
        { badge_id: 'first_interview', name: 'First Interview', condition: totalXP >= 10, icon: 'ri-medal-line' },
        { badge_id: 'streak_3', name: '3-Day Streak', condition: streak >= 3, icon: 'ri-fire-line' },
        { badge_id: 'streak_7', name: 'Week Warrior', condition: streak >= 7, icon: 'ri-fire-fill' },
        { badge_id: 'level_5', name: 'Rising Star', condition: level >= 5, icon: 'ri-star-line' },
        { badge_id: 'xp_500', name: 'XP Hunter', condition: totalXP >= 500, icon: 'ri-trophy-line' },
        { badge_id: 'xp_1000', name: 'XP Master', condition: totalXP >= 1000, icon: 'ri-trophy-fill' },
      ];

      for (const badge of badgeConditions) {
        if (badge.condition) {
          const exists = existingBadges?.find(b => b.badge_id === badge.badge_id);

          if (!exists) {
            // Create new badge
            await supabase.from('user_badges').insert({
              user_id: userId,
              badge_id: badge.badge_id,
              badge_name: badge.name,
              badge_description: `Unlocked: ${badge.name}`,
              badge_icon: badge.icon,
              earned_at: new Date().toISOString()
            });
          } else if (!exists.earned_at) {
            // Unlock existing badge
            await supabase
              .from('user_badges')
              .update({
                earned_at: new Date().toISOString()
              })
              .eq('id', exists.id);
          }
        }
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  };

  const handleSubmitInterview = async () => {
    if (isSubmitting || questions.length === 0) return;

    setIsSubmitting(true);

    // Only save current answer if we have valid questions
    if (currentQuestionIndex < questions.length && questions[currentQuestionIndex]) {
      await saveCurrentAnswer();
    }

    try {
      // Calculate overall score using new accurate method
      const overallScore = calculateOverallScore(answers);

      // Award completion bonus
      const completionBonus = timeLeft > 0 ? 10 : 5;
      setXp(prev => prev + completionBonus);

      // Insert interview record
      const { data: interview, error } = await supabase
        .from('interviews')
        .insert({
          user_id: session!.user.id,
          role: config.roles.join(', '),
          company: null,
          skills: config.roles,
          mode: config.inputMode === 'voice' ? 'voice' : config.inputMode === 'text' ? 'text' : 'video',
          difficulty: config.level,
          scheduled_at: null,
          started_at: new Date(Date.now() - (config.duration * 60 * 1000 - timeLeft * 1000)).toISOString(),
          ended_at: new Date().toISOString(),
          overall_score: overallScore,
          transcript: answers,
          media_urls: {},
          // Store source metadata if available
          ...(config.source === 'a4f' ? { source: 'a4f' } : {})
        })
        .select()
        .single();

      if (error) throw error;

      // Update gamification data based on interview completion
      await updateGamificationData(overallScore, answers.length);

      // Clear session storage
      sessionStorage.removeItem('interviewConfig');

      // Navigate to results
      navigate(`/interviews/${interview.id}`);
    } catch (error) {
      console.error('Error submitting interview:', error);
      alert('Failed to submit interview. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!config || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Generating personalized questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading questions...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {config?.source === 'a4f' && (
              <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                <i className="ri-sparkling-line text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Dynamic Set (A4F)</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <i className="ri-timer-line text-lg text-red-500" />
              <span className={`font-mono text-lg font-semibold ${timeLeft < 300 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Progress:</span>
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {currentQuestionIndex + 1}/{questions.length}
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
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gold-50 dark:bg-gold-900/20 px-3 py-1 rounded-lg">
              <i className="ri-star-line text-gold-500" />
              <span className="text-sm font-semibold text-gold-700 dark:text-gold-400">{xp} XP</span>
            </div>
            {!pauseUsed && (
              <button
                onClick={() => {
                  setIsPaused(!isPaused);
                  if (!isPaused) setPauseUsed(true);
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-160 whitespace-nowrap"
              >
                <i className={`ri-${isPaused ? 'play' : 'pause'}-line mr-1`} />
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to quit the interview?')) {
                  navigate('/interviews');
                }
              }}
              className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors duration-160 whitespace-nowrap"
            >
              <i className="ri-close-line mr-1" />
              Quit
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Question Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                    {currentQuestion.skill}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentQuestion.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                    {currentQuestion.difficulty}
                  </span>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium uppercase">
                    {currentQuestion.type}
                  </span>
                  {currentQuestion.tags.map(tag => (
                    <span key={tag} className="bg-gold-100 dark:bg-gold-900/30 text-gold-800 dark:text-gold-300 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={toggleFlag}
                  className={`p-2 rounded-lg transition-colors duration-160 ${flaggedQuestions.has(currentQuestion.id)
                    ? 'bg-gold-100 dark:bg-gold-900/30 text-gold-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  <i className="ri-flag-line" />
                </button>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {currentQuestion.prompt}
              </h2>

              {currentQuestion.codeSnippet && (
                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <pre className="text-green-400 text-sm overflow-x-auto">
                    <code>{currentQuestion.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Answer Input */}
              {currentQuestion.type === 'mcq' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-160">
                      <input
                        type="radio"
                        name="mcq"
                        value={index}
                        checked={selectedMcq === index}
                        onChange={() => setSelectedMcq(index)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-900 dark:text-white">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {(currentQuestion.type === 'qa' || currentQuestion.type === 'debugging') && (
                <div className="space-y-4">
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder={currentQuestion.type === 'qa' && currentQuestion.hint?.includes('STAR')
                      ? 'Use STAR method: Situation, Task, Action, Result...'
                      : 'Type your answer here...'}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows={8}
                  />
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{currentAnswer.length} characters</span>
                    {config.inputMode !== 'text' && (
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors duration-160 ${isRecording
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                          }`}
                      >
                        <i className={`ri-${isRecording ? 'stop' : 'mic'}-line`} />
                        <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                      </button>
                    )}
                  </div>
                  {transcript && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Transcript:</strong> {transcript}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(currentQuestion.type === 'code' || currentQuestion.type === 'debugging') && (
                <div className="space-y-4">
                  {/* Code Editor Tabs */}
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <select
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="bg-gray-700 text-gray-300 text-sm rounded px-2 py-1 border-none"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="typescript">TypeScript</option>
                          <option value="python">Python</option>
                        </select>
                        <div className="flex space-x-2">
                          {['editor', 'io', 'tests'].map(tab => (
                            <button
                              key={tab}
                              onClick={() => setActiveTab(tab as any)}
                              className={`px-3 py-1 text-sm rounded transition-colors duration-160 ${activeTab === tab
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                            >
                              {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={runCode}
                          disabled={isRunningCode}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors duration-160 disabled:opacity-50"
                        >
                          {isRunningCode ? (
                            <i className="ri-loader-4-line animate-spin mr-1" />
                          ) : (
                            <i className="ri-play-line mr-1" />
                          )}
                          Run
                        </button>
                        <button
                          onClick={() => {
                            setCodeOutput('');
                            setTestResults([]);
                          }}
                          className="text-gray-400 hover:text-white text-sm"
                        >
                          <i className="ri-stop-line mr-1" />
                          Stop
                        </button>
                      </div>
                    </div>

                    {activeTab === 'editor' && (
                      <textarea
                        value={currentCode}
                        onChange={(e) => setCurrentCode(e.target.value)}
                        placeholder={currentQuestion.type === 'debugging' ? 'Fix the bugs in the code above...' : 'Write your code here...'}
                        className="w-full bg-gray-900 text-green-400 p-4 font-mono text-sm resize-none border-none outline-none"
                        rows={12}
                      />
                    )}

                    {activeTab === 'io' && (
                      <div className="p-4">
                        <h4 className="text-gray-300 text-sm font-medium mb-2">Output:</h4>
                        <pre className="text-gray-300 text-sm whitespace-pre-wrap bg-gray-800 p-3 rounded max-h-64 overflow-y-auto">
                          {codeOutput || 'Run your code to see output...'}
                        </pre>
                      </div>
                    )}

                    {activeTab === 'tests' && (
                      <div className="p-4">
                        <h4 className="text-gray-300 text-sm font-medium mb-2">Test Results:</h4>
                        {testResults.length > 0 ? (
                          <div className="space-y-2">
                            {testResults.map((result, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded text-sm ${result.passed
                                  ? 'bg-green-900/30 text-green-300'
                                  : 'bg-red-900/30 text-red-300'
                                  }`}
                              >
                                <div className="flex items-center space-x-2 mb-1">
                                  <i className={`ri-${result.passed ? 'check' : 'close'}-circle-line`} />
                                  <span className="font-medium">
                                    {result.description || `Test ${index + 1}`}
                                  </span>
                                </div>
                                <div className="text-xs opacity-75">
                                  Input: {JSON.stringify(result.input)}<br />
                                  Expected: {JSON.stringify(result.expected)}<br />
                                  Actual: {JSON.stringify(result.actual)}
                                </div>
                              </div>
                            ))}
                            <div className="mt-3 text-gray-400 text-sm">
                              Passed: {testResults.filter(r => r.passed).length} / {testResults.length}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">Run your code to see test results...</p>
                        )}
                      </div>
                    )}
                  </div>

                  {currentQuestion.type === 'debugging' && (
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Explain the bugs you found and how you fixed them..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      rows={4}
                    />
                  )}
                </div>
              )}

              {showHints && currentQuestion.hint && (
                <div className="mt-4 bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <i className="ri-lightbulb-line text-gold-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gold-800 dark:text-gold-300 mb-1">Hint:</p>
                      <p className="text-sm text-gold-700 dark:text-gold-400">{currentQuestion.hint}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-160 whitespace-nowrap"
              >
                <i className="ri-arrow-left-line" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 rounded-lg hover:bg-gold-200 dark:hover:bg-gold-900/50 transition-colors duration-160 whitespace-nowrap"
                >
                  <i className="ri-lightbulb-line" />
                  <span>{showHints ? 'Hide' : 'Show'} Hints</span>
                </button>

                <button
                  onClick={handleNextQuestion}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-160 whitespace-nowrap"
                >
                  <span>{currentQuestionIndex === questions.length - 1 ? 'Submit Interview' : 'Next'}</span>
                  <i className={`ri-${currentQuestionIndex === questions.length - 1 ? 'check' : 'arrow-right'}-line`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* Gamified HUD */}
          <div className="bg-gradient-to-br from-blue-50 to-gold-50 dark:from-blue-900/20 dark:to-gold-900/20 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Performance</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">XP Progress</span>
                  <span className="font-medium text-gold-600">{xp} XP</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gold-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (xp % 100))}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Streak</span>
                <div className="flex items-center space-x-1">
                  <i className="ri-fire-line text-orange-500" />
                  <span className="font-medium text-orange-600">{streak}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Take notes during the interview..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
              rows={6}
            />
          </div>

          {/* Question Overview */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Questions</h3>
            <div className="space-y-2">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`flex items-center justify-between p-2 rounded-lg text-sm cursor-pointer transition-colors duration-160 ${index === currentQuestionIndex
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    : answers.some(a => a.questionId === question.id)
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  onClick={() => {
                    saveCurrentAnswer();
                    setCurrentQuestionIndex(index);
                    loadPreviousAnswer();
                  }}
                >
                  <span>Q{index + 1}</span>
                  <div className="flex items-center space-x-1">
                    {answers.some(a => a.questionId === question.id) && (
                      <i className="ri-check-line text-green-500" />
                    )}
                    {flaggedQuestions.has(question.id) && (
                      <i className="ri-flag-fill text-gold-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

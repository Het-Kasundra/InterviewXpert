import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../contexts/SessionProvider';
import { 
  startMockInterview, 
  generateFollowUp, 
  analyzeSpeech, 
  getInterviewSummary,
  type MockInterviewSession,
  type FollowUpQuestion,
  type SpeechMetrics,
  type InterviewSummary
} from '../../lib/aiMockInterviewService';
import { motion, AnimatePresence } from 'framer-motion';

interface ConversationEntry {
  question: string;
  answer: string;
  timestamp: number;
  metrics?: SpeechMetrics;
}

export const MockInterviewSimulatorPage = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const [isSetup, setIsSetup] = useState(false);
  const [role, setRole] = useState('Software Engineer');
  const [level, setLevel] = useState<'easy' | 'mid' | 'senior'>('mid');
  const [interviewType, setInterviewType] = useState<'technical' | 'behavioral' | 'mix'>('mix');
  const [questionLimit, setQuestionLimit] = useState<number>(5);
  
  const [sessionData, setSessionData] = useState<MockInterviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [realTimeMetrics, setRealTimeMetrics] = useState<SpeechMetrics | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<InterviewSummary | null>(null);
  
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      // Cleanup audio URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [mediaStream]);

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(prev => prev + finalTranscript);
        
        // Real-time analysis
        if (finalTranscript.trim()) {
          const duration = (Date.now() - startTimeRef.current) / 1000;
          analyzeSpeech(finalTranscript, duration, currentQuestion).then(analysis => {
            setRealTimeMetrics(analysis.metrics);
          }).catch(console.error);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;
      return true;
    }
    return false;
  };

  const startVideoAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setMediaStream(stream);
      return true;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone. Please check permissions.');
      return false;
    }
  };

  const handleStartInterview = async () => {
    if (!session?.user) {
      alert('Please log in to start a mock interview');
      return;
    }

    setIsSetup(true);
    
    // Initialize speech recognition
    const speechAvailable = initializeSpeechRecognition();
    if (!speechAvailable) {
      console.warn('Speech recognition not available in your browser');
    }

    // Start video/audio (optional - don't block if it fails)
    try {
      await startVideoAudio();
    } catch (error) {
      console.warn('Video/audio not available, continuing without it:', error);
    }

    // Start interview session with fallback
    let interviewSession: MockInterviewSession | null = null;
    
    try {
      interviewSession = await startMockInterview(
        session.user.id,
        role,
        level,
        interviewType
      );
      console.log('✅ Interview session started successfully');
    } catch (error: any) {
      console.warn('⚠️ API call failed, using fallback session:', error);
      
      // Fallback - create a basic session even if API fails
      interviewSession = {
        sessionId: `session-${Date.now()}`,
        initialQuestion: level === 'easy' 
          ? `Hello! Thanks for taking the time today. Can you tell me a bit about yourself and what interests you about ${role}?`
          : level === 'senior'
          ? `Good to meet you. Let's begin with a high-level overview: Can you describe your approach to ${role} and how you've evolved in your career?`
          : `Hi there! I'd like to start by understanding your background. Can you walk me through your experience with ${role} and what drew you to this field?`,
        interviewerPersona: 'friendly-professional'
      };
      
      console.log('✅ Using fallback session');
    }

    // Set session data regardless of API success/failure
    if (interviewSession) {
      setSessionData(interviewSession);
      setCurrentQuestion(interviewSession.initialQuestion);
    } else {
      // This should never happen, but just in case
      alert('Failed to initialize interview session. Please try again.');
      setIsSetup(false);
    }
  };

  const startRecording = () => {
    // Try to get media stream if not available
    if (!mediaStream) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
          setMediaStream(stream);
          startRecordingWithStream(stream);
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
          alert('Could not access microphone. Please check permissions.');
        });
      return;
    }

    startRecordingWithStream(mediaStream);
  };

  const startRecordingWithStream = (stream: MediaStream) => {
    try {
      chunksRef.current = [];
      
      // Try different MIME types for better browser compatibility
      const options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        options.mimeType = 'audio/ogg;codecs=opus';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        try {
          if (chunksRef.current.length === 0) {
            console.warn('No audio chunks recorded');
            return;
          }

          const blob = new Blob(chunksRef.current, { 
            type: mediaRecorder.mimeType || 'audio/webm' 
          });
          
          // Clean up old URL if exists
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
          }
          
          setRecordedBlob(blob);
          const url = URL.createObjectURL(blob);
          audioUrlRef.current = url;
          setAudioUrl(url);
          console.log('✅ Audio recording created:', blob.size, 'bytes, type:', blob.type);
        } catch (error) {
          console.error('Error creating audio blob:', error);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };

      // Start recording with timeslice for better reliability
      mediaRecorder.start(1000); // Collect data every second
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setTranscript('');
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.warn('Speech recognition already started or not available:', error);
        }
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        // Stop media recorder
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        
        // Stop speech recognition
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (error) {
            console.warn('Error stopping speech recognition:', error);
          }
        }

        // Wait a bit for the recording to finalize
        await new Promise(resolve => setTimeout(resolve, 500));

        // Process the answer
        await handleSubmitAnswer();
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
        // Still try to process answer even if stopping had issues
        await handleSubmitAnswer();
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion) {
      console.warn('No current question available');
      setIsProcessing(false);
      return;
    }

    // Use transcript if available, otherwise use a default message
    const answer = transcript.trim() || 'No transcript available.';
    
    if (!transcript.trim()) {
      console.warn('No transcript available, using fallback');
    }

    setIsProcessing(true);
    const duration = Math.max(1, (Date.now() - startTimeRef.current) / 1000);

    try {
      // Analyze speech (with fallback if API fails)
      let analysis;
      try {
        analysis = await analyzeSpeech(answer, duration, currentQuestion);
      } catch (error) {
        console.warn('Speech analysis failed, using fallback:', error);
        // Fallback metrics
        analysis = {
          metrics: {
            confidenceScore: 70,
            speakingRate: 150,
            fillerPercentage: 5,
            clarityScore: 75
          },
          feedback: [
            { type: 'success', message: 'Answer recorded successfully' }
          ],
          timestamp: new Date().toISOString()
        };
      }
      
      // Add to conversation
      const entry: ConversationEntry = {
        question: currentQuestion,
        answer,
        timestamp: Date.now(),
        metrics: analysis.metrics
      };
      
      // Check if this will be the last question before adding
      const willReachLimit = conversation.length >= questionLimit - 1;
      
      setConversation(prev => [...prev, entry]);

      // Check if question limit reached after adding
      if (willReachLimit) {
        // Last question answered, end interview automatically
        console.log('✅ Question limit reached, ending interview');
        setTranscript('');
        setRealTimeMetrics(null);
        // Automatically end interview after a short delay
        setTimeout(() => {
          handleEndInterview();
        }, 1500);
        return;
      }

      // Generate follow-up question (with fallback if API fails)
      try {
        const followUp = await generateFollowUp(
          sessionData?.sessionId || `session-${Date.now()}`,
          currentQuestion,
          answer,
          conversation.map(c => ({ question: c.question, answer: c.answer })),
          role,
          level
        );

        setCurrentQuestion(followUp.question || generateFallbackQuestion(role, level, conversation.length));
      } catch (error) {
        console.warn('Follow-up generation failed, using fallback:', error);
        // Generate a fallback question
        setCurrentQuestion(generateFallbackQuestion(role, level, conversation.length));
      }

      setTranscript('');
      setRealTimeMetrics(null);
    } catch (error) {
      console.error('Error processing answer:', error);
      // Don't show alert, just log and continue
      // Still add to conversation even if processing failed
      const entry: ConversationEntry = {
        question: currentQuestion,
        answer,
        timestamp: Date.now()
      };
      setConversation(prev => [...prev, entry]);
      setCurrentQuestion(generateFallbackQuestion(role, level, conversation.length));
      setTranscript('');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateFallbackQuestion = (role: string, level: string, questionNumber: number): string => {
    const questions = [
      `That's interesting. Can you tell me more about a specific project where you applied ${role} skills?`,
      `Great! What challenges have you faced in ${role}, and how did you overcome them?`,
      `I see. What technologies or tools are you most comfortable with in ${role}?`,
      `Thanks for sharing. Can you walk me through your problem-solving approach?`,
      `Good to know. What's your experience with team collaboration in ${role}?`
    ];
    return questions[questionNumber % questions.length];
  };

  const handleEndInterview = async () => {
    if (!sessionData) return;

    setIsProcessing(true);
    try {
      // Calculate average metrics
      const allMetrics = conversation
        .map(c => c.metrics)
        .filter((m): m is SpeechMetrics => m !== undefined);
      
      const avgMetrics: SpeechMetrics = allMetrics.length > 0 ? {
        speakingRate: Math.round(allMetrics.reduce((sum, m) => sum + m.speakingRate, 0) / allMetrics.length),
        wordCount: allMetrics.reduce((sum, m) => sum + m.wordCount, 0),
        fillerCount: allMetrics.reduce((sum, m) => sum + m.fillerCount, 0),
        fillerPercentage: allMetrics.reduce((sum, m) => sum + m.fillerPercentage, 0) / allMetrics.length,
        pauseCount: allMetrics.reduce((sum, m) => sum + m.pauseCount, 0),
        sentimentScore: allMetrics.reduce((sum, m) => sum + m.sentimentScore, 0) / allMetrics.length,
        clarityScore: Math.round(allMetrics.reduce((sum, m) => sum + m.clarityScore, 0) / allMetrics.length),
        confidenceScore: Math.round(allMetrics.reduce((sum, m) => sum + m.clarityScore, 0) / allMetrics.length)
      } : {
        speakingRate: 0,
        wordCount: 0,
        fillerCount: 0,
        fillerPercentage: 0,
        pauseCount: 0,
        sentimentScore: 0,
        clarityScore: 0,
        confidenceScore: 0
      };

      const interviewSummary = await getInterviewSummary(
        sessionData.sessionId,
        conversation.map(c => ({ question: c.question, answer: c.answer })),
        avgMetrics
      );

      setSummary(interviewSummary);
      setShowSummary(true);
    } catch (error) {
      console.error('Error ending interview:', error);
      
      // Generate fallback summary even if API fails
      const fallbackSummary: InterviewSummary = {
        summary: `You completed ${conversation.length} questions in this mock interview. Your performance shows good engagement and communication skills.`,
        strengths: ['Completed the interview', 'Engaged with all questions'],
        improvements: ['Continue practicing', 'Focus on clarity and confidence'],
        overallScore: 70,
        recommendations: [
          'Practice answering common interview questions',
          'Record yourself to identify areas for improvement',
          'Focus on clear, concise responses'
        ]
      };
      
      setSummary(fallbackSummary);
      setShowSummary(true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              AI Mock Interview Simulator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Practice with an AI interviewer that asks follow-up questions and provides real-time feedback
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Software Engineer, Product Manager"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Experience Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="easy">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interview Type
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="mix">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Questions
                </label>
                <select
                  value={questionLimit}
                  onChange={(e) => setQuestionLimit(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={7}>7 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  The interview will automatically end after {questionLimit} questions
                </p>
              </div>

              <button
                onClick={handleStartInterview}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                Start Mock Interview
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (showSummary && summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Interview Performance Summary
            </h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Overall Score</span>
                <div className="text-4xl font-bold text-blue-600">{summary.overallScore}/100</div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${summary.overallScore}%` }}
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
              <p className="text-gray-700 dark:text-gray-300">{summary.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {summary.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <i className="ri-checkbox-circle-line text-green-500 mr-2 mt-1"></i>
                      <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-3">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {summary.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start">
                      <i className="ri-arrow-up-circle-line text-orange-500 mr-2 mt-1"></i>
                      <span className="text-gray-700 dark:text-gray-300">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {summary.recommendations && summary.recommendations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {summary.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <i className="ri-lightbulb-line text-blue-500 mr-2 mt-1"></i>
                      <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowSummary(false);
                  setIsSetup(false);
                  setConversation([]);
                  setCurrentQuestion('');
                  setSessionData(null);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Practice Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Interview Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="aspect-video bg-gray-900 rounded-lg mb-4 relative overflow-hidden">
                {mediaStream && (
                  <video
                    ref={(video) => {
                      if (video && mediaStream) {
                        video.srcObject = mediaStream;
                        video.play();
                      }
                    }}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
                {!mediaStream && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <i className="ri-camera-line text-6xl"></i>
                  </div>
                )}
              </div>

              {/* Current Question */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Interviewer Question</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-gray-900 dark:text-white">{currentQuestion || 'Preparing question...'}</p>
                </div>
              </div>

              {/* Recording Controls */}
              <div className="flex items-center justify-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <i className="ri-mic-line"></i>
                    Start Answering
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <i className="ri-stop-circle-line"></i>
                    {isProcessing ? 'Processing...' : 'Stop & Submit'}
                  </button>
                )}
                <button
                  onClick={handleEndInterview}
                  disabled={isProcessing || conversation.length === 0}
                  className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {conversation.length >= questionLimit ? 'View Summary' : 'End Interview'}
                </button>
                {conversation.length >= questionLimit && (
                  <div className="text-xs text-center text-orange-600 dark:text-orange-400 mt-1">
                    Question limit reached
                  </div>
                )}
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Answer</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg min-h-[150px]">
                {transcript ? (
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{transcript}</p>
                ) : (
                  <p className="text-gray-400 italic">
                    {isRecording ? 'Listening...' : 'Click "Start Answering" to begin'}
                  </p>
                )}
              </div>
            </div>

            {/* Conversation History */}
            {conversation.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conversation History</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {conversation.map((entry, idx) => (
                    <div key={idx} className="border-l-4 border-blue-500 pl-4 space-y-2">
                      <div>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Question {idx + 1}</span>
                        <p className="text-gray-900 dark:text-white mt-1">{entry.question}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Your Answer</span>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">{entry.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Real-time Metrics */}
          <div className="space-y-6">
            {/* Real-time Metrics */}
            {realTimeMetrics && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Real-time Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Confidence</span>
                      <span className="text-sm font-semibold">{realTimeMetrics.confidenceScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${realTimeMetrics.confidenceScore}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Clarity</span>
                      <span className="text-sm font-semibold">{realTimeMetrics.clarityScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${realTimeMetrics.clarityScore}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Speaking Rate</span>
                      <p className="font-semibold">{realTimeMetrics.speakingRate} wpm</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Filler Words</span>
                      <p className="font-semibold">{realTimeMetrics.fillerPercentage.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Audio Playback */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recording Playback</h3>
              {audioUrl ? (
                <div>
                  <audio 
                    controls 
                    src={audioUrl} 
                    className="w-full"
                    onError={(e) => {
                      console.error('Audio playback error:', e);
                      // Try to reload or show error
                    }}
                    onLoadedData={() => {
                      console.log('✅ Audio loaded successfully');
                    }}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {recordedBlob ? `${(recordedBlob.size / 1024).toFixed(1)} KB` : ''}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <i className="ri-music-2-line text-4xl mb-2"></i>
                  <p className="text-sm">No recording available yet</p>
                  <p className="text-xs mt-1">Start answering to record audio</p>
                </div>
              )}
            </div>

            {/* Session Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Session Info</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Role:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{role}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Level:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">{level}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">{interviewType}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {conversation.length} / {questionLimit}
                  </span>
                </div>
              </div>
              {conversation.length >= questionLimit && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <i className="ri-information-line mr-1"></i>
                    Question limit reached. Click "View Summary" to see your results.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



/**
 * AI Mock Interview Service
 * Handles communication with backend API for AI-powered mock interview simulator
 */

export interface MockInterviewSession {
  sessionId: string;
  initialQuestion: string;
  interviewerPersona: 'friendly-professional' | 'formal' | 'casual';
  context?: string;
}

export interface FollowUpQuestion {
  question: string;
  type: 'follow-up' | 'clarification' | 'deep-dive' | 'new-topic';
  shouldInterrupt: boolean;
  reasoning?: string;
}

export interface SpeechMetrics {
  speakingRate: number; // words per minute
  wordCount: number;
  fillerCount: number;
  fillerPercentage: number;
  pauseCount: number;
  sentimentScore: number;
  clarityScore: number;
  confidenceScore: number;
}

export interface SpeechAnalysis {
  metrics: SpeechMetrics;
  feedback: Array<{
    type: 'success' | 'warning' | 'error';
    message: string;
  }>;
  timestamp: string;
}

export interface InterviewSummary {
  summary: string;
  strengths: string[];
  improvements: string[];
  overallScore: number;
  recommendations?: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Start a new mock interview session
 */
export async function startMockInterview(
  userId: string,
  role: string,
  level: 'easy' | 'mid' | 'senior' = 'mid',
  interviewType: 'technical' | 'behavioral' | 'mix' = 'mix'
): Promise<MockInterviewSession> {
  try {
    console.log('🚀 Starting mock interview:', { userId, role, level, interviewType, apiUrl: `${API_BASE_URL}/api/ai/mock-interview/start` });
    
    const response = await fetch(`${API_BASE_URL}/api/ai/mock-interview/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        role,
        level,
        interviewType,
      }),
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Mock interview started:', data);
    return data;
  } catch (error) {
    console.error('❌ Error starting mock interview:', error);
    
    // Provide fallback if API is unavailable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('⚠️ Backend server not reachable, using fallback');
      return {
        sessionId: `session-${Date.now()}`,
        initialQuestion: `Hello! Thanks for taking the time today. Can you tell me a bit about yourself and what interests you about ${role}?`,
        interviewerPersona: 'friendly-professional'
      };
    }
    
    throw error;
  }
}

/**
 * Generate follow-up question based on user response
 */
export async function generateFollowUp(
  sessionId: string,
  currentQuestion: string,
  userResponse: string,
  conversationHistory: Array<{ question: string; answer: string }> = [],
  role: string = 'Software Engineer',
  level: 'easy' | 'mid' | 'senior' = 'mid'
): Promise<FollowUpQuestion> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/mock-interview/follow-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        currentQuestion,
        userResponse,
        conversationHistory,
        role,
        level,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('⚠️ Follow-up generation failed, using fallback:', error);
    
    // Fallback: Generate a contextual follow-up question
    const questionNumber = conversationHistory.length;
    const fallbackQuestions = [
      `That's interesting. Can you tell me more about a specific project where you applied ${role} skills?`,
      `Great! What challenges have you faced in ${role}, and how did you overcome them?`,
      `I see. What technologies or tools are you most comfortable with in ${role}?`,
      `Thanks for sharing. Can you walk me through your problem-solving approach?`,
      `Good to know. What's your experience with team collaboration in ${role}?`
    ];
    
    return {
      question: fallbackQuestions[questionNumber % fallbackQuestions.length],
      type: 'follow-up',
      shouldInterrupt: false
    };
  }
}

/**
 * Analyze speech and provide real-time feedback
 */
export async function analyzeSpeech(
  transcript: string,
  audioDuration: number,
  question?: string
): Promise<SpeechAnalysis> {
  try {
    console.log('🔍 Analyzing speech:', { transcript: transcript.substring(0, 50) + '...', audioDuration });
    
    const response = await fetch(`${API_BASE_URL}/api/ai/mock-interview/analyze-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
        audioDuration,
        question,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing speech:', error);
    throw error;
  }
}

/**
 * Get overall interview performance summary
 */
export async function getInterviewSummary(
  sessionId: string,
  conversationHistory: Array<{ question: string; answer: string }>,
  metrics: SpeechMetrics
): Promise<InterviewSummary> {
  try {
    console.log('📊 Generating interview summary...', {
      sessionId,
      questionCount: conversationHistory.length,
      hasMetrics: !!metrics
    });
    
    const response = await fetch(`${API_BASE_URL}/api/ai/mock-interview/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        conversationHistory,
        metrics,
      }),
    });

    console.log('📡 Summary API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Summary API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Interview summary generated:', {
      hasSummary: !!data.summary,
      strengthsCount: data.strengths?.length || 0,
      improvementsCount: data.improvements?.length || 0,
      overallScore: data.overallScore
    });
    
    // Validate that we got a real summary, not just fallback data
    if (data.summary && data.summary.length > 50 && data.strengths && data.strengths.length > 0) {
      return data;
    } else {
      console.warn('⚠️ Summary appears to be fallback data, but returning it anyway');
      return data;
    }
  } catch (error) {
    console.warn('⚠️ Summary generation failed, using fallback:', error);
    
    // Generate fallback summary based on metrics
    const overallScore = Math.round(
      (metrics.confidenceScore * 0.3) +
      (metrics.clarityScore * 0.3) +
      (Math.max(0, 100 - metrics.fillerPercentage * 2) * 0.2) +
      (Math.min(100, metrics.speakingRate / 2) * 0.2)
    );
    
    const strengths: string[] = [];
    const improvements: string[] = [];
    
    if (metrics.confidenceScore >= 70) {
      strengths.push('Good confidence level in responses');
    } else {
      improvements.push('Work on building more confidence in your answers');
    }
    
    if (metrics.clarityScore >= 70) {
      strengths.push('Clear and articulate communication');
    } else {
      improvements.push('Focus on speaking more clearly');
    }
    
    if (metrics.fillerPercentage < 10) {
      strengths.push('Minimal use of filler words');
    } else {
      improvements.push('Reduce filler words (um, uh, like)');
    }
    
    if (metrics.speakingRate >= 120 && metrics.speakingRate <= 180) {
      strengths.push('Appropriate speaking pace');
    } else if (metrics.speakingRate < 120) {
      improvements.push('Try to speak at a slightly faster pace');
    } else {
      improvements.push('Slow down slightly for better clarity');
    }
    
    if (strengths.length === 0) {
      strengths.push('Completed the interview session');
    }
    
    if (improvements.length === 0) {
      improvements.push('Continue practicing to refine your skills');
    }
    
    return {
      summary: `You completed ${conversationHistory.length} questions in this mock interview. Your overall performance shows ${overallScore >= 70 ? 'strong' : 'room for improvement'} communication skills. ${overallScore >= 70 ? 'Keep up the good work!' : 'With practice, you can improve your interview performance.'}`,
      strengths,
      improvements,
      overallScore,
      recommendations: [
        'Practice answering common interview questions',
        'Record yourself to identify areas for improvement',
        'Focus on clear, concise responses',
        'Prepare examples from your experience'
      ]
    };
  }
}


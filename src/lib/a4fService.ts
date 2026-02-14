/**
 * A4F API Service
 * Handles communication with the backend A4F API for generating interview questions
 */

export interface A4FQuestionRequest {
  roles: string[];
  level: 'easy' | 'medium' | 'hard';
  interviewType: 'technical' | 'behavioural' | 'mix';
  questionTypes: string[];
  durationMin: number;
  inputMode: 'text' | 'voice' | 'text-voice';
  resumeText?: string;
  usedIds?: string[];
  userId?: string; // Optional user ID for A4F metadata tracking
}

export interface A4FQuestion {
  id: string;
  type: 'mcq' | 'qa' | 'code' | 'debugging';
  prompt: string;
  options?: string[];
  correctAnswer?: number | string;
  hint?: string;
  language?: string;
  codeSnippet?: string;
  skill: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  estimatedTime: number;
  rubricTarget: string;
  tests?: {
    visible?: Array<{ input: any; expected: any; description: string }>;
    hidden?: Array<{ input: any; expected: any }>;
  };
}

export interface A4FQuestionResponse {
  questions: A4FQuestion[];
  source: 'a4f';
  count: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Debug: Log the API base URL on module load
console.log('🔧 A4F Service initialized with API_BASE_URL:', API_BASE_URL);
console.log('🔧 VITE_API_BASE_URL from env:', import.meta.env.VITE_API_BASE_URL);

/**
 * Generate interview questions using A4F API
 */
export async function generateQuestionsA4F(
  config: A4FQuestionRequest
): Promise<A4FQuestionResponse> {
  try {
    const apiUrl = `${API_BASE_URL}/api/generate-questions-a4f`;
    console.log('📡 Calling A4F API at:', apiUrl);
    console.log('📋 Request config:', {
      roles: config.roles,
      level: config.level,
      interviewType: config.interviewType,
      questionTypes: config.questionTypes,
      durationMin: config.durationMin,
      inputMode: config.inputMode,
      usedIdsCount: config.usedIds?.length || 0,
    });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roles: config.roles,
        level: config.level,
        interviewType: config.interviewType,
        questionTypes: config.questionTypes,
        durationMin: config.durationMin,
        inputMode: config.inputMode,
        resumeText: config.resumeText || '',
        usedIds: config.usedIds || [],
        userId: config.userId, // Pass user ID for A4F metadata
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ A4F API error:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: A4FQuestionResponse = await response.json();
    console.log('✅ A4F API response received:', {
      questionCount: data.questions?.length || 0,
      source: data.source,
    });
    return data;
  } catch (error) {
    console.error('❌ Error generating questions with A4F:', error);
    
    // Provide more helpful error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Server not configured or not reachable. Please ensure the backend server is running on ${API_BASE_URL}`);
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to generate questions. Please try again.');
  }
}

/**
 * Check if A4F API is available
 */
export async function checkA4FHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('A4F API health check failed:', error);
    return false;
  }
}


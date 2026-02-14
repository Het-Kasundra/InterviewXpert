/**
 * AI Evaluation Service
 * Provides AI-powered evaluation and feedback for interview answers
 */

export interface AnswerEvaluation {
  score: number; // 0-100
  rubric: {
    clarity: number; // 0-10
    depth: number; // 0-10
    relevance: number; // 0-10
    structure: number; // 0-10
    communication: number; // 0-10
    accuracy: number; // 0-10
  };
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
}

export interface CodeEvaluation {
  score: number;
  correctness: number;
  efficiency: number;
  bestPractices: number;
  testResults: {
    passed: number;
    total: number;
  };
  feedback: string;
  improvements: string[];
}

export interface EvaluationRequest {
  answer: string;
  question: {
    prompt: string;
    type: 'mcq' | 'qa' | 'code' | 'debugging';
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    rubricTarget?: string;
  };
  code?: string;
  language?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Evaluate a text-based answer (Q&A, behavioral)
 */
export async function evaluateTextAnswer(
  request: EvaluationRequest
): Promise<AnswerEvaluation> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/evaluate-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answer: request.answer,
        question: request.question,
      }),
    });

    if (!response.ok) {
      throw new Error(`Evaluation failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error evaluating answer:', error);
    // Fallback to basic evaluation
    return generateBasicEvaluation(request);
  }
}

/**
 * Evaluate code submission
 */
export async function evaluateCodeSubmission(
  request: EvaluationRequest
): Promise<CodeEvaluation> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/evaluate-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: request.code,
        question: request.question,
        language: request.language || 'javascript',
      }),
    });

    if (!response.ok) {
      throw new Error(`Code evaluation failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error evaluating code:', error);
    // Fallback to basic evaluation
    return generateBasicCodeEvaluation(request);
  }
}

/**
 * Fallback: Basic evaluation without AI
 */
function generateBasicEvaluation(request: EvaluationRequest): AnswerEvaluation {
  const words = request.answer.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // Simple heuristic-based scoring
  const clarity = Math.min(10, Math.max(1, wordCount > 20 ? 8 : wordCount / 3));
  const depth = Math.min(10, Math.max(1, wordCount > 50 ? 9 : wordCount / 6));
  const relevance = 7; // Default
  const structure = request.answer.toLowerCase().includes('situation') || 
                   request.answer.toLowerCase().includes('task') ||
                   request.answer.toLowerCase().includes('action') ||
                   request.answer.toLowerCase().includes('result') ? 9 : 6;
  const communication = Math.min(10, Math.max(1, wordCount > 30 ? 8 : wordCount / 4));
  const accuracy = 7; // Default

  const avgScore = (clarity + depth + relevance + structure + communication + accuracy) / 6;
  const overallScore = Math.round((avgScore / 10) * 100);

  return {
    score: overallScore,
    rubric: { clarity, depth, relevance, structure, communication, accuracy },
    feedback: 'Basic evaluation completed. Enable AI evaluation for detailed feedback.',
    strengths: wordCount > 30 ? ['Good length', 'Detailed response'] : ['Response provided'],
    improvements: wordCount < 30 ? ['Provide more detail', 'Expand on your points'] : [],
    suggestions: ['Consider using the STAR method for behavioral questions'],
  };
}

/**
 * Fallback: Basic code evaluation without AI
 */
function generateBasicCodeEvaluation(request: EvaluationRequest): CodeEvaluation {
  const codeLength = request.code?.length || 0;
  const hasFunction = request.code?.includes('function') || request.code?.includes('=>');
  const hasReturn = request.code?.includes('return');
  
  const correctness = hasFunction && hasReturn ? 7 : 5;
  const efficiency = codeLength > 50 ? 7 : 5;
  const bestPractices = hasFunction ? 6 : 4;
  
  const avgScore = (correctness + efficiency + bestPractices) / 3;
  const overallScore = Math.round((avgScore / 10) * 100);

  return {
    score: overallScore,
    correctness,
    efficiency,
    bestPractices,
    testResults: {
      passed: 0,
      total: 0,
    },
    feedback: 'Basic code evaluation completed. Enable AI evaluation for detailed feedback.',
    improvements: ['Add error handling', 'Consider edge cases', 'Add comments for clarity'],
  };
}


/**
 * Real-time Transcription and Analysis Service
 * Handles speech-to-text transcription and real-time analysis
 */

export interface TranscriptionSegment {
  text: string;
  timestamp: number;
  confidence: number;
  isFinal: boolean;
}

export interface TranscriptionAnalysis {
  fillerWords: string[];
  fillerRate: number; // words per minute
  pauses: number;
  speakingRate: number; // words per minute
  clarity: number; // 0-10
  suggestions: string[];
}

export interface RealTimeAnalysis {
  segment: TranscriptionSegment;
  analysis: Partial<TranscriptionAnalysis>;
  feedback: string;
}

/**
 * Initialize Web Speech API recognition
 */
export function initializeSpeechRecognition(
  onResult: (text: string, isFinal: boolean) => void,
  onError: (error: string) => void
): SpeechRecognition | null {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    onError('Speech recognition not supported in this browser');
    return null;
  }

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

    if (finalTranscript) {
      onResult(finalTranscript.trim(), true);
    } else if (interimTranscript) {
      onResult(interimTranscript, false);
    }
  };

  recognition.onerror = (event: any) => {
    onError(event.error || 'Speech recognition error');
  };

  recognition.onend = () => {
    // Auto-restart if needed
  };

  return recognition;
}

/**
 * Analyze transcription for filler words, pauses, and clarity
 */
export function analyzeTranscription(
  text: string,
  duration: number // in seconds
): TranscriptionAnalysis {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // Common filler words
  const fillerWordPatterns = [
    /\b(um|uh|er|ah|like|you know|so|well|actually|basically|literally)\b/gi,
  ];
  
  const fillerWords: string[] = [];
  let fillerCount = 0;
  
  fillerWordPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      fillerCount += matches.length;
      fillerWords.push(...matches.map(m => m.toLowerCase()));
    }
  });

  const speakingRate = duration > 0 ? (wordCount / duration) * 60 : 0;
  const fillerRate = duration > 0 ? (fillerCount / duration) * 60 : 0;
  
  // Detect pauses (periods of silence or long gaps)
  const pausePattern = /\.{2,}|\s{3,}/g;
  const pauses = (text.match(pausePattern) || []).length;
  
  // Calculate clarity score (0-10)
  const clarityScore = Math.max(0, Math.min(10, 
    10 - (fillerRate / 2) - (pauses * 0.5) - (speakingRate < 100 ? 1 : 0)
  ));

  // Generate suggestions
  const suggestions: string[] = [];
  if (fillerRate > 5) {
    suggestions.push('Try to reduce filler words like "um" and "uh"');
  }
  if (speakingRate < 100) {
    suggestions.push('Speak at a moderate pace - not too fast, not too slow');
  }
  if (pauses > 3) {
    suggestions.push('Reduce long pauses - practice speaking more fluently');
  }
  if (wordCount < 20) {
    suggestions.push('Provide more detailed answers');
  }

  return {
    fillerWords: [...new Set(fillerWords)],
    fillerRate,
    pauses,
    speakingRate,
    clarity: Math.round(clarityScore * 10) / 10,
    suggestions,
  };
}

/**
 * Get real-time analysis feedback
 */
export function getRealTimeFeedback(
  analysis: TranscriptionAnalysis
): string {
  if (analysis.clarity >= 8) {
    return 'Great! You\'re speaking clearly and confidently.';
  } else if (analysis.clarity >= 6) {
    return 'Good job! Try to reduce filler words for even better clarity.';
  } else if (analysis.clarity >= 4) {
    return 'Keep practicing! Focus on speaking more fluently and reducing pauses.';
  } else {
    return 'Take your time. Slow down and think before you speak.';
  }
}

/**
 * Analyze answer quality in real-time
 */
export async function analyzeAnswerQuality(
  text: string,
  question: string
): Promise<{
  relevance: number;
  completeness: number;
  feedback: string;
}> {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    
    const response = await fetch(`${API_BASE_URL}/api/ai/evaluate-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answer: text,
        question: { prompt: question },
      }),
    });

    if (!response.ok) {
      throw new Error('Analysis failed');
    }

    const data = await response.json();
    return {
      relevance: data.rubric?.relevance || 7,
      completeness: data.rubric?.depth || 7,
      feedback: data.feedback || 'Keep going!',
    };
  } catch (error) {
    console.error('Error analyzing answer quality:', error);
    return {
      relevance: 7,
      completeness: 7,
      feedback: 'Continue your answer...',
    };
  }
}


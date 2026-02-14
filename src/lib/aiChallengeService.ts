/**
 * AI Challenge Generation Service
 * Provides AI-powered challenge creation and difficulty adaptation
 */

export interface ChallengeSuggestion {
  id: string;
  title: string;
  description: string;
  domain: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
  topics: string[];
  skills: string[];
  whyRelevant: string;
  questions: Array<{
    type: 'mcq' | 'qa' | 'code' | 'debugging';
    prompt: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
}

export interface ChallengeGenerationRequest {
  domain?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  userPerformance?: {
    avgScore: number;
    weakAreas: string[];
    strongAreas: string[];
  };
  trendingTopics?: string[];
  targetSkills?: string[];
}

export interface DifficultyAdaptation {
  currentDifficulty: 'easy' | 'medium' | 'hard';
  recommendedDifficulty: 'easy' | 'medium' | 'hard';
  reason: string;
  confidence: number; // 0-1
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Generate AI-powered challenge
 */
export async function generateChallenge(
  request: ChallengeGenerationRequest
): Promise<ChallengeSuggestion> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/generate-challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate challenge: ${response.status}`);
    }

    const data = await response.json();
    return data.challenge || generateDefaultChallenge(request);
  } catch (error) {
    console.error('Error generating challenge:', error);
    return generateDefaultChallenge(request);
  }
}

/**
 * Adapt challenge difficulty based on user performance
 */
export async function adaptChallengeDifficulty(
  userPerformance: {
    avgScore: number;
    recentScores: number[];
    weakAreas: string[];
    strongAreas: string[];
  },
  currentDifficulty: 'easy' | 'medium' | 'hard'
): Promise<DifficultyAdaptation> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/adapt-difficulty`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userPerformance,
        currentDifficulty,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to adapt difficulty: ${response.status}`);
    }

    const data = await response.json();
    return data.adaptation || generateDefaultAdaptation(userPerformance, currentDifficulty);
  } catch (error) {
    console.error('Error adapting difficulty:', error);
    return generateDefaultAdaptation(userPerformance, currentDifficulty);
  }
}

/**
 * Get domain-specific challenge suggestions
 */
export async function getDomainChallenges(
  domain: string,
  count: number = 3
): Promise<ChallengeSuggestion[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/domain-challenges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain,
        count,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get domain challenges: ${response.status}`);
    }

    const data = await response.json();
    return data.challenges || generateDefaultDomainChallenges(domain, count);
  } catch (error) {
    console.error('Error getting domain challenges:', error);
    return generateDefaultDomainChallenges(domain, count);
  }
}

/**
 * Analyze challenge performance and provide insights
 */
export async function analyzeChallengePerformance(
  challengeId: string,
  attempts: Array<{
    score: number;
    timeSpent: number;
    completedAt: string;
  }>
): Promise<{
  avgScore: number;
  avgTime: number;
  improvement: number;
  recommendations: string[];
  nextDifficulty: 'easy' | 'medium' | 'hard';
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/analyze-challenge-performance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challengeId,
        attempts,
      }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`);
    }

    const data = await response.json();
    return data.analysis || generateDefaultAnalysis(attempts);
  } catch (error) {
    console.error('Error analyzing challenge performance:', error);
    return generateDefaultAnalysis(attempts);
  }
}

/**
 * Default challenge fallback
 */
function generateDefaultChallenge(request: ChallengeGenerationRequest): ChallengeSuggestion {
  const domain = request.domain || 'Web Development';
  const difficulty = request.difficulty || 'medium';

  return {
    id: `challenge-${Date.now()}`,
    title: `${domain} Challenge`,
    description: `Test your ${domain} skills with this ${difficulty} challenge`,
    domain,
    difficulty,
    estimatedTime: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 30 : 45,
    topics: [domain, 'Problem Solving', 'Best Practices'],
    skills: request.targetSkills || [domain],
    whyRelevant: `This challenge helps you practice essential ${domain} concepts`,
    questions: [
      {
        type: 'qa',
        prompt: `Explain a key concept in ${domain}`,
        difficulty,
      },
    ],
  };
}

/**
 * Default difficulty adaptation fallback
 */
function generateDefaultAdaptation(
  userPerformance: {
    avgScore: number;
    recentScores: number[];
    weakAreas: string[];
    strongAreas: string[];
  },
  currentDifficulty: 'easy' | 'medium' | 'hard'
): DifficultyAdaptation {
  const avgScore = userPerformance.avgScore || 50;
  let recommendedDifficulty: 'easy' | 'medium' | 'hard' = currentDifficulty;
  let reason = '';

  if (avgScore >= 80 && currentDifficulty !== 'hard') {
    recommendedDifficulty = currentDifficulty === 'easy' ? 'medium' : 'hard';
    reason = 'Your high scores suggest you\'re ready for more challenging problems';
  } else if (avgScore < 50 && currentDifficulty !== 'easy') {
    recommendedDifficulty = currentDifficulty === 'hard' ? 'medium' : 'easy';
    reason = 'Consider practicing with easier challenges to build confidence';
  } else {
    reason = 'Current difficulty level seems appropriate for your performance';
  }

  return {
    currentDifficulty,
    recommendedDifficulty,
    reason,
    confidence: 0.7,
  };
}

/**
 * Default domain challenges fallback
 */
function generateDefaultDomainChallenges(domain: string, count: number): ChallengeSuggestion[] {
  const challenges: ChallengeSuggestion[] = [];

  for (let i = 0; i < count; i++) {
    challenges.push({
      id: `challenge-${domain}-${i + 1}`,
      title: `${domain} Challenge ${i + 1}`,
      description: `Practice ${domain} skills with this challenge`,
      domain,
      difficulty: i === 0 ? 'easy' : i === 1 ? 'medium' : 'hard',
      estimatedTime: (i + 1) * 15,
      topics: [domain],
      skills: [domain],
      whyRelevant: `Essential ${domain} practice`,
      questions: [],
    });
  }

  return challenges;
}

/**
 * Default performance analysis fallback
 */
function generateDefaultAnalysis(
  attempts: Array<{
    score: number;
    timeSpent: number;
    completedAt: string;
  }>
): {
  avgScore: number;
  avgTime: number;
  improvement: number;
  recommendations: string[];
  nextDifficulty: 'easy' | 'medium' | 'hard';
} {
  if (attempts.length === 0) {
    return {
      avgScore: 0,
      avgTime: 0,
      improvement: 0,
      recommendations: ['Complete more attempts to get insights'],
      nextDifficulty: 'medium',
    };
  }

  const scores = attempts.map(a => a.score);
  const times = attempts.map(a => a.timeSpent);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

  const improvement = attempts.length > 1
    ? ((scores[0] - scores[scores.length - 1]) / scores[scores.length - 1]) * 100
    : 0;

  const recommendations: string[] = [];
  if (avgScore < 60) {
    recommendations.push('Focus on fundamental concepts');
  }
  if (avgTime > 30) {
    recommendations.push('Practice time management');
  }

  let nextDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (avgScore >= 80) {
    nextDifficulty = 'hard';
  } else if (avgScore < 50) {
    nextDifficulty = 'easy';
  }

  return {
    avgScore,
    avgTime,
    improvement,
    recommendations: recommendations.length > 0 ? recommendations : ['Keep practicing!'],
    nextDifficulty,
  };
}


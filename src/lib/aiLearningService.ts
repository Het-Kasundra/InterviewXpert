/**
 * AI Learning Path Service
 * Provides personalized learning paths based on performance data
 */

export interface LearningPath {
  id: string;
  userId: string;
  targetRole: string;
  estimatedDuration: number; // days
  modules: LearningModule[];
  currentModule: number;
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  topics: string[];
  estimatedTime: number; // hours
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
  completed: boolean;
  resources: LearningResource[];
}

export interface LearningResource {
  type: 'article' | 'video' | 'practice' | 'quiz';
  title: string;
  url?: string;
  description: string;
}

export interface PerformanceData {
  userId: string;
  weakAreas: string[];
  strongAreas: string[];
  recentScores: number[];
  interviewHistory: {
    role: string;
    score: number;
    date: string;
  }[];
}

export interface LearningPathRequest {
  userId: string;
  targetRole: string;
  performanceData: PerformanceData;
  availableHoursPerWeek?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Generate personalized learning path
 */
export async function generateLearningPath(
  request: LearningPathRequest
): Promise<LearningPath> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/learning-path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Learning path generation failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating learning path:', error);
    // Fallback to basic learning path
    return generateBasicLearningPath(request);
  }
}

/**
 * Get topic recommendations based on weak areas
 */
export async function recommendTopics(
  weakAreas: string[],
  targetRole: string
): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/recommend-topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        weakAreas,
        targetRole,
      }),
    });

    if (!response.ok) {
      throw new Error(`Topic recommendation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.topics || [];
  } catch (error) {
    console.error('Error getting topic recommendations:', error);
    return weakAreas; // Return weak areas as topics to focus on
  }
}

/**
 * Adjust difficulty based on performance
 */
export function adjustDifficulty(
  currentLevel: 'easy' | 'medium' | 'hard',
  recentScores: number[]
): 'easy' | 'medium' | 'hard' {
  if (recentScores.length === 0) return currentLevel;
  
  const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  
  if (avgScore >= 80 && currentLevel !== 'hard') {
    return currentLevel === 'easy' ? 'medium' : 'hard';
  } else if (avgScore < 50 && currentLevel !== 'easy') {
    return currentLevel === 'hard' ? 'medium' : 'easy';
  }
  
  return currentLevel;
}

/**
 * Fallback: Basic learning path without AI
 */
function generateBasicLearningPath(
  request: LearningPathRequest
): LearningPath {
  const { targetRole, performanceData, availableHoursPerWeek = 10 } = request;
  
  // Create basic modules based on weak areas
  const modules: LearningModule[] = performanceData.weakAreas.slice(0, 5).map((area, index) => ({
    id: `module-${index + 1}`,
    title: `Master ${area}`,
    description: `Focus on improving your ${area} skills`,
    topics: [area, `${area} fundamentals`, `${area} best practices`],
    estimatedTime: 5,
    difficulty: 'medium' as const,
    order: index + 1,
    completed: false,
    resources: [
      {
        type: 'article' as const,
        title: `${area} Guide`,
        description: `Learn the fundamentals of ${area}`,
      },
      {
        type: 'practice' as const,
        title: `${area} Practice Questions`,
        description: `Practice ${area} interview questions`,
      },
    ],
  }));

  // Add role-specific modules if no weak areas
  if (modules.length === 0) {
    modules.push({
      id: 'module-1',
      title: `${targetRole} Fundamentals`,
      description: `Core concepts for ${targetRole}`,
      topics: ['Core concepts', 'Best practices', 'Common patterns'],
      estimatedTime: 5,
      difficulty: 'medium' as const,
      order: 1,
      completed: false,
      resources: [
        {
          type: 'article' as const,
          title: `${targetRole} Overview`,
          description: 'Introduction to key concepts',
        },
      ],
    });
  }

  const totalHours = modules.reduce((sum, m) => sum + m.estimatedTime, 0);
  const estimatedDuration = Math.ceil(totalHours / availableHoursPerWeek);

  return {
    id: `path-${Date.now()}`,
    userId: request.userId,
    targetRole,
    estimatedDuration,
    modules,
    currentModule: 0,
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}


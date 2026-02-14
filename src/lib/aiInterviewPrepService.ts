/**
 * AI Interview Preparation Assistant Service
 * Provides personalized interview preparation guidance and tips
 */

export interface PrepTip {
  id: string;
  category: 'technical' | 'behavioral' | 'general' | 'role-specific';
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

export interface PrepPlan {
  id: string;
  targetRole: string;
  duration: number; // days
  modules: PrepModule[];
  estimatedHours: number;
  createdAt: string;
}

export interface PrepModule {
  id: string;
  title: string;
  description: string;
  topics: string[];
  estimatedTime: number; // hours
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
  resources: PrepResource[];
}

export interface PrepResource {
  type: 'article' | 'video' | 'practice' | 'quiz';
  title: string;
  description: string;
  url?: string;
}

export interface PrepRequest {
  targetRole: string;
  currentSkills: string[];
  experienceLevel: 'junior' | 'mid' | 'senior';
  availableHoursPerWeek: number;
  interviewType?: 'technical' | 'behavioral' | 'mix';
  weakAreas?: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Get personalized interview preparation tips
 */
export async function getPrepTips(
  targetRole: string,
  interviewType: 'technical' | 'behavioral' | 'mix' = 'mix'
): Promise<PrepTip[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/prep-tips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetRole,
        interviewType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get prep tips: ${response.status}`);
    }

    const data = await response.json();
    return data.tips || [];
  } catch (error) {
    console.error('Error getting prep tips:', error);
    return getDefaultPrepTips(targetRole, interviewType);
  }
}

/**
 * Generate personalized preparation plan
 */
export async function generatePrepPlan(
  request: PrepRequest
): Promise<PrepPlan> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/learning-path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'current-user', // Will be replaced with actual user ID
        targetRole: request.targetRole,
        performanceData: {
          weakAreas: request.weakAreas || [],
          strongAreas: request.currentSkills,
          recentScores: [],
        },
        availableHoursPerWeek: request.availableHoursPerWeek,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate prep plan: ${response.status}`);
    }

    const data = await response.json();
    return {
      id: data.id || `plan-${Date.now()}`,
      targetRole: data.targetRole || request.targetRole,
      duration: data.estimatedDuration || 14,
      modules: data.modules || [],
      estimatedHours: data.modules?.reduce((sum: number, m: any) => sum + (m.estimatedTime || 0), 0) || 0,
      createdAt: data.createdAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating prep plan:', error);
    return generateDefaultPrepPlan(request);
  }
}

/**
 * Get practice questions for a specific topic
 */
export async function getPracticeQuestions(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  count: number = 5
): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-questions-a4f`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roles: [topic],
        level: difficulty,
        interviewType: 'technical',
        questionTypes: ['qa', 'mcq'],
        durationMin: count * 3,
        inputMode: 'text',
        usedIds: [],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get practice questions: ${response.status}`);
    }

    const data = await response.json();
    return data.questions || [];
  } catch (error) {
    console.error('Error getting practice questions:', error);
    return [];
  }
}

/**
 * Default prep tips fallback
 */
function getDefaultPrepTips(
  targetRole: string,
  interviewType: 'technical' | 'behavioral' | 'mix'
): PrepTip[] {
  const tips: PrepTip[] = [
    {
      id: 'tip-1',
      category: 'general',
      title: 'Research the Company',
      content: `Research ${targetRole} roles at the company. Understand their tech stack, culture, and recent projects.`,
      priority: 'high',
      tags: ['research', 'preparation'],
    },
    {
      id: 'tip-2',
      category: 'technical',
      title: 'Review Core Concepts',
      content: 'Review fundamental concepts related to your role. Be ready to explain your thought process.',
      priority: 'high',
      tags: ['technical', 'fundamentals'],
    },
    {
      id: 'tip-3',
      category: 'behavioral',
      title: 'Prepare STAR Stories',
      content: 'Prepare 3-5 stories using the STAR method (Situation, Task, Action, Result) for common behavioral questions.',
      priority: 'high',
      tags: ['behavioral', 'star'],
    },
  ];

  if (interviewType === 'technical' || interviewType === 'mix') {
    tips.push({
      id: 'tip-4',
      category: 'technical',
      title: 'Practice Coding',
      content: 'Practice coding problems daily. Focus on data structures, algorithms, and problem-solving patterns.',
      priority: 'high',
      tags: ['coding', 'practice'],
    });
  }

  return tips;
}

/**
 * Default prep plan fallback
 */
function generateDefaultPrepPlan(request: PrepRequest): PrepPlan {
  const modules: PrepModule[] = [
    {
      id: 'module-1',
      title: `${request.targetRole} Fundamentals`,
      description: `Core concepts and fundamentals for ${request.targetRole}`,
      topics: ['Core concepts', 'Best practices', 'Common patterns'],
      estimatedTime: 5,
      difficulty: 'medium',
      order: 1,
      resources: [
        {
          type: 'article',
          title: `${request.targetRole} Overview`,
          description: 'Introduction to key concepts',
        },
      ],
    },
  ];

  if (request.weakAreas && request.weakAreas.length > 0) {
    request.weakAreas.slice(0, 3).forEach((area, index) => {
      modules.push({
        id: `module-${index + 2}`,
        title: `Master ${area}`,
        description: `Focus on improving your ${area} skills`,
        topics: [area, `${area} fundamentals`, `${area} best practices`],
        estimatedTime: 5,
        difficulty: 'medium',
        order: index + 2,
        resources: [
          {
            type: 'practice',
            title: `${area} Practice Questions`,
            description: `Practice ${area} interview questions`,
          },
        ],
      });
    });
  }

  const totalHours = modules.reduce((sum, m) => sum + m.estimatedTime, 0);
  const duration = Math.ceil(totalHours / request.availableHoursPerWeek);

  return {
    id: `plan-${Date.now()}`,
    targetRole: request.targetRole,
    duration,
    modules,
    estimatedHours: totalHours,
    createdAt: new Date().toISOString(),
  };
}


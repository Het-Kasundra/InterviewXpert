/**
 * AI Analytics and Insights Service
 * Provides AI-powered analytics and insights for user performance
 */

export interface PerformanceTrend {
  period: string;
  score: number;
  category: string;
}

export interface WeaknessAnalysis {
  area: string;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
  recommendations: string[];
}

export interface PredictiveInsight {
  type: 'success_probability' | 'readiness' | 'improvement_area';
  value: number; // 0-100
  description: string;
  confidence: number; // 0-1
  actionableSteps: string[];
}

export interface AnalyticsInsight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'weakness' | 'strength' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  data: any;
  actionableSteps?: string[];
}

export interface AnalyticsRequest {
  userId: string;
  interviews: Array<{
    id: string;
    role: string;
    overall_score: number;
    started_at: string;
    difficulty: string;
    skills: string[];
  }>;
  skills: Array<{
    id: string;
    domain: string;
    overall_score: number;
    started_at: string;
    level: string;
  }>;
  timeRange?: 'week' | 'month' | 'quarter' | 'all';
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Get AI-powered analytics insights
 */
export async function getAnalyticsInsights(
  request: AnalyticsRequest
): Promise<AnalyticsInsight[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/analytics-insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to get insights: ${response.status}`);
    }

    const data = await response.json();
    return data.insights || [];
  } catch (error) {
    console.error('Error getting analytics insights:', error);
    return generateDefaultInsights(request);
  }
}

/**
 * Predict interview success probability
 */
export async function predictSuccessProbability(
  userId: string,
  targetRole: string,
  recentPerformance: number[]
): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/predict-success`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        targetRole,
        recentPerformance,
      }),
    });

    if (!response.ok) {
      throw new Error(`Prediction failed: ${response.status}`);
    }

    const data = await response.json();
    return data.probability || 50;
  } catch (error) {
    console.error('Error predicting success:', error);
    // Simple heuristic fallback
    const avgScore = recentPerformance.length > 0
      ? recentPerformance.reduce((a, b) => a + b, 0) / recentPerformance.length
      : 50;
    return Math.min(95, Math.max(20, avgScore));
  }
}

/**
 * Identify weaknesses from performance data
 */
export async function identifyWeaknesses(
  interviews: AnalyticsRequest['interviews'],
  skills: AnalyticsRequest['skills']
): Promise<WeaknessAnalysis[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/identify-weaknesses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interviews,
        skills,
      }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`);
    }

    const data = await response.json();
    return data.weaknesses || [];
  } catch (error) {
    console.error('Error identifying weaknesses:', error);
    return generateDefaultWeaknesses(interviews, skills);
  }
}

/**
 * Get performance trends
 */
export function analyzePerformanceTrends(
  interviews: AnalyticsRequest['interviews'],
  timeRange: 'week' | 'month' | 'quarter' | 'all' = 'month'
): PerformanceTrend[] {
  const now = new Date();
  let cutoffDate: Date;

  switch (timeRange) {
    case 'week':
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'quarter':
      cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      cutoffDate = new Date(0);
  }

  const filtered = interviews.filter(i => new Date(i.started_at) >= cutoffDate);
  
  // Group by week/month
  const grouped = new Map<string, number[]>();
  
  filtered.forEach(interview => {
    const date = new Date(interview.started_at);
    const key = timeRange === 'week' 
      ? `${date.getFullYear()}-W${getWeekNumber(date)}`
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(interview.overall_score || 0);
  });

  const trends: PerformanceTrend[] = [];
  grouped.forEach((scores, period) => {
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    trends.push({
      period,
      score: Math.round(avgScore),
      category: 'overall',
    });
  });

  return trends.sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Default insights fallback
 */
function generateDefaultInsights(request: AnalyticsRequest): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];

  const interviewScores = request.interviews
    .map(i => i.overall_score || 0)
    .filter(s => s > 0);

  if (interviewScores.length > 0) {
    const avgScore = interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length;
    const latestScore = interviewScores[0];
    const improvement = latestScore - avgScore;

    if (improvement > 5) {
      insights.push({
        id: 'insight-1',
        title: 'Improving Performance',
        description: `Your recent scores show improvement. Keep up the great work!`,
        type: 'trend',
        priority: 'high',
        data: { improvement, latestScore, avgScore },
        actionableSteps: ['Continue practicing', 'Focus on weak areas'],
      });
    }

    if (avgScore < 60) {
      insights.push({
        id: 'insight-2',
        title: 'Focus on Fundamentals',
        description: 'Consider reviewing core concepts and practicing more.',
        type: 'recommendation',
        priority: 'high',
        data: { avgScore },
        actionableSteps: [
          'Review basic concepts',
          'Practice more frequently',
          'Focus on one area at a time',
        ],
      });
    }
  }

  return insights;
}

/**
 * Default weaknesses fallback
 */
function generateDefaultWeaknesses(
  interviews: AnalyticsRequest['interviews'],
  skills: AnalyticsRequest['skills']
): WeaknessAnalysis[] {
  const weaknesses: WeaknessAnalysis[] = [];

  // Analyze low-scoring interviews
  const lowScores = interviews.filter(i => (i.overall_score || 0) < 60);
  
  if (lowScores.length > 0) {
    const allSkills = lowScores.flatMap(i => i.skills || []);
    const skillCounts = new Map<string, number>();
    
    allSkills.forEach(skill => {
      skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
    });

    const topWeakness = Array.from(skillCounts.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (topWeakness) {
      weaknesses.push({
        area: topWeakness[0],
        frequency: topWeakness[1],
        impact: 'high',
        recommendations: [
          `Focus on ${topWeakness[0]} practice`,
          'Review related concepts',
          'Take targeted practice sessions',
        ],
      });
    }
  }

  return weaknesses;
}

/**
 * Helper: Get week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}


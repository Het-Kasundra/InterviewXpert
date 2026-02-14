/**
 * AI Smart Scheduling Assistant Service
 * Provides intelligent scheduling suggestions and study planning
 */

export interface TimeSlot {
  startTime: string; // ISO string
  endTime: string; // ISO string
  score: number; // 0-100, how optimal this time is
  reason: string;
  type: 'optimal' | 'good' | 'acceptable';
}

export interface StudyPlan {
  id: string;
  duration: number; // days
  sessions: StudySession[];
  totalHours: number;
  goals: string[];
  createdAt: string;
}

export interface StudySession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  focus: string;
  topics: string[];
  type: 'interview' | 'practice' | 'review' | 'assessment';
  priority: 'high' | 'medium' | 'low';
}

export interface SchedulingRequest {
  userId: string;
  availableHoursPerWeek: number;
  preferredTimes?: string[]; // e.g., ['morning', 'evening']
  goals?: string[];
  upcomingInterviews?: Array<{
    date: string;
    type: string;
    role: string;
  }>;
  performanceData?: {
    weakAreas: string[];
    strongAreas: string[];
    recentScores: number[];
  };
}

export interface OptimalTimeSuggestion {
  date: string;
  timeSlots: TimeSlot[];
  reason: string;
  confidence: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Suggest optimal times for practice based on performance data
 */
export async function suggestOptimalTimes(
  request: SchedulingRequest
): Promise<OptimalTimeSuggestion[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/suggest-optimal-times`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to suggest times: ${response.status}`);
    }

    const data = await response.json();
    return data.suggestions || generateDefaultTimeSuggestions(request);
  } catch (error) {
    console.error('Error suggesting optimal times:', error);
    return generateDefaultTimeSuggestions(request);
  }
}

/**
 * Generate personalized study plan
 */
export async function generateStudyPlan(
  request: SchedulingRequest
): Promise<StudyPlan> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/generate-study-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate study plan: ${response.status}`);
    }

    const data = await response.json();
    return data.plan || generateDefaultStudyPlan(request);
  } catch (error) {
    console.error('Error generating study plan:', error);
    return generateDefaultStudyPlan(request);
  }
}

/**
 * Get smart reminders based on learning patterns
 */
export async function getSmartReminders(
  userId: string,
  upcomingSessions: Array<{
    date: string;
    type: string;
    title: string;
  }>
): Promise<Array<{
  id: string;
  type: 'practice' | 'review' | 'preparation' | 'assessment';
  message: string;
  scheduledFor: string;
  priority: 'high' | 'medium' | 'low';
}>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/smart-reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        upcomingSessions,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get reminders: ${response.status}`);
    }

    const data = await response.json();
    return data.reminders || generateDefaultReminders(upcomingSessions);
  } catch (error) {
    console.error('Error getting smart reminders:', error);
    return generateDefaultReminders(upcomingSessions);
  }
}

/**
 * Analyze schedule conflicts and suggest alternatives
 */
export function analyzeScheduleConflicts(
  scheduledItems: Array<{
    date: string;
    time: string;
    duration: number;
    title: string;
  }>
): {
  conflicts: Array<{
    item1: string;
    item2: string;
    reason: string;
  }>;
  suggestions: string[];
} {
  const conflicts: Array<{
    item1: string;
    item2: string;
    reason: string;
  }> = [];
  const suggestions: string[] = [];

  // Check for overlapping times
  for (let i = 0; i < scheduledItems.length; i++) {
    for (let j = i + 1; j < scheduledItems.length; j++) {
      const item1 = scheduledItems[i];
      const item2 = scheduledItems[j];

      if (item1.date === item2.date) {
        const time1 = new Date(`${item1.date}T${item1.time}`);
        const time2 = new Date(`${item2.date}T${item2.time}`);
        const end1 = new Date(time1.getTime() + item1.duration * 60000);
        const end2 = new Date(time2.getTime() + item2.duration * 60000);

        if (
          (time1 >= time2 && time1 < end2) ||
          (time2 >= time1 && time2 < end1)
        ) {
          conflicts.push({
            item1: item1.title,
            item2: item2.title,
            reason: 'Time overlap detected',
          });
          suggestions.push(
            `Consider rescheduling "${item2.title}" to avoid conflict with "${item1.title}"`
          );
        }
      }
    }
  }

  return { conflicts, suggestions };
}

/**
 * Default time suggestions fallback
 */
function generateDefaultTimeSuggestions(
  request: SchedulingRequest
): OptimalTimeSuggestion[] {
  const suggestions: OptimalTimeSuggestion[] = [];
  const now = new Date();

  // Generate suggestions for next 7 days
  for (let i = 1; i <= 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Create separate date objects for each time slot to avoid mutation
    const morningStart = new Date(date);
    morningStart.setHours(9, 0, 0, 0);
    const morningEnd = new Date(date);
    morningEnd.setHours(10, 30, 0, 0);

    const eveningStart = new Date(date);
    eveningStart.setHours(18, 0, 0, 0);
    const eveningEnd = new Date(date);
    eveningEnd.setHours(19, 30, 0, 0);

    const timeSlots: TimeSlot[] = [
      {
        startTime: morningStart.toISOString(),
        endTime: morningEnd.toISOString(),
        score: 85,
        reason: 'Morning sessions show better retention',
        type: 'optimal',
      },
      {
        startTime: eveningStart.toISOString(),
        endTime: eveningEnd.toISOString(),
        score: 75,
        reason: 'Evening practice time',
        type: 'good',
      },
    ];

    suggestions.push({
      date: dateStr,
      timeSlots,
      reason: i === 1 ? 'Starting the week with a consistent practice routine' :
        i === 2 ? 'Building on the momentum from Monday\'s practice' :
          i === 3 ? 'Mid-week practice to reinforce learning and address any new areas of improvement' :
            'Continuing your structured practice schedule',
      confidence: 0.7 + (i % 3) * 0.1,
    });
  }

  return suggestions.slice(0, 5);
}

/**
 * Default study plan fallback
 */
function generateDefaultStudyPlan(request: SchedulingRequest): StudyPlan {
  const sessions: StudySession[] = [];
  const hoursPerWeek = request.availableHoursPerWeek || 10;
  const sessionsPerWeek = Math.floor(hoursPerWeek / 1.5); // 1.5 hour sessions

  const now = new Date();
  for (let i = 0; i < sessionsPerWeek * 2; i++) {
    const sessionDate = new Date(now);
    sessionDate.setDate(sessionDate.getDate() + Math.floor(i / sessionsPerWeek) * 7 + (i % sessionsPerWeek));

    sessions.push({
      id: `session-${i + 1}`,
      date: sessionDate.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:30',
      duration: 90,
      focus: request.performanceData?.weakAreas?.[0] || 'General Practice',
      topics: request.performanceData?.weakAreas || ['Fundamentals'],
      type: i % 3 === 0 ? 'interview' : i % 3 === 1 ? 'practice' : 'review',
      priority: i < sessionsPerWeek ? 'high' : 'medium',
    });
  }

  return {
    id: `plan-${Date.now()}`,
    duration: 14,
    sessions,
    totalHours: hoursPerWeek * 2,
    goals: request.goals || ['Improve interview skills', 'Build confidence'],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Default reminders fallback
 */
function generateDefaultReminders(
  upcomingSessions: Array<{
    date: string;
    type: string;
    title: string;
  }>
): Array<{
  id: string;
  type: 'practice' | 'review' | 'preparation' | 'assessment';
  message: string;
  scheduledFor: string;
  priority: 'high' | 'medium' | 'low';
}> {
  const reminders: Array<{
    id: string;
    type: 'practice' | 'review' | 'preparation' | 'assessment';
    message: string;
    scheduledFor: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  upcomingSessions.forEach((session, index) => {
    const sessionDate = new Date(session.date);
    const reminderDate = new Date(sessionDate);
    reminderDate.setDate(reminderDate.getDate() - 1); // Remind 1 day before

    reminders.push({
      id: `reminder-${index + 1}`,
      type: 'preparation',
      message: `Don't forget: ${session.title} is tomorrow`,
      scheduledFor: reminderDate.toISOString(),
      priority: 'high',
    });
  });

  return reminders;
}


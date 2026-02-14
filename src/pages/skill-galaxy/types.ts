export interface SkillNode {
  id: string;
  name: string;
  category: 'Technical' | 'Soft Skills' | 'Additional Skills' | 'Achievements' | 'Learning';
  score: number;
  xp: number;
  improvement: number;
  streakDays: number;
  rubric: {
    clarity: number;
    depth?: number;
    relevance?: number;
    structure: number;
    communication: number;
    accuracy: number;
  };
  lastUpdated: Date;
  sessions: any[];
  position: { x: number; y: number; z: number };
}

export type LayoutType = 'force-directed' | 'cluster' | 'layered';

export interface FilterState {
  domains: string[];
  levels: string[];
  scoreRange: [number, number];
  recency: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedAt?: Date;
}
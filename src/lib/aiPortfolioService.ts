/**
 * AI Portfolio Project Suggestions Service
 * Provides AI-powered project suggestions based on user profile
 */

export interface ProjectSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string; // e.g., "2-3 weeks"
  learningOutcomes: string[];
  whyRelevant: string;
  resources: {
    type: 'tutorial' | 'documentation' | 'example';
    title: string;
    url?: string;
  }[];
}

export interface PortfolioAnalysis {
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  nextProjects: ProjectSuggestion[];
}

export interface ProjectSuggestionRequest {
  currentSkills: string[];
  targetRole: string;
  experienceLevel: 'junior' | 'mid' | 'senior';
  existingProjects?: string[]; // project titles/categories
  interests?: string[];
  timeAvailable?: 'low' | 'medium' | 'high';
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Get personalized project suggestions
 */
export async function getProjectSuggestions(
  request: ProjectSuggestionRequest
): Promise<ProjectSuggestion[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/portfolio-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to get suggestions: ${response.status}`);
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('Error getting project suggestions:', error);
    return generateDefaultSuggestions(request);
  }
}

/**
 * Analyze portfolio and provide recommendations
 */
export async function analyzePortfolio(
  projects: Array<{ title: string; tech_stack: string[]; category: string }>,
  targetRole: string,
  currentSkills: string[]
): Promise<PortfolioAnalysis> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/portfolio-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projects,
        targetRole,
        currentSkills,
      }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing portfolio:', error);
    return generateDefaultAnalysis(projects, targetRole, currentSkills);
  }
}

/**
 * Default suggestions fallback
 */
function generateDefaultSuggestions(
  request: ProjectSuggestionRequest
): ProjectSuggestion[] {
  const suggestions: ProjectSuggestion[] = [];

  // Role-based suggestions
  if (request.targetRole.toLowerCase().includes('web') || 
      request.targetRole.toLowerCase().includes('frontend')) {
    suggestions.push({
      id: 'suggestion-1',
      title: 'E-Commerce Platform',
      description: 'Build a full-featured e-commerce platform with product catalog, cart, checkout, and payment integration.',
      category: 'Web Development',
      techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      difficulty: 'intermediate',
      estimatedTime: '3-4 weeks',
      learningOutcomes: [
        'Full-stack development',
        'Payment integration',
        'Database design',
        'State management',
      ],
      whyRelevant: 'Demonstrates real-world application development and business logic',
      resources: [
        {
          type: 'tutorial',
          title: 'React E-Commerce Tutorial',
        },
      ],
    });
  }

  if (request.targetRole.toLowerCase().includes('full stack') ||
      request.targetRole.toLowerCase().includes('backend')) {
    suggestions.push({
      id: 'suggestion-2',
      title: 'RESTful API with Authentication',
      description: 'Create a secure REST API with JWT authentication, role-based access control, and comprehensive testing.',
      category: 'Backend Development',
      techStack: ['Node.js', 'Express', 'PostgreSQL', 'JWT'],
      difficulty: 'intermediate',
      estimatedTime: '2-3 weeks',
      learningOutcomes: [
        'API design',
        'Authentication & authorization',
        'Database security',
        'Testing strategies',
      ],
      whyRelevant: 'Essential backend skills for any full-stack role',
      resources: [
        {
          type: 'documentation',
          title: 'Express.js Security Best Practices',
        },
      ],
    });
  }

  // Add more generic suggestions
  suggestions.push({
    id: 'suggestion-3',
    title: 'Task Management App',
    description: 'Build a collaborative task management application with real-time updates, drag-and-drop, and team features.',
    category: 'Full Stack',
    techStack: ['React', 'TypeScript', 'Node.js', 'WebSocket'],
    difficulty: 'advanced',
    estimatedTime: '4-5 weeks',
    learningOutcomes: [
      'Real-time communication',
      'Complex state management',
      'Team collaboration features',
    ],
    whyRelevant: 'Shows ability to build complex, interactive applications',
    resources: [
      {
        type: 'example',
        title: 'Real-time App Patterns',
      },
    ],
  });

  return suggestions.slice(0, 5);
}

/**
 * Default analysis fallback
 */
function generateDefaultAnalysis(
  projects: Array<{ title: string; tech_stack: string[]; category: string }>,
  targetRole: string,
  currentSkills: string[]
): PortfolioAnalysis {
  const allTech = projects.flatMap(p => p.tech_stack || []);
  const uniqueTech = [...new Set(allTech)];

  const strengths = uniqueTech.length > 0 
    ? [`Strong in ${uniqueTech.slice(0, 3).join(', ')}`]
    : ['Good project diversity'];

  const gaps: string[] = [];
  if (targetRole.toLowerCase().includes('full stack') && !uniqueTech.includes('Node.js')) {
    gaps.push('Backend technologies');
  }
  if (!uniqueTech.some(tech => ['React', 'Vue', 'Angular'].includes(tech))) {
    gaps.push('Modern frontend frameworks');
  }

  const recommendations: string[] = [];
  if (projects.length < 3) {
    recommendations.push('Add more projects to showcase your skills');
  }
  if (gaps.length > 0) {
    recommendations.push(`Consider projects using: ${gaps.join(', ')}`);
  }

  return {
    strengths,
    gaps,
    recommendations,
    nextProjects: generateDefaultSuggestions({
      currentSkills,
      targetRole,
      experienceLevel: 'mid',
      existingProjects: projects.map(p => p.title),
    }),
  };
}


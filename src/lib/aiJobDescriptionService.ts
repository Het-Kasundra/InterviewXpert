/**
 * AI Job Description Analysis Service
 * Analyzes job descriptions and provides matching insights
 */

export interface ParsedJobDescription {
  title: string;
  company?: string;
  location?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: 'junior' | 'mid' | 'senior' | 'any';
  responsibilities: string[];
  qualifications: string[];
  benefits?: string[];
  salaryRange?: string;
}

export interface SkillMatch {
  skill: string;
  match: boolean;
  required: boolean;
  userLevel?: 'expert' | 'proficient' | 'familiar' | 'none';
  recommendation?: string;
}

export interface JobMatchAnalysis {
  overallMatch: number; // 0-100
  skillMatch: number; // 0-100
  experienceMatch: number; // 0-100
  skillMatches: SkillMatch[];
  missingSkills: string[];
  strongMatches: string[];
  recommendations: string[];
  interviewPrep: {
    likelyQuestions: string[];
    focusAreas: string[];
    resources: Array<{
      type: 'article' | 'video' | 'practice';
      title: string;
      description: string;
      url?: string;
    }>;
  };
}

export interface JobAnalysisRequest {
  jobDescription: string;
  userSkills: string[];
  userExperience: 'junior' | 'mid' | 'senior';
  targetRole?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Parse job description
 */
export async function parseJobDescription(
  jdText: string
): Promise<ParsedJobDescription> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/parse-job-description`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobDescription: jdText,
      }),
    });

    if (!response.ok) {
      throw new Error(`Parsing failed: ${response.status}`);
    }

    const data = await response.json();
    return data.parsed || parseJobDescriptionFallback(jdText);
  } catch (error) {
    console.error('Error parsing job description:', error);
    return parseJobDescriptionFallback(jdText);
  }
}

/**
 * Analyze job match
 */
export async function analyzeJobMatch(
  request: JobAnalysisRequest
): Promise<JobMatchAnalysis> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/job-match-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobDescription: request.jobDescription,
        userSkills: request.userSkills,
        userExperience: request.userExperience,
        targetRole: request.targetRole,
      }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`);
    }

    const data = await response.json();
    return data.analysis || generateDefaultMatchAnalysis(request);
  } catch (error) {
    console.error('Error analyzing job match:', error);
    return generateDefaultMatchAnalysis(request);
  }
}

/**
 * Generate interview prep from job description
 */
export async function generateInterviewPrepFromJD(
  jdText: string,
  targetRole: string
): Promise<{
  likelyQuestions: string[];
  focusAreas: string[];
  prepPlan: any;
}> {
  try {
    const parsed = await parseJobDescription(jdText);
    
    // Use existing learning path API
    const response = await fetch(`${API_BASE_URL}/api/ai/learning-path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'current-user',
        targetRole: parsed.title || targetRole,
        performanceData: {
          weakAreas: [],
          strongAreas: [],
          recentScores: [],
        },
        availableHoursPerWeek: 10,
      }),
    });

    if (!response.ok) {
      throw new Error('Prep plan generation failed');
    }

    const data = await response.json();
    
    return {
      likelyQuestions: generateLikelyQuestions(parsed),
      focusAreas: parsed.requiredSkills.slice(0, 5),
      prepPlan: data,
    };
  } catch (error) {
    console.error('Error generating interview prep:', error);
    return {
      likelyQuestions: [],
      focusAreas: [],
      prepPlan: null,
    };
  }
}

/**
 * Fallback: Parse job description with regex
 */
function parseJobDescriptionFallback(jdText: string): ParsedJobDescription {
  const text = jdText.toLowerCase();
  
  // Extract common skills
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node.js', 'typescript',
    'sql', 'mongodb', 'postgresql', 'aws', 'docker', 'kubernetes',
    'git', 'agile', 'scrum', 'rest api', 'graphql', 'microservices',
  ];
  
  const requiredSkills: string[] = [];
  commonSkills.forEach(skill => {
    if (text.includes(skill)) {
      requiredSkills.push(skill);
    }
  });

  // Extract experience level
  let experienceLevel: 'junior' | 'mid' | 'senior' | 'any' = 'any';
  if (text.includes('senior') || text.includes('lead') || text.includes('5+ years')) {
    experienceLevel = 'senior';
  } else if (text.includes('mid') || text.includes('3+ years') || text.includes('2-5 years')) {
    experienceLevel = 'mid';
  } else if (text.includes('junior') || text.includes('entry') || text.includes('0-2 years')) {
    experienceLevel = 'junior';
  }

  // Extract responsibilities (look for bullet points)
  const responsibilities: string[] = [];
  const lines = jdText.split('\n');
  lines.forEach(line => {
    if (line.trim().match(/^[-•*]\s+/) || line.trim().match(/^\d+\.\s+/)) {
      responsibilities.push(line.trim().replace(/^[-•*\d.]\s+/, ''));
    }
  });

  return {
    title: extractTitle(jdText),
    requiredSkills,
    preferredSkills: [],
    experienceLevel,
    responsibilities: responsibilities.slice(0, 10),
    qualifications: [],
  };
}

/**
 * Extract job title
 */
function extractTitle(jdText: string): string {
  const lines = jdText.split('\n').slice(0, 5);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && trimmed.length < 100) {
      // Check if it looks like a title
      if (trimmed.match(/^(senior|junior|mid-level|lead)?\s*(software|web|full.?stack|front.?end|back.?end|devops|data|machine.?learning)/i)) {
        return trimmed;
      }
    }
  }
  return 'Software Engineer';
}

/**
 * Generate default match analysis
 */
function generateDefaultMatchAnalysis(
  request: JobAnalysisRequest
): JobMatchAnalysis {
  const parsed = parseJobDescriptionFallback(request.jobDescription);
  
  const userSkillsLower = request.userSkills.map(s => s.toLowerCase());
  const requiredSkillsLower = parsed.requiredSkills.map(s => s.toLowerCase());
  
  const skillMatches: SkillMatch[] = requiredSkillsLower.map(skill => {
    const match = userSkillsLower.some(us => 
      us.includes(skill) || skill.includes(us)
    );
    
    return {
      skill,
      match,
      required: true,
      userLevel: match ? 'proficient' : 'none',
      recommendation: match 
        ? 'Continue building on this skill'
        : `Consider learning ${skill}`,
    };
  });

  const matchedCount = skillMatches.filter(m => m.match).length;
  const skillMatch = requiredSkillsLower.length > 0
    ? (matchedCount / requiredSkillsLower.length) * 100
    : 50;

  const missingSkills = skillMatches
    .filter(m => !m.match)
    .map(m => m.skill);

  const strongMatches = skillMatches
    .filter(m => m.match)
    .map(m => m.skill);

  const recommendations: string[] = [];
  if (missingSkills.length > 0) {
    recommendations.push(`Focus on learning: ${missingSkills.slice(0, 3).join(', ')}`);
  }
  if (skillMatch < 60) {
    recommendations.push('Consider building projects to demonstrate required skills');
  }

  // Experience match
  const experienceMatch = calculateExperienceMatch(
    request.userExperience,
    parsed.experienceLevel
  );

  const overallMatch = (skillMatch * 0.7 + experienceMatch * 0.3);

  return {
    overallMatch: Math.round(overallMatch),
    skillMatch: Math.round(skillMatch),
    experienceMatch: Math.round(experienceMatch),
    skillMatches,
    missingSkills,
    strongMatches,
    recommendations,
    interviewPrep: {
      likelyQuestions: generateLikelyQuestions(parsed),
      focusAreas: parsed.requiredSkills.slice(0, 5),
      resources: [
        {
          type: 'article',
          title: `${parsed.title} Interview Guide`,
          description: 'Comprehensive guide for this role',
        },
      ],
    },
  };
}

/**
 * Calculate experience match
 */
function calculateExperienceMatch(
  userExp: 'junior' | 'mid' | 'senior',
  requiredExp: 'junior' | 'mid' | 'senior' | 'any'
): number {
  if (requiredExp === 'any') return 100;

  const levels = { junior: 1, mid: 2, senior: 3 };
  const userLevel = levels[userExp];
  const requiredLevel = levels[requiredExp];

  if (userLevel >= requiredLevel) return 100;
  if (userLevel === requiredLevel - 1) return 70;
  return 40;
}

/**
 * Generate likely questions from parsed JD
 */
function generateLikelyQuestions(parsed: ParsedJobDescription): string[] {
  const questions: string[] = [];

  // Role-specific questions
  questions.push(`Tell me about your experience with ${parsed.title}`);
  
  // Skill-based questions
  parsed.requiredSkills.slice(0, 3).forEach(skill => {
    questions.push(`How would you approach a problem using ${skill}?`);
  });

  // Behavioral questions
  questions.push('Tell me about a challenging project you worked on');
  questions.push('How do you handle tight deadlines?');
  questions.push('Describe a time you had to learn a new technology quickly');

  return questions.slice(0, 10);
}


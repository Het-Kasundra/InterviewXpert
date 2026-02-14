/**
 * AI Resume Analysis Service
 * Provides AI-powered resume analysis and optimization suggestions
 */

export interface ResumeAnalysis {
  atsScore: number; // 0-100
  keywordScore: number; // 0-100
  overallScore: number; // 0-100
  suggestions: {
    type: 'critical' | 'important' | 'suggestion';
    category: string;
    message: string;
    example?: string;
  }[];
  missingKeywords: string[];
  strengths: string[];
  improvements: ResumeImprovement[];
  skillGap?: {
    required: string[];
    missing: string[];
    match: number; // percentage
  };
}

export interface ResumeImprovement {
  section: string;
  current: string;
  suggested: string;
  reason: string;
}

export interface ResumeAnalysisRequest {
  resumeText: string;
  targetRole?: string;
  jobDescription?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Analyze resume for ATS compatibility and optimization
 */
export async function analyzeResume(
  request: ResumeAnalysisRequest
): Promise<ResumeAnalysis> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/analyze-resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: request.resumeText,
        targetRole: request.targetRole,
        jobDescription: request.jobDescription,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resume analysis failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    // Fallback to basic analysis
    return generateBasicResumeAnalysis(request);
  }
}

/**
 * Get keyword suggestions for a specific role
 */
export async function getKeywordSuggestions(
  role: string,
  resumeText: string
): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/resume-keywords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role,
        resumeText,
      }),
    });

    if (!response.ok) {
      throw new Error(`Keyword suggestion failed: ${response.status}`);
    }

    const data = await response.json();
    return data.keywords || [];
  } catch (error) {
    console.error('Error getting keyword suggestions:', error);
    return [];
  }
}

/**
 * Fallback: Basic resume analysis without AI
 */
function generateBasicResumeAnalysis(
  request: ResumeAnalysisRequest
): ResumeAnalysis {
  const resumeText = request.resumeText.toLowerCase();
  const hasEmail = /[\w\.-]+@[\w\.-]+\.\w+/.test(request.resumeText);
  const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(request.resumeText);
  const hasExperience = resumeText.includes('experience') || resumeText.includes('work');
  const hasEducation = resumeText.includes('education') || resumeText.includes('degree');
  const hasSkills = resumeText.includes('skill') || resumeText.includes('technical');

  const atsScore = (hasEmail ? 20 : 0) + (hasPhone ? 20 : 0) + 
                  (hasExperience ? 20 : 0) + (hasEducation ? 20 : 0) + 
                  (hasSkills ? 20 : 0);

  return {
    atsScore,
    keywordScore: 60,
    overallScore: Math.round((atsScore + 60) / 2),
    suggestions: [
      {
        type: hasEmail && hasPhone ? 'suggestion' : 'important',
        category: 'Contact Information',
        message: hasEmail && hasPhone 
          ? 'Contact information is present'
          : 'Ensure email and phone number are included',
      },
      {
        type: hasExperience ? 'suggestion' : 'important',
        category: 'Experience Section',
        message: hasExperience 
          ? 'Experience section found'
          : 'Add a clear experience section',
      },
    ],
    missingKeywords: [],
    strengths: hasEmail && hasPhone ? ['Complete contact information'] : [],
    improvements: [],
  };
}


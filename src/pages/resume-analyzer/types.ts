export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  portfolio?: string;
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  location: string;
  achievements: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

export interface Skills {
  technical: string[];
  soft: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface ExtractedData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skills;
  certifications: string[];
  projects: Project[];
}

export interface ScoreBreakdown {
  structure: number;
  language: number;
  keywords: number;
  clarity: number;
  atsCompatibility: number;
}

export interface Recommendation {
  category: 'Content Improvements' | 'Format Enhancements' | 'Keyword Optimization' | 'Grammar Fixes';
  title: string;
  description: string;
  before: string;
  after: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AnalysisFeedback {
  overallScore: number;
  breakdown: ScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  recommendations: Recommendation[];
  missingElements: string[];
}

export interface ResumeAnalysis {
  id: string;
  user_id: string;
  filename: string;
  resume_text: string;
  score: number;
  extracted_data: ExtractedData;
  feedback: AnalysisFeedback;
  created_at: string;
}
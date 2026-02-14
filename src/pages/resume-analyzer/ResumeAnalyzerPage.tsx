
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../../contexts/SessionProvider';
import { supabase } from '../../lib/supabaseClient';
import { UploadSection } from './components/UploadSection';
import { ExtractedDataPanel } from './components/ExtractedDataPanel';
import { AnalysisPanel } from './components/AnalysisPanel';
import { ScoreVisualization } from './components/ScoreVisualization';
import { RecommendationsPanel } from './components/RecommendationsPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { ResumeAnalysis, ExtractedData, AnalysisFeedback } from './types';
import { analyzeResume, getKeywordSuggestions, type ResumeAnalysis as AIResumeAnalysis } from '../../lib/aiResumeService';

export const ResumeAnalyzerPage = () => {
  const { user } = useSession();
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisFeedback | null>(null);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ResumeAnalysis | null>(null);
  const [targetRole, setTargetRole] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<AIResumeAnalysis | null>(null);

  // Fetch user's previous analyses
  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    }
  };

  // Enhanced text extraction with better parsing
  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const result = e.target?.result;
          
          if (file.type === 'text/plain') {
            resolve(result as string);
          } else if (file.type === 'application/pdf') {
            const text = await extractPDFText(result as ArrayBuffer);
            resolve(text);
          } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const text = await extractDOCXText(result as ArrayBuffer);
            resolve(text);
          } else {
            reject(new Error('Unsupported file type'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  // Enhanced PDF text extraction
  const extractPDFText = async (buffer: ArrayBuffer): Promise<string> => {
    const uint8Array = new Uint8Array(buffer);
    const text = new TextDecoder('utf-8', { ignoreBOM: true }).decode(uint8Array);
    
    // Multiple extraction strategies
    let extractedText = '';
    
    // Strategy 1: Extract text between BT/ET markers
    const btEtMatches = text.match(/BT\s*(.*?)\s*ET/gs);
    if (btEtMatches) {
      extractedText = btEtMatches.map(match => 
        match.replace(/BT\s*|\s*ET/g, '')
             .replace(/Tj\s*/g, ' ')
             .replace(/[()]/g, '')
             .replace(/\\\d+/g, '')
             .replace(/\s+/g, ' ')
      ).join(' ').trim();
    }
    
    // Strategy 2: Extract readable ASCII text
    if (!extractedText || extractedText.length < 50) {
      const asciiText = text.replace(/[^\x20-\x7E\n\r]/g, ' ')
                           .replace(/\s+/g, ' ')
                           .trim();
      
      // Filter out PDF metadata and keep meaningful content
      const lines = asciiText.split(/[\n\r]+/);
      const meaningfulLines = lines.filter(line => {
        const cleanLine = line.trim();
        return cleanLine.length > 3 && 
               !cleanLine.match(/^[\d\s\.\-\/\\]+$/) &&
               !cleanLine.includes('obj') &&
               !cleanLine.includes('endobj') &&
               !cleanLine.includes('stream') &&
               !cleanLine.includes('endstream');
      });
      
      extractedText = meaningfulLines.join(' ').trim();
    }
    
    // Strategy 3: Look for common resume patterns
    if (!extractedText || extractedText.length < 50) {
      const patterns = [
        /([A-Z][a-z]+ [A-Z][a-z]+)/g, // Names
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, // Emails
        /((?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/g, // Phone numbers
        /(Experience|Education|Skills|Projects|Certifications)/gi, // Section headers
      ];
      
      const matches = [];
      patterns.forEach(pattern => {
        const found = text.match(pattern);
        if (found) matches.push(...found);
      });
      
      extractedText = matches.join(' ');
    }
    
    return extractedText || 'Unable to extract readable text from PDF';
  };

  // Enhanced DOCX text extraction
  const extractDOCXText = async (buffer: ArrayBuffer): Promise<string> => {
    const uint8Array = new Uint8Array(buffer);
    const text = new TextDecoder('utf-8', { ignoreBOM: true }).decode(uint8Array);
    
    // Extract text from XML content with better parsing
    const xmlMatches = text.match(/<w:t[^>]*>(.*?)<\/w:t>/gs);
    if (xmlMatches) {
      const extractedText = xmlMatches.map(match => 
        match.replace(/<[^>]*>/g, '')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&amp;/g, '&')
             .trim()
      ).filter(t => t.length > 0).join(' ');
      
      return extractedText;
    }
    
    // Fallback: extract any readable text
    const fallbackText = text.replace(/[^\x20-\x7E\n]/g, ' ')
                             .replace(/\s+/g, ' ')
                             .trim();
    
    return fallbackText || 'Unable to extract readable text from DOCX';
  };

  // Enhanced resume data parsing with better accuracy
  const parseResumeData = (text: string): ExtractedData => {
    console.log('Parsing resume text:', text.substring(0, 500));
    
    const lines = text.split(/[\n\r]+/).map(line => line.trim()).filter(line => line.length > 0);
    
    // Enhanced regex patterns
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    const linkedinRegex = /(?:linkedin\.com\/in\/|linkedin\.com\/pub\/)([\w-]+)/gi;
    const websiteRegex = /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w.]+(?:\/[\w.-]*)?/g;
    const locationRegex = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s*[A-Z]{2,}(?:\s+\d{5})?)/g;
    
    // Extract contact information
    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex) || [];
    const linkedinProfiles = text.match(linkedinRegex) || [];
    const websites = text.match(websiteRegex) || [];
    const locations = text.match(locationRegex) || [];
    
    // Enhanced name extraction
    let name = '';
    const namePatterns = [
      /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*$/m,
      /([A-Z][A-Z\s]+[A-Z])/g,
      /^([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/m
    ];
    
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].length < 50) {
        name = match[1].trim();
        break;
      }
    }
    
    // If no name found, try first few lines
    if (!name) {
      for (const line of lines.slice(0, 5)) {
        if (!emailRegex.test(line) && !phoneRegex.test(line) && 
            line.length > 5 && line.length < 50) {
          const words = line.split(' ').filter(w => w.length > 1);
          if (words.length >= 2 && words.length <= 4) {
            name = line;
            break;
          }
        }
      }
    }
    
    // Enhanced section parsing
    const sections = {
      experience: [] as any[],
      education: [] as any[],
      skills: { technical: [] as string[], soft: [] as string[] },
      projects: [] as any[],
      certifications: [] as string[]
    };
    
    // Better section header detection
    const sectionHeaders = {
      experience: /(?:^|\n)\s*(?:work\s+)?(?:experience|employment|professional\s+experience|career|work\s+history)\s*:?\s*$/im,
      education: /(?:^|\n)\s*(?:education|academic|qualifications|degrees?)\s*:?\s*$/im,
      skills: /(?:^|\n)\s*(?:skills|technical\s+skills|competencies|expertise|technologies)\s*:?\s*$/im,
      projects: /(?:^|\n)\s*(?:projects|portfolio|work\s+samples|personal\s+projects)\s*:?\s*$/im,
      certifications: /(?:^|\n)\s*(?:certifications?|certificates?|licenses?|credentials?)\s*:?\s*$/im
    };
    
    // Parse sections with context
    let currentSection = '';
    let sectionContent: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for section headers
      let foundSection = '';
      for (const [section, regex] of Object.entries(sectionHeaders)) {
        if (regex.test(line)) {
          foundSection = section;
          break;
        }
      }
      
      if (foundSection) {
        // Process previous section
        if (currentSection && sectionContent.length > 0) {
          processSectionContent(currentSection, sectionContent, sections);
        }
        
        currentSection = foundSection;
        sectionContent = [];
      } else if (currentSection && line.length > 3) {
        sectionContent.push(line);
      }
    }
    
    // Process final section
    if (currentSection && sectionContent.length > 0) {
      processSectionContent(currentSection, sectionContent, sections);
    }
    
    // Extract summary with better detection
    let summary = '';
    const summaryPatterns = [
      /(?:summary|objective|profile|about\s+me|professional\s+summary)\s*:?\s*(.*?)(?=\n\s*(?:experience|education|skills|work|employment))/is,
      /^(.*?)(?=\n\s*(?:experience|education|skills|work|employment))/is
    ];
    
    for (const pattern of summaryPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim().length > 20) {
        summary = match[1].trim().replace(/\s+/g, ' ');
        break;
      }
    }
    
    return {
      personalInfo: {
        name: name || 'Name not found',
        email: emails[0] || 'Email not found',
        phone: phones[0] || 'Phone not found',
        location: locations[0] || 'Location not found',
        linkedin: linkedinProfiles[0] || '',
        portfolio: websites.find(w => !w.includes('@') && !w.includes('linkedin')) || ''
      },
      summary: summary || 'Professional summary not found',
      experience: sections.experience,
      education: sections.education,
      skills: sections.skills,
      certifications: sections.certifications,
      projects: sections.projects
    };
  };

  const processSectionContent = (section: string, content: string[], sections: any) => {
    switch (section) {
      case 'experience':
        sections.experience = parseExperience(content);
        break;
      case 'education':
        sections.education = parseEducation(content);
        break;
      case 'skills':
        sections.skills = parseSkills(content);
        break;
      case 'projects':
        sections.projects = parseProjects(content);
        break;
      case 'certifications':
        sections.certifications = parseCertifications(content);
        break;
    }
  };

  // Enhanced experience parsing
  const parseExperience = (content: string[]) => {
    const experiences = [];
    let currentExp: any = null;
    
    for (const line of content) {
      // Check for job title/company patterns
      const jobPattern = /^(.+?)\s*[-|@]\s*(.+?)(?:\s*\|\s*(.+?))?(?:\s*\((.+?)\))?$/;
      const datePattern = /(\d{4})\s*[-–]\s*(\d{4}|present|current)/i;
      
      if (line.length > 10 && line.length < 150) {
        const jobMatch = line.match(jobPattern);
        const dateMatch = line.match(datePattern);
        
        if (jobMatch || dateMatch || line.includes('•') === false) {
          if (currentExp) {
            experiences.push(currentExp);
          }
          
          currentExp = {
            title: jobMatch ? jobMatch[1].trim() : line.split(/[-|@]/)[0]?.trim() || line,
            company: jobMatch ? jobMatch[2].trim() : 'Company not specified',
            duration: dateMatch ? dateMatch[0] : extractDuration(line) || 'Duration not specified',
            location: extractLocation(line) || '',
            achievements: []
          };
        }
      } else if (currentExp && (line.startsWith('•') || line.startsWith('-') || line.length > 10)) {
        currentExp.achievements.push(line.replace(/^[•\-]\s*/, ''));
      }
    }
    
    if (currentExp) {
      experiences.push(currentExp);
    }
    
    return experiences;
  };

  // Enhanced education parsing
  const parseEducation = (content: string[]) => {
    const education = [];
    
    for (const line of content) {
      if (line.length > 10) {
        const degreePattern = /(bachelor|master|phd|doctorate|diploma|certificate|degree)/i;
        const yearPattern = /\b(19|20)\d{2}\b/g;
        const gpaPattern = /gpa:?\s*(\d\.\d)/i;
        
        const years = line.match(yearPattern) || [];
        const gpaMatch = line.match(gpaPattern);
        
        education.push({
          degree: line,
          institution: extractInstitution(line) || 'Institution not specified',
          year: years[years.length - 1] || 'Year not specified',
          gpa: gpaMatch ? gpaMatch[1] : ''
        });
      }
    }
    
    return education;
  };

  // Enhanced skills parsing
  const parseSkills = (content: string[]) => {
    const allText = content.join(' ');
    const skillItems = allText.split(/[,;|•\-\n]/).map(s => s.trim()).filter(s => s.length > 1);
    
    const technicalKeywords = [
      'javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker', 'git',
      'html', 'css', 'typescript', 'angular', 'vue', 'mongodb', 'postgresql', 'mysql',
      'kubernetes', 'jenkins', 'terraform', 'azure', 'gcp', 'linux', 'windows'
    ];
    
    const technical = [];
    const soft = [];
    
    for (const skill of skillItems) {
      const skillLower = skill.toLowerCase();
      if (technicalKeywords.some(keyword => skillLower.includes(keyword)) || 
          /\b(programming|development|software|technical|coding|database|cloud|devops)\b/i.test(skill)) {
        technical.push(skill);
      } else if (skill.length > 2) {
        soft.push(skill);
      }
    }
    
    return { technical, soft };
  };

  // Enhanced projects parsing
  const parseProjects = (content: string[]) => {
    const projects = [];
    
    for (const line of content) {
      if (line.length > 10) {
        const projectName = line.split(/[-:|]/)[0]?.trim() || line;
        
        projects.push({
          name: projectName,
          description: line,
          technologies: extractTechnologies(line),
          link: extractWebsite(line) || ''
        });
      }
    }
    
    return projects;
  };

  const parseCertifications = (content: string[]) => {
    return content.filter(line => line.length > 5 && !line.match(/^\d+$/));
  };

  // Helper functions with better accuracy
  const extractLocation = (text: string) => {
    const locationPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s*[A-Z]{2,}(?:\s+\d{5})?)/;
    return text.match(locationPattern)?.[0];
  };

  const extractInstitution = (text: string) => {
    const institutionPattern = /(university|college|institute|school|academy)/i;
    const words = text.split(/[-|,]/).map(w => w.trim());
    return words.find(w => institutionPattern.test(w)) || words[1];
  };

  const extractWebsite = (text: string) => {
    const websitePattern = /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w.]+/;
    const match = text.match(websitePattern)?.[0];
    return match && !match.includes('@') ? match : '';
  };

  const extractDuration = (text: string) => {
    const durationPattern = /(\d{4})\s*[-–]\s*(\d{4}|present|current)/i;
    return text.match(durationPattern)?.[0];
  };

  const extractTechnologies = (text: string) => {
    const techKeywords = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'SQL', 'MongoDB', 'AWS'];
    return techKeywords.filter(tech => text.toLowerCase().includes(tech.toLowerCase()));
  };

  // Enhanced AI analysis with dynamic scoring
  const generateAnalysis = (data: ExtractedData, resumeText: string): AnalysisFeedback => {
    const analysis = {
      overallScore: 0,
      breakdown: {
        structure: 0,
        language: 0,
        keywords: 0,
        clarity: 0,
        atsCompatibility: 0
      },
      strengths: [] as string[],
      weaknesses: [] as string[],
      recommendations: [] as any[],
      missingElements: [] as string[]
    };

    // Dynamic structure scoring based on actual content
    let structureScore = 0;
    if (data.personalInfo.name !== 'Name not found') structureScore += 25;
    if (data.personalInfo.email !== 'Email not found') structureScore += 20;
    if (data.personalInfo.phone !== 'Phone not found') structureScore += 15;
    if (data.experience.length > 0) structureScore += 25;
    if (data.education.length > 0) structureScore += 10;
    if (data.skills.technical.length > 0 || data.skills.soft.length > 0) structureScore += 5;
    analysis.breakdown.structure = Math.min(structureScore, 100);

    // Dynamic language analysis
    const sentences = resumeText.split(/[.!?]/).filter(s => s.trim().length > 10);
    const words = resumeText.split(/\s+/).filter(w => w.length > 2);
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    
    let languageScore = 60; // Base score
    
    // Check for action verbs
    const actionVerbs = ['achieved', 'improved', 'developed', 'managed', 'led', 'created', 'implemented', 'designed', 'optimized'];
    const actionVerbCount = actionVerbs.filter(verb => resumeText.toLowerCase().includes(verb)).length;
    languageScore += Math.min(actionVerbCount * 5, 25);
    
    // Check sentence structure
    if (avgWordsPerSentence > 10 && avgWordsPerSentence < 20) languageScore += 10;
    
    // Check for passive voice (negative scoring)
    const passivePhrases = ['responsible for', 'duties included', 'worked on'];
    const passiveCount = passivePhrases.filter(phrase => resumeText.toLowerCase().includes(phrase)).length;
    languageScore -= passiveCount * 5;
    
    analysis.breakdown.language = Math.max(Math.min(languageScore, 100), 0);

    // Dynamic keyword analysis
    const technicalKeywords = ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker', 'git', 'html', 'css'];
    const foundKeywords = technicalKeywords.filter(keyword => 
      resumeText.toLowerCase().includes(keyword)
    );
    
    const keywordDensity = foundKeywords.length / Math.max(technicalKeywords.length, 1);
    analysis.breakdown.keywords = Math.min(keywordDensity * 100, 100);

    // Dynamic clarity analysis
    let clarityScore = 70; // Base score
    
    if (data.summary !== 'Professional summary not found') clarityScore += 15;
    
    // Check for quantifiable achievements
    const numberPattern = /\d+%|\d+\+|\$\d+|\d+k\+/g;
    const quantifiableAchievements = resumeText.match(numberPattern) || [];
    clarityScore += Math.min(quantifiableAchievements.length * 3, 15);
    
    analysis.breakdown.clarity = Math.min(clarityScore, 100);

    // Dynamic ATS compatibility
    let atsScore = 70; // Base score
    
    if (data.personalInfo.phone !== 'Phone not found') atsScore += 10;
    if (data.skills.technical.length > 3) atsScore += 10;
    if (data.experience.length > 0) atsScore += 10;
    
    analysis.breakdown.atsCompatibility = Math.min(atsScore, 100);

    // Calculate weighted overall score
    analysis.overallScore = Math.round(
      (analysis.breakdown.structure * 0.25 +
       analysis.breakdown.language * 0.20 +
       analysis.breakdown.keywords * 0.25 +
       analysis.breakdown.clarity * 0.20 +
       analysis.breakdown.atsCompatibility * 0.10)
    );

    // Dynamic strengths and weaknesses
    if (analysis.breakdown.structure > 80) {
      analysis.strengths.push('Well-structured resume with clear contact information');
    }
    if (analysis.breakdown.language > 75) {
      analysis.strengths.push('Professional language with good use of action verbs');
    }
    if (foundKeywords.length > 3) {
      analysis.strengths.push(`Good technical keyword coverage (${foundKeywords.length} relevant terms found)`);
    }
    if (quantifiableAchievements.length > 2) {
      analysis.strengths.push('Includes quantifiable achievements and metrics');
    }

    // Dynamic weaknesses
    if (analysis.breakdown.structure < 70) {
      analysis.weaknesses.push('Missing essential contact information or resume sections');
    }
    if (data.summary === 'Professional summary not found') {
      analysis.weaknesses.push('No professional summary or objective statement');
    }
    if (foundKeywords.length < 3) {
      analysis.weaknesses.push('Limited technical keywords for your field');
    }
    if (passiveCount > 2) {
      analysis.weaknesses.push('Too much passive language - use more action verbs');
    }
    if (quantifiableAchievements.length === 0) {
      analysis.weaknesses.push('Lacks quantifiable achievements and specific metrics');
    }

    // Dynamic recommendations based on actual content
    if (data.summary === 'Professional summary not found') {
      analysis.recommendations.push({
        category: 'Content Improvements',
        title: 'Add Professional Summary',
        description: 'Include a compelling 2-3 sentence summary highlighting your key qualifications',
        before: 'Missing professional summary',
        after: 'Results-driven software engineer with 5+ years developing scalable web applications...',
        priority: 'high'
      });
    }

    if (foundKeywords.length < 3) {
      analysis.recommendations.push({
        category: 'Keyword Optimization',
        title: 'Include More Technical Keywords',
        description: 'Add relevant technical skills and tools mentioned in job descriptions',
        before: `Only ${foundKeywords.length} technical keywords found`,
        after: 'Include specific technologies like React, Node.js, AWS, Docker, etc.',
        priority: 'high'
      });
    }

    if (quantifiableAchievements.length === 0) {
      analysis.recommendations.push({
        category: 'Content Improvements',
        title: 'Add Quantifiable Achievements',
        description: 'Include specific numbers, percentages, and measurable results',
        before: 'Managed team projects',
        after: 'Led team of 5 developers, delivering 3 projects 20% ahead of schedule',
        priority: 'high'
      });
    }

    if (passiveCount > 1) {
      analysis.recommendations.push({
        category: 'Language Enhancement',
        title: 'Use Active Voice',
        description: 'Replace passive phrases with strong action verbs',
        before: 'Was responsible for managing databases',
        after: 'Optimized database performance, reducing query time by 40%',
        priority: 'medium'
      });
    }

    // Dynamic missing elements
    if (data.personalInfo.linkedin === '') {
      analysis.missingElements.push('LinkedIn profile URL');
    }
    if (data.certifications.length === 0) {
      analysis.missingElements.push('Professional certifications');
    }
    if (data.projects.length === 0) {
      analysis.missingElements.push('Portfolio projects or personal work');
    }
    if (data.personalInfo.location === 'Location not found') {
      analysis.missingElements.push('Location/address information');
    }

    return analysis;
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setCurrentStep('analyzing');
    setLoading(true);

    try {
      console.log('Starting file analysis for:', file.name);
      
      // Extract text from file
      const resumeText = await extractTextFromFile(file);
      console.log('Extracted text length:', resumeText.length);
      console.log('First 200 characters:', resumeText.substring(0, 200));

      if (resumeText.length < 50) {
        throw new Error('Unable to extract sufficient text from the file. Please ensure the file contains readable text.');
      }

      // Parse the extracted text into structured data
      const parsedData = parseResumeData(resumeText);
      console.log('Parsed data:', parsedData);

      // Try AI-powered analysis first, fallback to basic
      let analysisResult: AnalysisFeedback;
      let aiResumeAnalysis: AIResumeAnalysis | null = null;
      
      try {
        // Use AI for enhanced analysis
        aiResumeAnalysis = await analyzeResume({
          resumeText,
          targetRole: targetRole || undefined,
          jobDescription: jobDescription || undefined,
        });
        
        // Convert AI analysis to our format
        const structureScore = Math.round((aiResumeAnalysis.atsScore + aiResumeAnalysis.keywordScore) / 2);
        const languageScore = Math.max(60, Math.min(100, aiResumeAnalysis.overallScore - 10));
        const clarityScore = Math.max(60, Math.min(100, aiResumeAnalysis.overallScore - 5));
        
        analysisResult = {
          overallScore: aiResumeAnalysis.overallScore,
          breakdown: {
            structure: structureScore,
            language: languageScore,
            keywords: aiResumeAnalysis.keywordScore,
            clarity: clarityScore,
            atsCompatibility: aiResumeAnalysis.atsScore,
          },
          strengths: aiResumeAnalysis.strengths && aiResumeAnalysis.strengths.length > 0 
            ? aiResumeAnalysis.strengths 
            : [
                structureScore > 80 ? 'Well-structured resume with clear sections' : '',
                aiResumeAnalysis.keywordScore > 70 ? 'Good keyword optimization' : '',
                aiResumeAnalysis.atsScore > 75 ? 'Strong ATS compatibility' : '',
              ].filter(s => s !== ''),
          weaknesses: aiResumeAnalysis.improvements && aiResumeAnalysis.improvements.length > 0
            ? aiResumeAnalysis.improvements.map(imp => imp.reason || imp.section)
            : aiResumeAnalysis.suggestions
                .filter(s => s.type === 'critical' || s.type === 'important')
                .map(s => s.message),
          recommendations: aiResumeAnalysis.suggestions.map(s => ({
            category: s.category === 'Contact Information' 
              ? 'Format Enhancements' 
              : s.category === 'Experience Section' || s.category === 'Skills'
              ? 'Content Improvements'
              : s.category === 'Keywords'
              ? 'Keyword Optimization'
              : 'Content Improvements' as any,
            title: s.message.split(':')[0] || s.category,
            description: s.message,
            before: s.example || s.message,
            after: s.example || 'See recommendations for improvement',
            priority: s.type === 'critical' ? 'high' as const : s.type === 'important' ? 'medium' as const : 'low' as const,
          })),
          missingElements: aiResumeAnalysis.missingKeywords && aiResumeAnalysis.missingKeywords.length > 0
            ? aiResumeAnalysis.missingKeywords
            : [],
        };
        
        // Ensure we have at least some strengths and weaknesses
        if (analysisResult.strengths.length === 0) {
          analysisResult.strengths = [
            'Resume uploaded successfully',
            'Basic structure detected',
          ];
        }
        if (analysisResult.weaknesses.length === 0) {
          analysisResult.weaknesses = [
            'Consider adding more specific achievements',
            'Review keyword optimization',
          ];
        }
        
        setAiAnalysis(aiResumeAnalysis);
      } catch (error) {
        console.warn('AI analysis failed, using basic analysis:', error);
        // Fallback to basic analysis
        analysisResult = generateAnalysis(parsedData, resumeText);
      }

      // Validate analysis result before setting
      if (!analysisResult || !analysisResult.breakdown) {
        console.error('Invalid analysis result, using fallback');
        analysisResult = generateAnalysis(parsedData, resumeText);
      }

      // Ensure all required fields are present
      if (!analysisResult.strengths || analysisResult.strengths.length === 0) {
        analysisResult.strengths = ['Resume structure detected', 'Content extracted successfully'];
      }
      if (!analysisResult.weaknesses || analysisResult.weaknesses.length === 0) {
        analysisResult.weaknesses = ['Consider adding more details', 'Review formatting'];
      }
      if (!analysisResult.recommendations || analysisResult.recommendations.length === 0) {
        analysisResult.recommendations = [{
          category: 'Content Improvements' as const,
          title: 'Enhance Resume Content',
          description: 'Add more specific achievements and quantifiable results',
          before: 'Current content',
          after: 'Enhanced content with metrics',
          priority: 'medium' as const,
        }];
      }
      if (!analysisResult.missingElements) {
        analysisResult.missingElements = [];
      }

      console.log('Final analysis result:', analysisResult);
      
      setExtractedData(parsedData);
      setAnalysis(analysisResult);
      setScore(analysisResult.overallScore);

      // Save to database
      if (user) {
        try {
          const { error } = await supabase
            .from('resume_analyses')
            .insert({
              user_id: user.id,
              filename: file.name,
              resume_text: resumeText,
              score: analysisResult.overallScore,
              extracted_data: parsedData,
              feedback: analysisResult
            });

          if (!error) {
            fetchAnalyses();
          } else {
            console.error('Error saving to database:', error);
          }
        } catch (dbError) {
          console.error('Database save error:', dbError);
        }
      }

      setCurrentStep('results');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert(`Error analyzing resume: ${error.message}. Please try again or use a different file format.`);
      setCurrentStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisSelect = (analysis: ResumeAnalysis) => {
    setSelectedAnalysis(analysis);
    setExtractedData(analysis.extracted_data);
    setAnalysis(analysis.feedback);
    setScore(analysis.score);
    setCurrentStep('results');
  };

  const handleNewAnalysis = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setExtractedData(null);
    setAnalysis(null);
    setScore(0);
    setSelectedAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <motion.h1
                  className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Resume Analyzer
                  <motion.div
                    className="h-1 bg-gradient-to-r from-blue-600 to-gold-500 rounded-full mt-2"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </motion.h1>
                <motion.p
                  className="text-gray-600 dark:text-gray-300 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Get AI-powered insights and recommendations to perfect your resume
                </motion.p>
              </div>
              
              {currentStep === 'results' && (
                <motion.button
                  onClick={handleNewAnalysis}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="ri-add-line" />
                  New Analysis
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* History Sidebar */}
            <motion.div
              className="w-80 flex-shrink-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <HistoryPanel
                analyses={analyses}
                selectedAnalysis={selectedAnalysis}
                onAnalysisSelect={handleAnalysisSelect}
                onNewAnalysis={handleNewAnalysis}
              />
            </motion.div>

            {/* Main Content */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {currentStep === 'upload' && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {/* Optional: Target Role and Job Description for better AI analysis */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        <i className="ri-target-line text-blue-600 mr-2" />
                        Optional: Enhance Analysis
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Target Role (Optional)
                          </label>
                          <input
                            type="text"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="e.g., Full Stack Developer, Data Scientist"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Job Description (Optional)
                          </label>
                          <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste job description for targeted analysis..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                          />
                        </div>
                      </div>
                    </div>
                    <UploadSection onFileUpload={handleFileUpload} />
                  </motion.div>
                )}

                {currentStep === 'analyzing' && (
                  <motion.div
                    key="analyzing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-center min-h-96"
                  >
                    <div className="text-center">
                      <motion.div
                        className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.h3
                        className="text-2xl font-semibold text-gray-900 dark:text-white mb-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        Analyzing Your Resume
                      </motion.h3>
                      <motion.p
                        className="text-gray-600 dark:text-gray-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        Extracting data and generating insights...
                      </motion.p>
                    </div>
                  </motion.div>
                )}

                {currentStep === 'results' && extractedData && analysis && analysis.breakdown && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                  >
                    {/* Score Overview */}
                    <ScoreVisualization score={score} breakdown={analysis.breakdown} />

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column - Extracted Data */}
                      <div className="space-y-6">
                        <ExtractedDataPanel data={extractedData} />
                      </div>

                      {/* Right Column - Analysis & Recommendations */}
                      <div className="space-y-6">
                        <AnalysisPanel analysis={analysis} />
                        {analysis.recommendations && analysis.recommendations.length > 0 && (
                          <RecommendationsPanel recommendations={analysis.recommendations} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Error State - Show if results step but no data */}
                {currentStep === 'results' && (!extractedData || !analysis || !analysis.breakdown) && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <i className="ri-error-warning-line text-6xl text-red-500 mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                      Analysis Error
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Unable to generate analysis. Please try uploading your resume again.
                    </p>
                    <button
                      onClick={() => {
                        setCurrentStep('upload');
                        setUploadedFile(null);
                        setExtractedData(null);
                        setAnalysis(null);
                      }}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

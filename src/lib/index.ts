export { supabase } from './supabaseClient';
export type { Database } from './supabaseClient';

// A4F Service
export { generateQuestionsA4F, checkA4FHealth } from './a4fService';
export type { A4FQuestionRequest, A4FQuestion, A4FQuestionResponse } from './a4fService';

// AI Services
export { evaluateTextAnswer, evaluateCodeSubmission } from './aiEvaluationService';
export type { AnswerEvaluation, CodeEvaluation, EvaluationRequest } from './aiEvaluationService';

export { analyzeResume, getKeywordSuggestions } from './aiResumeService';
export type { ResumeAnalysis, ResumeImprovement, ResumeAnalysisRequest } from './aiResumeService';

export { generateLearningPath, recommendTopics, adjustDifficulty } from './aiLearningService';
export type { LearningPath, LearningModule, LearningResource, PerformanceData, LearningPathRequest } from './aiLearningService';

// Phase 2: New AI Services
export * from './aiInterviewPrepService';
export * from './aiTranscriptionService';
export * from './aiPortfolioService';
export * from './aiAnalyticsService';
export * from './aiJobDescriptionService';

// Phase 4: Challenge Arena & Scheduling
export * from './aiChallengeService';
export * from './aiSchedulingService';

// AI Mock Interview Simulator
export * from './aiMockInterviewService';


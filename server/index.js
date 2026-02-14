import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// System prompt template
const SYSTEM_PROMPT_TEMPLATE = `
You are an AI assistant generating unique mock interview questions.

### Objective:
Generate {num_questions} questions tailored to the configuration below.

### Configuration:
- Roles: {roles}
- Difficulty: {level}
- Interview Type: {interview_type} (technical, behavioural, or mix)
- Question Types: {question_types} (mcq, qa, code, debugging)
- Duration: {duration_min} minutes
- Input Mode: {input_mode} (text, voice, both)
- Resume Summary: {resume_summary}

### Guidelines:
1. Align the difficulty with the selected level: easy questions are straightforward, medium questions require moderate thought, and hard questions involve deeper reasoning.

2. For each question, return a JSON object with these keys:
   id (uuid), type ("mcq" | "qa" | "code" | "debugging"), role, level, tags (skills/topics),
   prompt, options (array of 4 strings for MCQ), correctAnswer (number index for MCQ or string for Q&A),
   codeSnippet (string, only for code/debugging questions),
   tests (array of {name, input, expected} objects, only for code/debugging questions),
   estimatedTime (estimated time in seconds),
   hint (optional string for hints),
   language (optional string for code questions, default "javascript"),
   rubricTarget (string indicating what to evaluate: "accuracy", "depth", "structure", "general").

3. Do not reuse IDs from the provided "usedIds".

4. For behavioural questions, encourage structured responses (e.g. STAR).

5. If resume_summary contains skills or projects, weave them into at least two questions.

6. Create a balanced mix of question types according to the "question_types" array.

7. Ensure the sum of estimatedTime does not exceed the duration in seconds.

8. Return a pure JSON array of question objects, with no additional commentary.

9. For MCQ questions, ensure correctAnswer is a number (0-3) representing the index of the correct option.

10. For code questions, include starterCode or codeSnippet with the initial code to work with.

11. For debugging questions, include codeSnippet with buggy code that needs to be fixed.
`.trim();

// API Route: Generate questions using A4F
app.post('/api/generate-questions-a4f', async (req, res) => {
  try {
    const {
      roles,
      level,
      interviewType,
      questionTypes,
      durationMin,
      inputMode,
      resumeText,
      usedIds = [],
      userId
    } = req.body;

    // Validation
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid roles field.' });
    }
    if (!level || !['easy', 'medium', 'hard'].includes(level)) {
      return res.status(400).json({ error: 'Missing or invalid level field.' });
    }
    if (!interviewType || !['technical', 'behavioural', 'mix'].includes(interviewType)) {
      return res.status(400).json({ error: 'Missing or invalid interviewType field.' });
    }
    if (!questionTypes || !Array.isArray(questionTypes) || questionTypes.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid questionTypes field.' });
    }
    if (!durationMin || typeof durationMin !== 'number' || durationMin < 5) {
      return res.status(400).json({ error: 'Missing or invalid durationMin field.' });
    }
    if (!inputMode || !['text', 'voice', 'text-voice'].includes(inputMode)) {
      return res.status(400).json({ error: 'Missing or invalid inputMode field.' });
    }

    // Get A4F configuration from environment variables
    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.status(500).json({ error: 'A4F API key not configured.' });
    }

    // Compute desired number of questions (1 every 2-4 minutes, min 8, max 15)
    const baseCount = Math.max(8, Math.min(Math.floor(durationMin / 3), 15));

    // Build system prompt
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE
      .replace(/{num_questions}/g, baseCount.toString())
      .replace(/{roles}/g, roles.join(', '))
      .replace(/{level}/g, level)
      .replace(/{interview_type}/g, interviewType)
      .replace(/{question_types}/g, questionTypes.join(', '))
      .replace(/{duration_min}/g, durationMin.toString())
      .replace(/{input_mode}/g, inputMode)
      .replace(/{resume_summary}/g, resumeText?.trim() || 'None');

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: JSON.stringify({
          roles,
          level,
          interviewType,
          questionTypes,
          durationMin,
          inputMode,
          usedIds,
          resumeText: resumeText?.trim() || 'None'
        })
      }
    ];

    // Call A4F chat completions
    const headers = {
      'Authorization': `Bearer ${A4F_API_KEY}`,
      'Content-Type': 'application/json',
      'x-a4f-cache': 'read', // Enable caching for better performance
    };

    // Add user ID metadata header if provided
    if (userId) {
      headers['x-a4f-metadata-user-id'] = userId;
    }

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: A4F_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('A4F API Error:', errorText);
      return res.status(response.status).json({
        error: 'Failed to generate questions from A4F API.',
        details: errorText
      });
    }

    // Parse response
    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      const text = await response.text();
      console.error('Failed to parse A4F response:', text);
      return res.status(502).json({ error: 'Invalid JSON response from A4F.' });
    }

    // Extract questions from response
    let questionSet = [];

    if (responseData.choices && responseData.choices[0] && responseData.choices[0].message) {
      const content = responseData.choices[0].message.content;
      console.log('A4F Response content type:', typeof content);
      console.log('A4F Response content preview:', content?.substring(0, 200));

      try {
        // Clean content - remove markdown code blocks if present
        let cleanedContent = content;
        if (typeof content === 'string') {
          // Remove markdown code blocks (```json ... ``` or ``` ... ```)
          cleanedContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
          // Also handle if it's wrapped in a code block
          const codeBlockMatch = cleanedContent.match(/```[\s\S]*?```/);
          if (codeBlockMatch) {
            cleanedContent = codeBlockMatch[0].replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim();
          }

          // Remove JavaScript-specific syntax that's not valid JSON
          cleanedContent = cleanedContent
            // Remove arrow functions like () => {}
            .replace(/:\s*\(\)\s*=>\s*\{[^}]*\}/g, ': null')
            .replace(/:\s*\([^)]*\)\s*=>\s*\{[^}]*\}/g, ': null')
            // Remove function keywords
            .replace(/:\s*function\s*\([^)]*\)\s*\{[^}]*\}/g, ': null')
            // Fix common JSON issues: smart quotes, trailing commas
            .replace(/['']/g, "'")  // Replace smart single quotes
            .replace(/[""]/g, '"')  // Replace smart double quotes
            .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
            .trim();
        }

        // Try to parse as JSON with better error handling
        let parsed;
        try {
          parsed = typeof cleanedContent === 'string' ? JSON.parse(cleanedContent) : cleanedContent;
        } catch (parseError) {
          // Try to extract just the JSON array/object if wrapped in text
          const jsonArrayMatch = cleanedContent.match(/\[[\s\S]*\]/);
          const jsonObjectMatch = cleanedContent.match(/\{[\s\S]*\}/);

          if (jsonArrayMatch) {
            try {
              parsed = JSON.parse(jsonArrayMatch[0]);
            } catch (e) {
              console.error('Failed to parse extracted array:', e.message);
              throw parseError;
            }
          } else if (jsonObjectMatch) {
            try {
              parsed = JSON.parse(jsonObjectMatch[0]);
            } catch (e) {
              console.error('Failed to parse extracted object:', e.message);
              throw parseError;
            }
          } else {
            throw parseError;
          }
        }
        console.log('Parsed content type:', typeof parsed);
        console.log('Parsed content keys:', Object.keys(parsed || {}));

        // Handle different response formats
        if (parsed.questions && Array.isArray(parsed.questions)) {
          questionSet = parsed.questions;
          console.log('Found questions in parsed.questions:', questionSet.length);
        } else if (Array.isArray(parsed)) {
          questionSet = parsed;
          console.log('Found questions as array:', questionSet.length);
        } else if (parsed.data && Array.isArray(parsed.data)) {
          questionSet = parsed.data;
          console.log('Found questions in parsed.data:', questionSet.length);
        } else {
          // Try to extract JSON array from text
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            questionSet = JSON.parse(jsonMatch[0]);
            console.log('Extracted questions from text match:', questionSet.length);
          } else {
            console.error('Could not find questions in response. Full parsed:', JSON.stringify(parsed, null, 2).substring(0, 500));
            return res.status(502).json({
              error: 'Failed to extract questions from A4F response.',
              details: 'Response format not recognized. Expected questions array or object with questions property.'
            });
          }
        }
      } catch (parseError) {
        console.error('Failed to parse questions from response:', parseError);
        console.error('Raw content:', content?.substring(0, 500));
        return res.status(502).json({
          error: 'Failed to parse questions from A4F response.',
          details: parseError.message
        });
      }
    } else {
      console.error('Unexpected A4F response structure:', JSON.stringify(responseData, null, 2).substring(0, 500));
      return res.status(502).json({
        error: 'Unexpected response format from A4F API.',
        details: 'Response does not contain expected choices structure'
      });
    }

    // Filter out any repeated IDs (usedIds)
    const uniqueQuestions = questionSet.filter(q => !usedIds.includes(q.id));

    // Normalize question format to match frontend expectations
    const normalizedQuestions = uniqueQuestions.map(q => ({
      id: q.id || `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: q.type || 'qa',
      prompt: q.prompt || q.question || '',
      options: q.options || [],
      correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : (q.correct !== undefined ? q.correct : null),
      hint: q.hint || null,
      language: q.language || q.language || 'javascript',
      codeSnippet: q.codeSnippet || q.starterCode || q.code || null,
      skill: q.role || roles[0] || 'General',
      difficulty: q.level || level,
      tags: q.tags || [q.role || roles[0] || 'general'],
      estimatedTime: q.estimatedTime || q.est_time_s || 120,
      rubricTarget: q.rubricTarget || 'general',
      tests: q.tests || null
    }));

    return res.status(200).json({
      questions: normalizedQuestions,
      source: 'a4f',
      count: normalizedQuestions.length
    });

  } catch (error) {
    console.error('Error in generate-questions-a4f:', error);
    return res.status(500).json({
      error: 'Internal server error while generating questions.',
      details: error.message
    });
  }
});

// ============================================
// AI Evaluation API Routes
// ============================================

// Evaluate text answer (Q&A, behavioral)
app.post('/api/ai/evaluate-answer', async (req, res) => {
  try {
    const { answer, question } = req.body;

    if (!answer || !question) {
      return res.status(400).json({ error: 'Missing answer or question' });
    }

    // Use A4F API for evaluation
    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      // Fallback to basic evaluation
      return res.json(generateBasicEvaluation(answer, question));
    }

    const evaluationPrompt = `Evaluate this interview answer and provide detailed feedback.

Question: ${question.prompt}
Answer: ${answer}

Provide a JSON response with:
- score (0-100)
- rubric: { clarity, depth, relevance, structure, communication, accuracy } (each 0-10)
- feedback: detailed feedback string
- strengths: array of strengths
- improvements: array of improvement suggestions
- suggestions: array of actionable suggestions

Focus on: ${question.rubricTarget || 'general'}`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert interview evaluator. Return only valid JSON.' },
          { role: 'user', content: evaluationPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json(generateBasicEvaluation(answer, question));
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json(parsed);
      } catch (e) {
        return res.json(generateBasicEvaluation(answer, question));
      }
    }

    return res.json(generateBasicEvaluation(answer, question));
  } catch (error) {
    console.error('Error evaluating answer:', error);
    const { answer, question } = req.body;
    return res.json(generateBasicEvaluation(answer || '', question || {}));
  }
});

// Evaluate code submission
app.post('/api/ai/evaluate-code', async (req, res) => {
  try {
    const { code, question, language } = req.body;

    if (!code || !question) {
      return res.status(400).json({ error: 'Missing code or question' });
    }

    // Use A4F API for code evaluation
    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json(generateBasicCodeEvaluation(code, question));
    }

    const evaluationPrompt = `Review this code submission for an interview question.

Question: ${question.prompt}
Language: ${language || 'javascript'}
Code:
\`\`\`${language || 'javascript'}
${code}
\`\`\`

Provide a JSON response with:
- score (0-100)
- correctness (0-10)
- efficiency (0-10)
- bestPractices (0-10)
- feedback: detailed feedback string
- improvements: array of improvement suggestions
- testResults: { passed: 0, total: 0 }`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert code reviewer. Return only valid JSON.' },
          { role: 'user', content: evaluationPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json(generateBasicCodeEvaluation(code, question));
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json(parsed);
      } catch (e) {
        return res.json(generateBasicCodeEvaluation(code, question));
      }
    }

    return res.json(generateBasicCodeEvaluation(code, question));
  } catch (error) {
    console.error('Error evaluating code:', error);
    const { code, question } = req.body;
    return res.json(generateBasicCodeEvaluation(code || '', question || {}));
  }
});

// Analyze resume
app.post('/api/ai/analyze-resume', async (req, res) => {
  try {
    const { resumeText, targetRole, jobDescription } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: 'Missing resume text' });
    }

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json(generateBasicResumeAnalysis(resumeText, targetRole));
    }

    const analysisPrompt = `Analyze this resume for ATS compatibility and optimization.

Resume:
${resumeText}

${targetRole ? `Target Role: ${targetRole}` : ''}
${jobDescription ? `Job Description:\n${jobDescription}` : ''}

Provide a JSON response with:
- atsScore (0-100)
- keywordScore (0-100)
- overallScore (0-100)
- suggestions: array of { type: "critical"|"important"|"suggestion", category: string, message: string }
- missingKeywords: array of strings
- strengths: array of strings
- improvements: array of { section: string, current: string, suggested: string, reason: string }
${jobDescription ? '- skillGap: { required: string[], missing: string[], match: number }' : ''}`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert resume reviewer and ATS specialist. Return only valid JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json(generateBasicResumeAnalysis(resumeText, targetRole));
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json(parsed);
      } catch (e) {
        return res.json(generateBasicResumeAnalysis(resumeText, targetRole));
      }
    }

    return res.json(generateBasicResumeAnalysis(resumeText, targetRole));
  } catch (error) {
    console.error('Error analyzing resume:', error);
    const { resumeText, targetRole } = req.body;
    return res.json(generateBasicResumeAnalysis(resumeText || '', targetRole));
  }
});

// Get keyword suggestions
app.post('/api/ai/resume-keywords', async (req, res) => {
  try {
    const { role, resumeText } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Missing role' });
    }

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json({ keywords: [] });
    }

    const prompt = `Suggest 10-15 important keywords for a ${role} resume. 
${resumeText ? `Current resume:\n${resumeText.substring(0, 500)}` : ''}

Return JSON with: { keywords: string[] }`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json({ keywords: [] });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json({ keywords: parsed.keywords || [] });
      } catch (e) {
        return res.json({ keywords: [] });
      }
    }

    return res.json({ keywords: [] });
  } catch (error) {
    console.error('Error getting keywords:', error);
    return res.json({ keywords: [] });
  }
});

// Generate learning path
app.post('/api/ai/learning-path', async (req, res) => {
  try {
    const { userId, targetRole, performanceData, availableHoursPerWeek } = req.body;

    if (!userId || !targetRole || !performanceData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json(generateBasicLearningPath(userId, targetRole, performanceData, availableHoursPerWeek));
    }

    const prompt = `Create a personalized learning path for a ${targetRole} interview preparation.

Performance Data:
- Weak Areas: ${performanceData.weakAreas?.join(', ') || 'None'}
- Strong Areas: ${performanceData.strongAreas?.join(', ') || 'None'}
- Recent Scores: ${performanceData.recentScores?.join(', ') || 'None'}
- Available Hours/Week: ${availableHoursPerWeek || 10}

Return JSON with:
- id: string
- userId: string
- targetRole: string
- estimatedDuration: number (days)
- modules: array of {
    id: string,
    title: string,
    description: string,
    topics: string[],
    estimatedTime: number (hours),
    difficulty: "easy"|"medium"|"hard",
    order: number,
    completed: boolean,
    resources: array of { type: "article"|"video"|"practice"|"quiz", title: string, description: string }
  }
- currentModule: number
- progress: number (0-100)
- createdAt: string
- updatedAt: string`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert learning path designer. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json(generateBasicLearningPath(userId, targetRole, performanceData, availableHoursPerWeek));
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        // Ensure required fields
        parsed.id = parsed.id || `path-${Date.now()}`;
        parsed.userId = userId;
        parsed.createdAt = parsed.createdAt || new Date().toISOString();
        parsed.updatedAt = parsed.updatedAt || new Date().toISOString();
        return res.json(parsed);
      } catch (e) {
        return res.json(generateBasicLearningPath(userId, targetRole, performanceData, availableHoursPerWeek));
      }
    }

    return res.json(generateBasicLearningPath(userId, targetRole, performanceData, availableHoursPerWeek));
  } catch (error) {
    console.error('Error generating learning path:', error);
    const { userId, targetRole, performanceData, availableHoursPerWeek } = req.body;
    return res.json(generateBasicLearningPath(userId || 'user', targetRole || 'General', performanceData || {}, availableHoursPerWeek || 10));
  }
});

// Recommend topics
app.post('/api/ai/recommend-topics', async (req, res) => {
  try {
    const { weakAreas, targetRole } = req.body;

    if (!weakAreas || !Array.isArray(weakAreas) || weakAreas.length === 0) {
      return res.json({ topics: [] });
    }

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json({ topics: weakAreas });
    }

    const prompt = `Recommend 5-10 specific topics to study for ${targetRole} interview preparation based on these weak areas: ${weakAreas.join(', ')}.

Return JSON with: { topics: string[] }`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json({ topics: weakAreas });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json({ topics: parsed.topics || weakAreas });
      } catch (e) {
        return res.json({ topics: weakAreas });
      }
    }

    return res.json({ topics: weakAreas });
  } catch (error) {
    console.error('Error recommending topics:', error);
    return res.json({ topics: req.body.weakAreas || [] });
  }
});

// Helper functions for fallback evaluations
function generateBasicEvaluation(answer, question) {
  const words = answer.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  const clarity = Math.min(10, Math.max(1, wordCount > 20 ? 8 : wordCount / 3));
  const depth = Math.min(10, Math.max(1, wordCount > 50 ? 9 : wordCount / 6));
  const relevance = 7;
  const structure = answer.toLowerCase().includes('situation') ||
    answer.toLowerCase().includes('task') ||
    answer.toLowerCase().includes('action') ||
    answer.toLowerCase().includes('result') ? 9 : 6;
  const communication = Math.min(10, Math.max(1, wordCount > 30 ? 8 : wordCount / 4));
  const accuracy = 7;

  const avgScore = (clarity + depth + relevance + structure + communication + accuracy) / 6;
  const overallScore = Math.round((avgScore / 10) * 100);

  return {
    score: overallScore,
    rubric: { clarity, depth, relevance, structure, communication, accuracy },
    feedback: 'Basic evaluation completed. Enable AI evaluation for detailed feedback.',
    strengths: wordCount > 30 ? ['Good length', 'Detailed response'] : ['Response provided'],
    improvements: wordCount < 30 ? ['Provide more detail', 'Expand on your points'] : [],
    suggestions: ['Consider using the STAR method for behavioral questions'],
  };
}

function generateBasicCodeEvaluation(code, question) {
  const codeLength = code?.length || 0;
  const hasFunction = code?.includes('function') || code?.includes('=>');
  const hasReturn = code?.includes('return');

  const correctness = hasFunction && hasReturn ? 7 : 5;
  const efficiency = codeLength > 50 ? 7 : 5;
  const bestPractices = hasFunction ? 6 : 4;

  const avgScore = (correctness + efficiency + bestPractices) / 3;
  const overallScore = Math.round((avgScore / 10) * 100);

  return {
    score: overallScore,
    correctness,
    efficiency,
    bestPractices,
    testResults: { passed: 0, total: 0 },
    feedback: 'Basic code evaluation completed. Enable AI evaluation for detailed feedback.',
    improvements: ['Add error handling', 'Consider edge cases', 'Add comments for clarity'],
  };
}

function generateBasicResumeAnalysis(resumeText, targetRole) {
  const resume = resumeText.toLowerCase();
  const hasEmail = /[\w\.-]+@[\w\.-]+\.\w+/.test(resumeText);
  const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
  const hasExperience = resume.includes('experience') || resume.includes('work');
  const hasEducation = resume.includes('education') || resume.includes('degree');
  const hasSkills = resume.includes('skill') || resume.includes('technical');

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

function generateBasicLearningPath(userId, targetRole, performanceData, availableHoursPerWeek) {
  const weakAreas = performanceData.weakAreas || [];
  const modules = weakAreas.slice(0, 5).map((area, index) => ({
    id: `module-${index + 1}`,
    title: `Master ${area}`,
    description: `Focus on improving your ${area} skills`,
    topics: [area, `${area} fundamentals`, `${area} best practices`],
    estimatedTime: 5,
    difficulty: 'medium',
    order: index + 1,
    completed: false,
    resources: [
      { type: 'article', title: `${area} Guide`, description: `Learn the fundamentals of ${area}` },
      { type: 'practice', title: `${area} Practice Questions`, description: `Practice ${area} interview questions` },
    ],
  }));

  if (modules.length === 0) {
    modules.push({
      id: 'module-1',
      title: `${targetRole} Fundamentals`,
      description: `Core concepts for ${targetRole}`,
      topics: ['Core concepts', 'Best practices', 'Common patterns'],
      estimatedTime: 5,
      difficulty: 'medium',
      order: 1,
      completed: false,
      resources: [
        { type: 'article', title: `${targetRole} Overview`, description: 'Introduction to key concepts' },
      ],
    });
  }

  const totalHours = modules.reduce((sum, m) => sum + m.estimatedTime, 0);
  const estimatedDuration = Math.ceil(totalHours / (availableHoursPerWeek || 10));

  return {
    id: `path-${Date.now()}`,
    userId,
    targetRole,
    estimatedDuration,
    modules,
    currentModule: 0,
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================
// Phase 2: Interview Preparation Assistant
// ============================================

// Get interview preparation tips
app.post('/api/ai/prep-tips', async (req, res) => {
  try {
    const { targetRole, interviewType } = req.body;

    if (!targetRole) {
      return res.status(400).json({ error: 'Missing targetRole' });
    }

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json({ tips: generateDefaultPrepTips(targetRole, interviewType) });
    }

    const prompt = `Generate 5-7 personalized interview preparation tips for a ${targetRole} role.
Interview Type: ${interviewType || 'mix'}
Focus on practical, actionable advice.

Return JSON with: { tips: array of { id, category, title, content, priority, tags } }`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert interview coach. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json({ tips: generateDefaultPrepTips(targetRole, interviewType) });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json({ tips: parsed.tips || generateDefaultPrepTips(targetRole, interviewType) });
      } catch (e) {
        return res.json({ tips: generateDefaultPrepTips(targetRole, interviewType) });
      }
    }

    return res.json({ tips: generateDefaultPrepTips(targetRole, interviewType) });
  } catch (error) {
    console.error('Error getting prep tips:', error);
    const { targetRole, interviewType } = req.body;
    return res.json({ tips: generateDefaultPrepTips(targetRole || 'Software Engineer', interviewType || 'mix') });
  }
});

// ============================================
// Phase 2: Portfolio Project Suggestions
// ============================================

// Get portfolio project suggestions
app.post('/api/ai/portfolio-suggestions', async (req, res) => {
  try {
    const { currentSkills, targetRole, experienceLevel, existingProjects, interests, timeAvailable } = req.body;

    if (!targetRole) {
      return res.status(400).json({ error: 'Missing targetRole' });
    }

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json({ suggestions: generateDefaultProjectSuggestions(req.body) });
    }

    const prompt = `Suggest 5 portfolio projects for a ${targetRole} role.
Current Skills: ${currentSkills?.join(', ') || 'Not specified'}
Experience Level: ${experienceLevel || 'mid'}
Existing Projects: ${existingProjects?.join(', ') || 'None'}
Time Available: ${timeAvailable || 'medium'}

Return JSON with: { suggestions: array of { id, title, description, category, techStack, difficulty, estimatedTime, learningOutcomes, whyRelevant, resources } }`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert portfolio advisor. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json({ suggestions: generateDefaultProjectSuggestions(req.body) });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json({ suggestions: parsed.suggestions || generateDefaultProjectSuggestions(req.body) });
      } catch (e) {
        return res.json({ suggestions: generateDefaultProjectSuggestions(req.body) });
      }
    }

    return res.json({ suggestions: generateDefaultProjectSuggestions(req.body) });
  } catch (error) {
    console.error('Error getting portfolio suggestions:', error);
    return res.json({ suggestions: generateDefaultProjectSuggestions(req.body || {}) });
  }
});

// Analyze portfolio
app.post('/api/ai/portfolio-analysis', async (req, res) => {
  try {
    const { projects, targetRole, currentSkills } = req.body;

    if (!projects || !Array.isArray(projects)) {
      return res.status(400).json({ error: 'Missing or invalid projects' });
    }

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json(generateDefaultPortfolioAnalysis(projects, targetRole, currentSkills));
    }

    const prompt = `Analyze this portfolio for a ${targetRole} role.
Projects: ${JSON.stringify(projects)}
Current Skills: ${currentSkills?.join(', ') || 'Not specified'}

Return JSON with: { strengths, gaps, recommendations, nextProjects }`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert portfolio reviewer. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json(generateDefaultPortfolioAnalysis(projects, targetRole, currentSkills));
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json(parsed);
      } catch (e) {
        return res.json(generateDefaultPortfolioAnalysis(projects, targetRole, currentSkills));
      }
    }

    return res.json(generateDefaultPortfolioAnalysis(projects, targetRole, currentSkills));
  } catch (error) {
    console.error('Error analyzing portfolio:', error);
    const { projects, targetRole, currentSkills } = req.body;
    return res.json(generateDefaultPortfolioAnalysis(projects || [], targetRole || 'Software Engineer', currentSkills || []));
  }
});

// ============================================
// Phase 2: Analytics and Insights
// ============================================

// Get analytics insights
app.post('/api/ai/analytics-insights', async (req, res) => {
  try {
    const { userId, interviews, skills, timeRange } = req.body;

    if (!interviews || !Array.isArray(interviews)) {
      return res.status(400).json({ error: 'Missing or invalid interviews data' });
    }

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json({ insights: generateDefaultAnalyticsInsights(req.body) });
    }

    const prompt = `Analyze interview performance data and provide insights.
Interviews: ${JSON.stringify(interviews.slice(0, 10))}
Skills Data: ${JSON.stringify(skills?.slice(0, 10) || [])}
Time Range: ${timeRange || 'all'}

Return JSON with: { insights: array of { id, title, description, type, priority, data, actionableSteps } }`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert performance analyst. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json({ insights: generateDefaultAnalyticsInsights(req.body) });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json({ insights: parsed.insights || generateDefaultAnalyticsInsights(req.body) });
      } catch (e) {
        return res.json({ insights: generateDefaultAnalyticsInsights(req.body) });
      }
    }

    return res.json({ insights: generateDefaultAnalyticsInsights(req.body) });
  } catch (error) {
    console.error('Error getting analytics insights:', error);
    return res.json({ insights: generateDefaultAnalyticsInsights(req.body || {}) });
  }
});

// Predict success probability
app.post('/api/ai/predict-success', async (req, res) => {
  try {
    const { userId, targetRole, recentPerformance } = req.body;

    if (!targetRole || !Array.isArray(recentPerformance)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Simple heuristic-based prediction
    const avgScore = recentPerformance.length > 0
      ? recentPerformance.reduce((a, b) => a + b, 0) / recentPerformance.length
      : 50;

    const probability = Math.min(95, Math.max(20, avgScore + (recentPerformance.length > 3 ? 10 : 0)));

    return res.json({ probability: Math.round(probability) });
  } catch (error) {
    console.error('Error predicting success:', error);
    return res.json({ probability: 50 });
  }
});

// Identify weaknesses
app.post('/api/ai/identify-weaknesses', async (req, res) => {
  try {
    const { interviews, skills } = req.body;

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json({ weaknesses: generateDefaultWeaknesses(interviews, skills) });
    }

    const prompt = `Analyze interview and skills data to identify weaknesses.
Interviews: ${JSON.stringify(interviews?.slice(0, 10) || [])}
Skills: ${JSON.stringify(skills?.slice(0, 10) || [])}

Return JSON with: { weaknesses: array of { area, frequency, impact, recommendations } }`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert performance analyst. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json({ weaknesses: generateDefaultWeaknesses(interviews, skills) });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json({ weaknesses: parsed.weaknesses || generateDefaultWeaknesses(interviews, skills) });
      } catch (e) {
        return res.json({ weaknesses: generateDefaultWeaknesses(interviews, skills) });
      }
    }

    return res.json({ weaknesses: generateDefaultWeaknesses(interviews, skills) });
  } catch (error) {
    console.error('Error identifying weaknesses:', error);
    return res.json({ weaknesses: generateDefaultWeaknesses(req.body?.interviews || [], req.body?.skills || []) });
  }
});

// ============================================
// Phase 2: Job Description Analysis
// ============================================

// Parse job description
app.post('/api/ai/parse-job-description', async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: 'Missing jobDescription' });
    }

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json({ parsed: parseJobDescriptionFallback(jobDescription) });
    }

    const prompt = `Parse this job description and extract structured information.

Job Description:
${jobDescription}

Return JSON with: { parsed: { title, company, location, requiredSkills, preferredSkills, experienceLevel, responsibilities, qualifications, benefits, salaryRange } }`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert job description parser. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json({ parsed: parseJobDescriptionFallback(jobDescription) });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json({ parsed: parsed.parsed || parseJobDescriptionFallback(jobDescription) });
      } catch (e) {
        return res.json({ parsed: parseJobDescriptionFallback(jobDescription) });
      }
    }

    return res.json({ parsed: parseJobDescriptionFallback(jobDescription) });
  } catch (error) {
    console.error('Error parsing job description:', error);
    return res.json({ parsed: parseJobDescriptionFallback(req.body?.jobDescription || '') });
  }
});

// Job match analysis
app.post('/api/ai/job-match-analysis', async (req, res) => {
  try {
    const { jobDescription, userSkills, userExperience, targetRole } = req.body;

    if (!jobDescription || !userSkills || !Array.isArray(userSkills)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json({ analysis: generateDefaultJobMatchAnalysis(req.body) });
    }

    const prompt = `Analyze job match between user profile and job description.

Job Description:
${jobDescription}

User Skills: ${userSkills.join(', ')}
User Experience: ${userExperience}
Target Role: ${targetRole || 'Not specified'}

Return JSON with: { analysis: { overallMatch, skillMatch, experienceMatch, skillMatches, missingSkills, strongMatches, recommendations, interviewPrep } }`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert career advisor. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json({ analysis: generateDefaultJobMatchAnalysis(req.body) });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json({ analysis: parsed.analysis || generateDefaultJobMatchAnalysis(req.body) });
      } catch (e) {
        return res.json({ analysis: generateDefaultJobMatchAnalysis(req.body) });
      }
    }

    return res.json({ analysis: generateDefaultJobMatchAnalysis(req.body) });
  } catch (error) {
    console.error('Error analyzing job match:', error);
    return res.json({ analysis: generateDefaultJobMatchAnalysis(req.body || {}) });
  }
});

// Helper functions for fallback responses
function generateDefaultPrepTips(targetRole, interviewType) {
  return [
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
  ];
}

function generateDefaultProjectSuggestions(request) {
  return [
    {
      id: 'suggestion-1',
      title: 'E-Commerce Platform',
      description: 'Build a full-featured e-commerce platform',
      category: 'Web Development',
      techStack: ['React', 'Node.js', 'PostgreSQL'],
      difficulty: 'intermediate',
      estimatedTime: '3-4 weeks',
      learningOutcomes: ['Full-stack development', 'Payment integration'],
      whyRelevant: 'Demonstrates real-world application development',
      resources: [],
    },
  ];
}

function generateDefaultPortfolioAnalysis(projects, targetRole, currentSkills) {
  return {
    strengths: ['Good project diversity'],
    gaps: [],
    recommendations: ['Continue building projects'],
    nextProjects: generateDefaultProjectSuggestions({ targetRole, currentSkills }),
  };
}

function generateDefaultAnalyticsInsights(request) {
  return [
    {
      id: 'insight-1',
      title: 'Performance Analysis',
      description: 'Your performance is improving',
      type: 'trend',
      priority: 'medium',
      data: {},
    },
  ];
}

function generateDefaultWeaknesses(interviews, skills) {
  return [];
}

function parseJobDescriptionFallback(jdText) {
  return {
    title: 'Software Engineer',
    requiredSkills: ['JavaScript', 'React'],
    preferredSkills: [],
    experienceLevel: 'mid',
    responsibilities: [],
    qualifications: [],
  };
}

function generateDefaultJobMatchAnalysis(request) {
  return {
    overallMatch: 70,
    skillMatch: 70,
    experienceMatch: 70,
    skillMatches: [],
    missingSkills: [],
    strongMatches: request.userSkills || [],
    recommendations: ['Continue building skills'],
    interviewPrep: {
      likelyQuestions: [],
      focusAreas: [],
      resources: [],
    },
  };
}

// ============================================
// Phase 4: Challenge Arena Enhancements
// ============================================

// Generate AI-powered challenge
app.post('/api/ai/generate-challenge', async (req, res) => {
  try {
    const { domain, difficulty, userPerformance, trendingTopics, targetSkills } = req.body;

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json({ challenge: generateDefaultChallenge(req.body) });
    }

    const prompt = `Generate a coding challenge for ${domain || 'general programming'}.
Difficulty: ${difficulty || 'medium'}
${userPerformance ? `User Performance: Avg Score ${userPerformance.avgScore}%, Weak Areas: ${userPerformance.weakAreas?.join(', ') || 'None'}` : ''}
${targetSkills ? `Target Skills: ${targetSkills.join(', ')}` : ''}

Return JSON with: { challenge: { id, title, description, domain, difficulty, estimatedTime, topics, skills, whyRelevant, questions } }`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert challenge designer. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json({ challenge: generateDefaultChallenge(req.body) });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json({ challenge: parsed.challenge || generateDefaultChallenge(req.body) });
      } catch (e) {
        return res.json({ challenge: generateDefaultChallenge(req.body) });
      }
    }

    return res.json({ challenge: generateDefaultChallenge(req.body) });
  } catch (error) {
    console.error('Error generating challenge:', error);
    return res.json({ challenge: generateDefaultChallenge(req.body || {}) });
  }
});

// Adapt challenge difficulty
app.post('/api/ai/adapt-difficulty', async (req, res) => {
  try {
    const { userPerformance, currentDifficulty } = req.body;

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json({ adaptation: generateDefaultDifficultyAdaptation(userPerformance, currentDifficulty) });
    }

    const prompt = `Analyze user performance and recommend difficulty adjustment.
Current Difficulty: ${currentDifficulty}
Average Score: ${userPerformance.avgScore || 50}%
Recent Scores: ${userPerformance.recentScores?.join(', ') || 'N/A'}
Weak Areas: ${userPerformance.weakAreas?.join(', ') || 'None'}
Strong Areas: ${userPerformance.strongAreas?.join(', ') || 'None'}

Return JSON with: { adaptation: { currentDifficulty, recommendedDifficulty, reason, confidence } }`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert learning analyst. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json({ adaptation: generateDefaultDifficultyAdaptation(userPerformance, currentDifficulty) });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json({ adaptation: parsed.adaptation || generateDefaultDifficultyAdaptation(userPerformance, currentDifficulty) });
      } catch (e) {
        return res.json({ adaptation: generateDefaultDifficultyAdaptation(userPerformance, currentDifficulty) });
      }
    }

    return res.json({ adaptation: generateDefaultDifficultyAdaptation(userPerformance, currentDifficulty) });
  } catch (error) {
    console.error('Error adapting difficulty:', error);
    return res.json({ adaptation: generateDefaultDifficultyAdaptation(req.body?.userPerformance || {}, req.body?.currentDifficulty || 'medium') });
  }
});

// Get domain-specific challenges
app.post('/api/ai/domain-challenges', async (req, res) => {
  try {
    const { domain, count } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Missing domain' });
    }

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json({ challenges: generateDefaultDomainChallenges(domain, count || 3) });
    }

    const prompt = `Generate ${count || 3} coding challenges for ${domain} domain.
Include a mix of easy, medium, and hard difficulties.

Return JSON with: { challenges: array of { id, title, description, domain, difficulty, estimatedTime, topics, skills, whyRelevant, questions } }`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert challenge designer. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json({ challenges: generateDefaultDomainChallenges(domain, count || 3) });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json({ challenges: parsed.challenges || generateDefaultDomainChallenges(domain, count || 3) });
      } catch (e) {
        return res.json({ challenges: generateDefaultDomainChallenges(domain, count || 3) });
      }
    }

    return res.json({ challenges: generateDefaultDomainChallenges(domain, count || 3) });
  } catch (error) {
    console.error('Error getting domain challenges:', error);
    return res.json({ challenges: generateDefaultDomainChallenges(req.body?.domain || 'Web Development', req.body?.count || 3) });
  }
});

// Analyze challenge performance
app.post('/api/ai/analyze-challenge-performance', async (req, res) => {
  try {
    const { challengeId, attempts } = req.body;

    if (!attempts || !Array.isArray(attempts) || attempts.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid attempts data' });
    }

    const scores = attempts.map(a => a.score || 0);
    const times = attempts.map(a => a.timeSpent || 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

    const improvement = attempts.length > 1
      ? ((scores[0] - scores[scores.length - 1]) / scores[scores.length - 1]) * 100
      : 0;

    const recommendations = [];
    if (avgScore < 60) {
      recommendations.push('Focus on fundamental concepts');
    }
    if (avgTime > 30) {
      recommendations.push('Practice time management');
    }

    let nextDifficulty = 'medium';
    if (avgScore >= 80) {
      nextDifficulty = 'hard';
    } else if (avgScore < 50) {
      nextDifficulty = 'easy';
    }

    return res.json({
      analysis: {
        avgScore: Math.round(avgScore),
        avgTime: Math.round(avgTime),
        improvement: Math.round(improvement),
        recommendations: recommendations.length > 0 ? recommendations : ['Keep practicing!'],
        nextDifficulty,
      }
    });
  } catch (error) {
    console.error('Error analyzing challenge performance:', error);
    return res.json({
      analysis: {
        avgScore: 0,
        avgTime: 0,
        improvement: 0,
        recommendations: ['Complete more attempts for better insights'],
        nextDifficulty: 'medium',
      }
    });
  }
});

// ============================================
// Phase 4: Smart Scheduling Assistant
// ============================================

// Suggest optimal times
app.post('/api/ai/suggest-optimal-times', async (req, res) => {
  try {
    const { userId, availableHoursPerWeek, preferredTimes, goals, upcomingInterviews, performanceData } = req.body;

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json({ suggestions: generateDefaultTimeSuggestions(req.body) });
    }

    const prompt = `Suggest optimal practice times for interview preparation.
Available Hours/Week: ${availableHoursPerWeek || 10}
Preferred Times: ${preferredTimes?.join(', ') || 'Any'}
Goals: ${goals?.join(', ') || 'General improvement'}
${performanceData ? `Performance: Avg ${performanceData.recentScores?.[0] || 50}%, Weak Areas: ${performanceData.weakAreas?.join(', ') || 'None'}` : ''}

Return JSON with: { suggestions: array of { date, timeSlots, reason, confidence } }`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert scheduling assistant. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json({ suggestions: generateDefaultTimeSuggestions(req.body) });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json({ suggestions: parsed.suggestions || generateDefaultTimeSuggestions(req.body) });
      } catch (e) {
        return res.json({ suggestions: generateDefaultTimeSuggestions(req.body) });
      }
    }

    return res.json({ suggestions: generateDefaultTimeSuggestions(req.body) });
  } catch (error) {
    console.error('Error suggesting optimal times:', error);
    return res.json({ suggestions: generateDefaultTimeSuggestions(req.body || {}) });
  }
});

// Generate study plan
app.post('/api/ai/generate-study-plan', async (req, res) => {
  try {
    const { userId, availableHoursPerWeek, goals, performanceData } = req.body;

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json({ plan: generateDefaultStudyPlan(req.body) });
    }

    const prompt = `Create a personalized study plan for interview preparation.
Available Hours/Week: ${availableHoursPerWeek || 10}
Goals: ${goals?.join(', ') || 'General improvement'}
${performanceData ? `Weak Areas: ${performanceData.weakAreas?.join(', ') || 'None'}, Strong Areas: ${performanceData.strongAreas?.join(', ') || 'None'}` : ''}

Return JSON with: { plan: { id, duration, sessions, totalHours, goals, createdAt } }`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert study planner. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json({ plan: generateDefaultStudyPlan(req.body) });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json({ plan: parsed.plan || generateDefaultStudyPlan(req.body) });
      } catch (e) {
        return res.json({ plan: generateDefaultStudyPlan(req.body) });
      }
    }

    return res.json({ plan: generateDefaultStudyPlan(req.body) });
  } catch (error) {
    console.error('Error generating study plan:', error);
    return res.json({ plan: generateDefaultStudyPlan(req.body || {}) });
  }
});

// Get smart reminders
app.post('/api/ai/smart-reminders', async (req, res) => {
  try {
    const { userId, upcomingSessions } = req.body;

    if (!upcomingSessions || !Array.isArray(upcomingSessions)) {
      return res.status(400).json({ error: 'Missing upcoming sessions' });
    }

    const reminders = [];
    upcomingSessions.forEach((session, index) => {
      const sessionDate = new Date(session.date);
      const reminderDate = new Date(sessionDate);
      reminderDate.setDate(reminderDate.getDate() - 1);

      reminders.push({
        id: `reminder-${index + 1}`,
        type: 'preparation',
        message: `Don't forget: ${session.title || session.type} is tomorrow`,
        scheduledFor: reminderDate.toISOString(),
        priority: 'high',
      });
    });

    return res.json({ reminders });
  } catch (error) {
    console.error('Error getting smart reminders:', error);
    return res.json({ reminders: [] });
  }
});

// Helper functions for fallback responses
function generateDefaultChallenge(request) {
  const domain = request.domain || 'Web Development';
  const difficulty = request.difficulty || 'medium';
  return {
    id: `challenge-${Date.now()}`,
    title: `${domain} Challenge`,
    description: `Test your ${domain} skills`,
    domain,
    difficulty,
    estimatedTime: 30,
    topics: [domain],
    skills: [domain],
    whyRelevant: `Essential ${domain} practice`,
    questions: [],
  };
}

function generateDefaultDifficultyAdaptation(userPerformance, currentDifficulty) {
  const avgScore = userPerformance?.avgScore || 50;
  let recommendedDifficulty = currentDifficulty;
  let reason = '';

  if (avgScore >= 80 && currentDifficulty !== 'hard') {
    recommendedDifficulty = currentDifficulty === 'easy' ? 'medium' : 'hard';
    reason = 'Your high scores suggest you\'re ready for more challenging problems';
  } else if (avgScore < 50 && currentDifficulty !== 'easy') {
    recommendedDifficulty = currentDifficulty === 'hard' ? 'medium' : 'easy';
    reason = 'Consider practicing with easier challenges to build confidence';
  } else {
    reason = 'Current difficulty level seems appropriate';
  }

  return {
    currentDifficulty,
    recommendedDifficulty,
    reason,
    confidence: 0.7,
  };
}

function generateDefaultDomainChallenges(domain, count) {
  const challenges = [];
  for (let i = 0; i < count; i++) {
    challenges.push({
      id: `challenge-${domain}-${i + 1}`,
      title: `${domain} Challenge ${i + 1}`,
      description: `Practice ${domain} skills`,
      domain,
      difficulty: i === 0 ? 'easy' : i === 1 ? 'medium' : 'hard',
      estimatedTime: (i + 1) * 15,
      topics: [domain],
      skills: [domain],
      whyRelevant: `Essential ${domain} practice`,
      questions: [],
    });
  }
  return challenges;
}

function generateDefaultTimeSuggestions(request) {
  const suggestions = [];
  const now = new Date();

  for (let i = 1; i <= 5; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);

    suggestions.push({
      date: date.toISOString().split('T')[0],
      timeSlots: [
        {
          startTime: new Date(date.setHours(9, 0, 0, 0)).toISOString(),
          endTime: new Date(date.setHours(10, 30, 0, 0)).toISOString(),
          score: 85,
          reason: 'Morning sessions show better retention',
          type: 'optimal',
        },
      ],
      reason: 'Based on optimal learning patterns',
      confidence: 0.7,
    });
  }

  return suggestions;
}

function generateDefaultStudyPlan(request) {
  const hoursPerWeek = request.availableHoursPerWeek || 10;
  const sessions = [];

  for (let i = 0; i < hoursPerWeek; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    sessions.push({
      id: `session-${i + 1}`,
      date: date.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:30',
      duration: 90,
      focus: 'General Practice',
      topics: ['Fundamentals'],
      type: 'practice',
      priority: 'medium',
    });
  }

  return {
    id: `plan-${Date.now()}`,
    duration: 14,
    sessions,
    totalHours: hoursPerWeek * 2,
    goals: request.goals || ['Improve interview skills'],
    createdAt: new Date().toISOString(),
  };
}

// ============================================
// AI-Powered Mock Interview Simulator
// ============================================

// Start mock interview session
app.post('/api/ai/mock-interview/start', async (req, res) => {
  try {
    const { userId, role, level, interviewType } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'Missing userId or role' });
    }

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json({
        sessionId: `session-${Date.now()}`,
        initialQuestion: generateDefaultInterviewQuestion(role, level),
        interviewerPersona: 'friendly-professional'
      });
    }

    const prompt = `You are an AI interviewer conducting a ${interviewType || 'mix'} interview for a ${role} position at ${level || 'mid'} level.

Generate an opening question that:
1. Is appropriate for the role and level
2. Is conversational and natural
3. Sets a professional but friendly tone
4. Invites the candidate to introduce themselves or discuss their experience

Return JSON with: { 
  question: string,
  interviewerPersona: "friendly-professional" | "formal" | "casual",
  context: string (brief context about the interview)
}`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert interviewer. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json({
        sessionId: `session-${Date.now()}`,
        initialQuestion: generateDefaultInterviewQuestion(role, level),
        interviewerPersona: 'friendly-professional'
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json({
          sessionId: `session-${Date.now()}`,
          initialQuestion: parsed.question || generateDefaultInterviewQuestion(role, level),
          interviewerPersona: parsed.interviewerPersona || 'friendly-professional',
          context: parsed.context || ''
        });
      } catch (e) {
        return res.json({
          sessionId: `session-${Date.now()}`,
          initialQuestion: generateDefaultInterviewQuestion(role, level),
          interviewerPersona: 'friendly-professional'
        });
      }
    }

    return res.json({
      sessionId: `session-${Date.now()}`,
      initialQuestion: generateDefaultInterviewQuestion(role, level),
      interviewerPersona: 'friendly-professional'
    });
  } catch (error) {
    console.error('Error starting mock interview:', error);
    return res.json({
      sessionId: `session-${Date.now()}`,
      initialQuestion: generateDefaultInterviewQuestion(req.body?.role || 'Software Engineer', req.body?.level || 'mid'),
      interviewerPersona: 'friendly-professional'
    });
  }
});

// Generate follow-up question based on user response
app.post('/api/ai/mock-interview/follow-up', async (req, res) => {
  try {
    const { sessionId, currentQuestion, userResponse, conversationHistory, role, level } = req.body;

    if (!userResponse || !currentQuestion) {
      return res.status(400).json({ error: 'Missing userResponse or currentQuestion' });
    }

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json({
        question: generateDefaultFollowUpQuestion(currentQuestion, userResponse),
        type: 'follow-up',
        shouldInterrupt: false
      });
    }

    const historyContext = conversationHistory?.slice(-3).map((h) =>
      `Q: ${h.question}\nA: ${h.answer}`
    ).join('\n\n') || '';

    const prompt = `You are conducting a ${role || 'Software Engineer'} interview. 

Previous conversation:
${historyContext}

Current Question: ${currentQuestion}
Candidate's Response: ${userResponse}

Generate a follow-up question that:
1. Builds on the candidate's response
2. Goes deeper into their answer
3. Tests their knowledge or experience
4. Is natural and conversational
5. May interrupt if the answer is too long or off-topic

Return JSON with: {
  question: string,
  type: "follow-up" | "clarification" | "deep-dive" | "new-topic",
  shouldInterrupt: boolean (true if answer was too long/off-topic),
  reasoning: string (brief explanation of why this follow-up)
}`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert interviewer. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json({
        question: generateDefaultFollowUpQuestion(currentQuestion, userResponse),
        type: 'follow-up',
        shouldInterrupt: false
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;
        return res.json({
          question: parsed.question || generateDefaultFollowUpQuestion(currentQuestion, userResponse),
          type: parsed.type || 'follow-up',
          shouldInterrupt: parsed.shouldInterrupt || false,
          reasoning: parsed.reasoning || ''
        });
      } catch (e) {
        return res.json({
          question: generateDefaultFollowUpQuestion(currentQuestion, userResponse),
          type: 'follow-up',
          shouldInterrupt: false
        });
      }
    }

    return res.json({
      question: generateDefaultFollowUpQuestion(currentQuestion, userResponse),
      type: 'follow-up',
      shouldInterrupt: false
    });
  } catch (error) {
    console.error('Error generating follow-up:', error);
    return res.json({
      question: generateDefaultFollowUpQuestion(req.body?.currentQuestion || '', req.body?.userResponse || ''),
      type: 'follow-up',
      shouldInterrupt: false
    });
  }
});

// Analyze speech and provide real-time feedback
app.post('/api/ai/mock-interview/analyze-speech', async (req, res) => {
  try {
    const { transcript, audioDuration, question } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Missing transcript' });
    }

    // Calculate basic metrics
    const words = transcript.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const speakingRate = audioDuration > 0 ? (wordCount / audioDuration) * 60 : 0; // words per minute

    // Detect filler words
    const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'well', 'actually', 'basically'];
    const fillerCount = words.filter(w => fillerWords.includes(w.toLowerCase())).length;
    const fillerPercentage = wordCount > 0 ? (fillerCount / wordCount) * 100 : 0;

    // Calculate pause frequency (approximate)
    const pauses = transcript.match(/\s{2,}/g) || [];
    const pauseCount = pauses.length;

    // Sentiment analysis (basic)
    const positiveWords = ['excellent', 'great', 'successful', 'achieved', 'improved', 'solved', 'optimized'];
    const negativeWords = ['difficult', 'problem', 'issue', 'failed', 'challenge', 'struggled'];
    const positiveCount = words.filter(w => positiveWords.includes(w.toLowerCase())).length;
    const negativeCount = words.filter(w => negativeWords.includes(w.toLowerCase())).length;
    const sentimentScore = wordCount > 0 ? ((positiveCount - negativeCount) / wordCount) * 100 : 0;

    // Clarity score (based on sentence structure)
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
    const clarityScore = Math.max(0, Math.min(100, 100 - Math.abs(avgSentenceLength - 15) * 2));

    // Confidence score (based on speaking rate and filler words)
    const idealRate = 150; // words per minute
    const rateScore = Math.max(0, Math.min(100, 100 - Math.abs(speakingRate - idealRate)));
    const confidenceScore = (rateScore * 0.6) + ((100 - fillerPercentage) * 0.4);

    return res.json({
      metrics: {
        speakingRate: Math.round(speakingRate),
        wordCount,
        fillerCount,
        fillerPercentage: Math.round(fillerPercentage * 10) / 10,
        pauseCount,
        sentimentScore: Math.round(sentimentScore * 10) / 10,
        clarityScore: Math.round(clarityScore),
        confidenceScore: Math.round(confidenceScore)
      },
      feedback: generateSpeechFeedback(speakingRate, fillerPercentage, clarityScore, confidenceScore),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing speech:', error);
    return res.json({
      metrics: {
        speakingRate: 0,
        wordCount: 0,
        fillerCount: 0,
        fillerPercentage: 0,
        pauseCount: 0,
        sentimentScore: 0,
        clarityScore: 0,
        confidenceScore: 0
      },
      feedback: [],
      timestamp: new Date().toISOString()
    });
  }
});

// Get overall interview performance summary
app.post('/api/ai/mock-interview/summary', async (req, res) => {
  try {
    const { sessionId, conversationHistory, metrics } = req.body;

    const A4F_BASE_URL = process.env.A4F_BASE_URL || 'https://api.a4f.co/v1';
    const A4F_API_KEY = process.env.A4F_API_KEY;
    const A4F_MODEL = process.env.A4F_MODEL || 'provider-5/gpt-4o-mini';

    if (!A4F_API_KEY) {
      return res.json({
        summary: generateDefaultSummary(metrics),
        strengths: ['Good communication', 'Clear responses'],
        improvements: ['Reduce filler words', 'Maintain consistent pace'],
        overallScore: calculateOverallScore(metrics)
      });
    }

    const conversationText = conversationHistory?.map((h, idx) =>
      `Question ${idx + 1}: ${h.question}\nAnswer: ${h.answer}`
    ).join('\n\n') || '';

    const totalQuestions = conversationHistory?.length || 0;
    const avgSpeakingRate = metrics?.speakingRate || 0;
    const avgConfidence = metrics?.confidenceScore || 0;
    const avgClarity = metrics?.clarityScore || 0;
    const fillerWords = metrics?.fillerPercentage || 0;

    const prompt = `You are an expert interview coach analyzing a mock interview performance. Provide a detailed, personalized analysis based on the actual conversation content and performance metrics.

INTERVIEW DETAILS:
- Total Questions Answered: ${totalQuestions}
- Speaking Rate: ${avgSpeakingRate} words per minute
- Confidence Score: ${avgConfidence}/100
- Clarity Score: ${avgClarity}/100
- Filler Word Usage: ${fillerWords}%

FULL CONVERSATION:
${conversationText || 'No conversation history available.'}

PERFORMANCE METRICS:
${JSON.stringify(metrics, null, 2)}

ANALYSIS REQUIREMENTS:
1. Read and analyze the ACTUAL conversation content - reference specific questions and answers
2. Identify specific strengths based on what the candidate actually said
3. Identify specific areas for improvement based on their actual responses
4. Provide actionable recommendations tailored to their specific answers
5. Calculate an overall score (0-100) based on both content quality and delivery metrics
6. Make the summary personal and specific - avoid generic statements

IMPORTANT:
- Reference specific questions and answers from the conversation
- Be specific about what they did well or could improve
- Provide concrete examples from their responses
- Make recommendations that are relevant to their actual performance
- The summary should reflect the actual interview content, not generic advice

Return a JSON object with this exact structure:
{
  "summary": "A detailed 2-3 sentence summary that references specific aspects of their performance and answers",
  "strengths": ["Specific strength 1 based on their answers", "Specific strength 2", "Specific strength 3"],
  "improvements": ["Specific area for improvement 1 based on their answers", "Specific area for improvement 2", "Specific area for improvement 3"],
  "overallScore": <number between 0-100>,
  "recommendations": ["Actionable recommendation 1 tailored to their performance", "Actionable recommendation 2", "Actionable recommendation 3", "Actionable recommendation 4"]
}`;

    const response = await fetch(`${A4F_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json',
        'x-a4f-cache': 'read',
      },
      body: JSON.stringify({
        model: A4F_MODEL,
        messages: [
          { role: 'system', content: 'You are an expert interview coach analyzing real interview conversations. Provide detailed, personalized feedback based on actual responses. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.json({
        summary: generateDefaultSummary(metrics),
        strengths: ['Good communication', 'Clear responses'],
        improvements: ['Reduce filler words', 'Maintain consistent pace'],
        overallScore: calculateOverallScore(metrics)
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log('📊 A4F API response received, parsing summary...');

    if (content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()) : content;

        // Validate parsed data - ensure it's not just empty or generic
        if (parsed.summary && parsed.summary.length > 50) {
          console.log('✅ Successfully parsed dynamic summary from A4F API');
          return res.json({
            summary: parsed.summary,
            strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : ['Good engagement with questions'],
            improvements: Array.isArray(parsed.improvements) && parsed.improvements.length > 0 ? parsed.improvements : ['Continue practicing'],
            overallScore: typeof parsed.overallScore === 'number' ? Math.max(0, Math.min(100, parsed.overallScore)) : calculateOverallScore(metrics),
            recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0 ? parsed.recommendations : ['Practice more interview questions']
          });
        } else {
          console.warn('⚠️ Parsed summary too short or invalid, using fallback');
          throw new Error('Summary too short or invalid');
        }
      } catch (e) {
        console.error('❌ Error parsing A4F response:', e);
        console.log('⚠️ Falling back to default summary');
        return res.json({
          summary: generateDefaultSummary(metrics),
          strengths: ['Good communication', 'Clear responses'],
          improvements: ['Reduce filler words', 'Maintain consistent pace'],
          overallScore: calculateOverallScore(metrics),
          recommendations: ['Practice answering common interview questions', 'Record yourself to identify areas for improvement']
        });
      }
    }

    console.warn('⚠️ No content in A4F response, using fallback');
    return res.json({
      summary: generateDefaultSummary(metrics),
      strengths: ['Good communication', 'Clear responses'],
      improvements: ['Reduce filler words', 'Maintain consistent pace'],
      overallScore: calculateOverallScore(metrics),
      recommendations: ['Practice answering common interview questions', 'Record yourself to identify areas for improvement']
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return res.json({
      summary: generateDefaultSummary(req.body?.metrics || {}),
      strengths: ['Good communication'],
      improvements: ['Practice more'],
      overallScore: 50
    });
  }
});

// Helper functions
function generateDefaultInterviewQuestion(role, level) {
  const questions = {
    easy: `Hello! Thanks for taking the time today. Can you tell me a bit about yourself and what interests you about ${role}?`,
    mid: `Hi there! I'd like to start by understanding your background. Can you walk me through your experience with ${role} and what drew you to this field?`,
    senior: `Good to meet you. Let's begin with a high-level overview: Can you describe your approach to ${role} and how you've evolved in your career?`
  };
  return questions[level] || questions.mid;
}

function generateDefaultFollowUpQuestion(currentQuestion, userResponse) {
  if (userResponse.length < 50) {
    return "That's interesting. Can you elaborate on that?";
  }
  if (userResponse.length > 500) {
    return "Great detail! Let me ask you something more specific: Can you give me an example of a challenging project you worked on?";
  }
  return "Can you tell me more about a specific example where you applied that?";
}

function generateSpeechFeedback(rate, fillerPercent, clarity, confidence) {
  const feedback = [];

  if (rate < 100) {
    feedback.push({ type: 'warning', message: 'Speaking pace is slow. Try to speak a bit faster.' });
  } else if (rate > 200) {
    feedback.push({ type: 'warning', message: 'Speaking pace is fast. Slow down for clarity.' });
  } else {
    feedback.push({ type: 'success', message: 'Speaking pace is good.' });
  }

  if (fillerPercent > 5) {
    feedback.push({ type: 'warning', message: `High use of filler words (${fillerPercent.toFixed(1)}%). Practice pausing instead.` });
  } else {
    feedback.push({ type: 'success', message: 'Good use of language with minimal filler words.' });
  }

  if (clarity < 70) {
    feedback.push({ type: 'warning', message: 'Work on structuring your sentences more clearly.' });
  } else {
    feedback.push({ type: 'success', message: 'Clear and well-structured responses.' });
  }

  return feedback;
}

function generateDefaultSummary(metrics) {
  const avgConfidence = metrics?.confidenceScore || 0;
  if (avgConfidence >= 80) {
    return 'Overall strong performance with good communication skills.';
  } else if (avgConfidence >= 60) {
    return 'Good performance with room for improvement in some areas.';
  } else {
    return 'Practice more to improve confidence and clarity.';
  }
}

function calculateOverallScore(metrics) {
  if (!metrics || !metrics.confidenceScore) return 50;
  const scores = [
    metrics.confidenceScore || 50,
    metrics.clarityScore || 50,
    100 - (metrics.fillerPercentage || 0),
    metrics.sentimentScore || 50
  ];
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// ============================================
// AI Scheduling Endpoints
// ============================================

// Suggest optimal practice times
app.post('/api/ai/suggest-optimal-times', async (req, res) => {
  try {
    const { userId, availableHoursPerWeek, preferredTimes, performanceData } = req.body;

    // For now, return smart defaults (can be enhanced with AI later)
    const suggestions = [];
    const now = new Date();

    for (let i = 1; i <= 5; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const morningStart = new Date(date);
      morningStart.setHours(9, 0, 0, 0);
      const morningEnd = new Date(date);
      morningEnd.setHours(10, 30, 0, 0);

      const eveningStart = new Date(date);
      eveningStart.setHours(18, 0, 0, 0);
      const eveningEnd = new Date(date);
      eveningEnd.setHours(19, 30, 0, 0);

      const timeSlots = [
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

    return res.json({ suggestions });
  } catch (error) {
    console.error('Error suggesting optimal times:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate study plan
app.post('/api/ai/generate-study-plan', async (req, res) => {
  try {
    const { userId, availableHoursPerWeek, preferredTimes, goals, performanceData } = req.body;

    const hoursPerWeek = availableHoursPerWeek || 10;
    const sessionsPerWeek = Math.floor(hoursPerWeek / 1.5);
    const sessions = [];
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
        focus: performanceData?.weakAreas?.[0] || 'General Practice',
        topics: performanceData?.weakAreas || ['Fundamentals'],
        type: i % 3 === 0 ? 'interview' : i % 3 === 1 ? 'practice' : 'review',
        priority: i < sessionsPerWeek ? 'high' : 'medium',
      });
    }

    const plan = {
      id: `plan-${Date.now()}`,
      duration: 14,
      sessions,
      totalHours: hoursPerWeek * 2,
      goals: goals || ['Improve interview skills', 'Build confidence'],
      createdAt: new Date().toISOString(),
    };

    return res.json({ plan });
  } catch (error) {
    console.error('Error generating study plan:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get smart reminders
app.post('/api/ai/smart-reminders', async (req, res) => {
  try {
    const { userId, upcomingSessions } = req.body;

    const reminders = [];

    (upcomingSessions || []).forEach((session, index) => {
      const sessionDate = new Date(session.date);
      const reminderDate = new Date(sessionDate);
      reminderDate.setDate(reminderDate.getDate() - 1);

      reminders.push({
        id: `reminder-${index + 1}`,
        type: 'preparation',
        message: `Don't forget: ${session.title} is tomorrow`,
        scheduledFor: reminderDate.toISOString(),
        priority: 'high',
      });
    });

    return res.json({ reminders });
  } catch (error) {
    console.error('Error getting smart reminders:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 A4F API endpoint: http://localhost:${PORT}/api/generate-questions-a4f`);
  console.log(`🤖 AI Evaluation endpoints available`);
});


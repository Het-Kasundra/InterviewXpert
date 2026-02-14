interface Question {
  id: string;
  type: string;
  correctAnswer?: any;
  domain: string;
  level: string;
}

interface Answer {
  value: any;
  timeSpent?: number;
  transcript?: string;
}

const weights = {
  mcq: 1,
  scenario: 1,
  roleplay: 1.5,
  case_mini: 1.5
};

export const calculateScore = (questions: Question[], answers: Record<number, Answer>): number => {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  questions.forEach((question, index) => {
    const answer = answers[index];
    if (!answer) return;

    const weight = weights[question.type] || 1;
    let questionScore = 0;

    switch (question.type) {
      case 'mcq':
        questionScore = answer.value === question.correctAnswer ? 1 : 0;
        break;

      case 'case_mini':
        if (typeof question.correctAnswer === 'number' && typeof answer.value === 'number') {
          const accuracy = 1 - Math.abs(answer.value - question.correctAnswer) / question.correctAnswer;
          questionScore = Math.max(0, Math.min(1, accuracy));
        }
        break;

      case 'scenario':
      case 'roleplay':
        // Simulate rubric scoring based on answer quality
        questionScore = calculateRubricScore(answer.value, answer.transcript, question);
        break;

      default:
        questionScore = 0.5; // Default partial credit
    }

    totalWeightedScore += questionScore * weight;
    totalWeight += weight;
  });

  const finalScore = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
  return Math.round(finalScore * 10) / 10; // Round to 1 decimal place
};

const calculateRubricScore = (textAnswer: string, transcript: string, question: Question): number => {
  const answer = textAnswer || transcript || '';
  
  if (!answer || answer.trim().length < 10) {
    return 0.1; // Minimal score for very short answers
  }

  // Simulate rubric scoring based on answer characteristics
  let clarity = 0.5;
  let relevance = 0.5;
  let structure = 0.5;
  let communication = 0.5;
  let domainAccuracy = 0.5;

  // Length and detail bonus
  if (answer.length > 100) clarity += 0.2;
  if (answer.length > 200) clarity += 0.2;

  // Structure indicators (STAR method, bullet points, etc.)
  if (answer.includes('situation') || answer.includes('task') || answer.includes('action') || answer.includes('result')) {
    structure += 0.3;
  }
  if (answer.split('.').length > 3) structure += 0.2; // Multiple sentences

  // Domain-specific keywords
  const domainKeywords = {
    finance: ['budget', 'cost', 'revenue', 'profit', 'roi', 'cash flow', 'investment', 'risk'],
    'soft-skills': ['communication', 'team', 'feedback', 'leadership', 'conflict', 'collaboration'],
    marketing: ['customer', 'brand', 'campaign', 'conversion', 'funnel', 'segment', 'target'],
    sales: ['prospect', 'objection', 'value', 'solution', 'close', 'relationship', 'needs'],
    hr: ['employee', 'performance', 'culture', 'development', 'recruitment', 'retention'],
    operations: ['process', 'efficiency', 'workflow', 'optimization', 'quality', 'metrics'],
    consulting: ['analysis', 'recommendation', 'strategy', 'framework', 'solution', 'implementation']
  };

  const keywords = domainKeywords[question.domain] || [];
  const keywordMatches = keywords.filter(keyword => 
    answer.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  
  domainAccuracy += Math.min(0.4, keywordMatches * 0.1);
  relevance += Math.min(0.3, keywordMatches * 0.075);

  // Communication quality (basic sentiment and professionalism)
  if (answer.includes('I would') || answer.includes('I will') || answer.includes('My approach')) {
    communication += 0.2;
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(answer.replace(/[.,!?]/g, ''))) {
    communication += 0.1; // Professional tone
  }

  // Normalize scores to 0-1 range
  clarity = Math.min(1, clarity);
  relevance = Math.min(1, relevance);
  structure = Math.min(1, structure);
  communication = Math.min(1, communication);
  domainAccuracy = Math.min(1, domainAccuracy);

  // Calculate weighted average
  const rubricScore = (clarity + relevance + structure + communication + domainAccuracy) / 5;
  return Math.max(0.1, Math.min(1, rubricScore));
};
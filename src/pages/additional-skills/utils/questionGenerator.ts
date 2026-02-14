interface Question {
  id: string;
  domain: string;
  level: string;
  type: string;
  tags: string[];
  prompt: string;
  context?: string;
  options?: string[];
  correctAnswer?: string;
  hint?: string;
  rationale?: string;
  estimatedTime: number;
}

const questionBanks = {
  finance: {
    Easy: [
      {
        type: 'mcq',
        tags: ['budgeting', 'basics'],
        prompt: 'What is the primary purpose of a budget?',
        options: [
          'To track past expenses only',
          'To plan and control future income and expenses',
          'To calculate taxes owed',
          'To determine investment returns'
        ],
        correctAnswer: 'To plan and control future income and expenses',
        rationale: 'A budget is a forward-looking financial plan that helps control spending and achieve financial goals.',
        estimatedTime: 60
      },
      {
        type: 'scenario',
        tags: ['cash-flow', 'analysis'],
        prompt: 'A small business has $10,000 monthly revenue but $12,000 monthly expenses. What immediate actions would you recommend?',
        hint: 'Consider both revenue enhancement and cost reduction strategies.',
        estimatedTime: 180
      },
      {
        type: 'case_mini',
        tags: ['roi', 'calculation'],
        prompt: 'Calculate the ROI for an investment of $5,000 that generated $6,500 after one year.',
        hint: 'ROI = (Gain - Cost) / Cost × 100%',
        correctAnswer: 30,
        estimatedTime: 120
      }
    ],
    Medium: [
      {
        type: 'mcq',
        tags: ['npv', 'valuation'],
        prompt: 'When evaluating two mutually exclusive projects, which metric is most reliable?',
        options: [
          'Payback Period',
          'Internal Rate of Return (IRR)',
          'Net Present Value (NPV)',
          'Accounting Rate of Return'
        ],
        correctAnswer: 'Net Present Value (NPV)',
        rationale: 'NPV accounts for the time value of money and provides absolute value creation.',
        estimatedTime: 90
      },
      {
        type: 'scenario',
        tags: ['working-capital', 'optimization'],
        prompt: 'Your company has high inventory levels, slow accounts receivable collection, and is paying suppliers quickly. How would you optimize working capital?',
        hint: 'Consider the cash conversion cycle and each component\'s impact.',
        estimatedTime: 240
      }
    ],
    Hard: [
      {
        type: 'case_mini',
        tags: ['dcf', 'valuation'],
        prompt: 'Calculate the present value of $100,000 received in 5 years with a 10% discount rate.',
        hint: 'PV = FV / (1 + r)^n',
        correctAnswer: 62092,
        estimatedTime: 180
      },
      {
        type: 'scenario',
        tags: ['risk-management', 'derivatives'],
        prompt: 'A multinational company faces significant foreign exchange risk. Design a hedging strategy using financial derivatives.',
        hint: 'Consider forwards, options, and swaps. Think about cost vs. protection trade-offs.',
        estimatedTime: 300
      }
    ]
  },
  'soft-skills': {
    Easy: [
      {
        type: 'scenario',
        tags: ['communication', 'feedback'],
        prompt: 'A team member consistently misses deadlines. How would you address this using the STAR method?',
        hint: 'Structure your response: Situation, Task, Action, Result. Focus on constructive communication.',
        estimatedTime: 180
      },
      {
        type: 'roleplay',
        tags: ['conflict-resolution', 'teamwork'],
        prompt: 'Two team members are arguing about project priorities during a meeting. Role-play how you would mediate this situation.',
        hint: 'Stay neutral, listen actively, and guide toward solution-focused discussion.',
        estimatedTime: 240
      },
      {
        type: 'mcq',
        tags: ['emotional-intelligence', 'self-awareness'],
        prompt: 'Which is the most important component of emotional intelligence in leadership?',
        options: [
          'Technical expertise',
          'Self-awareness',
          'Charisma',
          'Decision-making speed'
        ],
        correctAnswer: 'Self-awareness',
        rationale: 'Self-awareness is the foundation of emotional intelligence and effective leadership.',
        estimatedTime: 60
      }
    ],
    Medium: [
      {
        type: 'scenario',
        tags: ['leadership', 'change-management'],
        prompt: 'Your team is resistant to a new process implementation. Describe your approach to gain buy-in and ensure successful adoption.',
        hint: 'Consider communication, involvement, training, and addressing concerns. Use change management principles.',
        estimatedTime: 240
      },
      {
        type: 'roleplay',
        tags: ['difficult-conversations', 'performance'],
        prompt: 'You need to have a performance review conversation with an underperforming but well-liked team member. How do you approach this?',
        hint: 'Balance empathy with accountability. Focus on specific behaviors and improvement plans.',
        estimatedTime: 300
      }
    ],
    Hard: [
      {
        type: 'scenario',
        tags: ['strategic-thinking', 'influence'],
        prompt: 'You need to influence senior executives to approve a risky but potentially transformative initiative. Craft your persuasion strategy.',
        hint: 'Consider stakeholder analysis, risk mitigation, data-driven arguments, and coalition building.',
        estimatedTime: 360
      },
      {
        type: 'roleplay',
        tags: ['crisis-leadership', 'decision-making'],
        prompt: 'A critical system failure has occurred during peak business hours. Lead your team through the crisis response.',
        hint: 'Demonstrate calm leadership, clear communication, prioritization, and stakeholder management.',
        estimatedTime: 300
      }
    ]
  },
  marketing: {
    Easy: [
      {
        type: 'mcq',
        tags: ['funnel', 'basics'],
        prompt: 'What is the primary goal of the awareness stage in a marketing funnel?',
        options: [
          'Generate immediate sales',
          'Collect customer data',
          'Introduce the brand to potential customers',
          'Reduce marketing costs'
        ],
        correctAnswer: 'Introduce the brand to potential customers',
        rationale: 'The awareness stage focuses on making potential customers aware of your brand and solutions.',
        estimatedTime: 60
      },
      {
        type: 'case_mini',
        tags: ['cac', 'metrics'],
        prompt: 'Calculate Customer Acquisition Cost (CAC) if you spent $10,000 on marketing and acquired 100 new customers.',
        hint: 'CAC = Total Marketing Spend / Number of New Customers',
        correctAnswer: 100,
        estimatedTime: 90
      }
    ],
    Medium: [
      {
        type: 'scenario',
        tags: ['segmentation', 'targeting'],
        prompt: 'A SaaS company wants to expand from small businesses to enterprise clients. How would you adjust the marketing strategy?',
        hint: 'Consider messaging, channels, sales cycle, decision-makers, and value proposition changes.',
        estimatedTime: 240
      },
      {
        type: 'case_mini',
        tags: ['ltv', 'retention'],
        prompt: 'Calculate LTV if average monthly revenue per customer is $50, gross margin is 80%, and average customer lifespan is 24 months.',
        hint: 'LTV = (Average Monthly Revenue × Gross Margin) × Average Customer Lifespan',
        correctAnswer: 960,
        estimatedTime: 120
      }
    ],
    Hard: [
      {
        type: 'scenario',
        tags: ['attribution', 'analytics'],
        prompt: 'Your multi-channel marketing campaign shows conflicting attribution data between first-touch and last-touch models. How do you determine true campaign effectiveness?',
        hint: 'Consider multi-touch attribution, incrementality testing, and business context.',
        estimatedTime: 300
      }
    ]
  },
  sales: {
    Easy: [
      {
        type: 'roleplay',
        tags: ['objection-handling', 'price'],
        prompt: 'A prospect says "Your solution is too expensive." How do you respond?',
        hint: 'Understand the underlying concern, demonstrate value, and explore budget constraints.',
        estimatedTime: 180
      },
      {
        type: 'mcq',
        tags: ['sales-process', 'qualification'],
        prompt: 'What does BANT stand for in sales qualification?',
        options: [
          'Budget, Authority, Need, Timeline',
          'Business, Analysis, Negotiation, Terms',
          'Buyer, Approach, Network, Trust',
          'Brand, Awareness, Nurture, Target'
        ],
        correctAnswer: 'Budget, Authority, Need, Timeline',
        rationale: 'BANT is a classic qualification framework to assess prospect readiness.',
        estimatedTime: 60
      }
    ],
    Medium: [
      {
        type: 'scenario',
        tags: ['consultative-selling', 'discovery'],
        prompt: 'You\'re selling to a prospect who seems interested but hasn\'t clearly articulated their pain points. How do you conduct effective discovery?',
        hint: 'Use open-ended questions, active listening, and help them recognize problems they might not have fully identified.',
        estimatedTime: 240
      },
      {
        type: 'roleplay',
        tags: ['negotiation', 'closing'],
        prompt: 'A qualified prospect wants a 30% discount before signing. Walk through your negotiation approach.',
        hint: 'Understand their constraints, explore alternatives, and protect value while finding win-win solutions.',
        estimatedTime: 300
      }
    ],
    Hard: [
      {
        type: 'scenario',
        tags: ['enterprise-sales', 'stakeholders'],
        prompt: 'You\'re selling a $500K solution to an enterprise with 8 stakeholders, each with different priorities. Design your sales strategy.',
        hint: 'Map stakeholder influence, customize messaging, build consensus, and manage the complex sales process.',
        estimatedTime: 360
      }
    ]
  }
};

export const generateQuestions = (config: any, usedIds: string[], userId: string): Question[] => {
  const questions: Question[] = [];
  const seed = parseInt(userId.slice(-8), 16) + Date.now();
  const rng = seedRandom(seed);
  
  const totalQuestions = config.timed ? 
    Math.min(config.duration / 2, 16) : 
    Math.min(12, 16);
  
  const questionsPerDomain = Math.ceil(totalQuestions / config.domains.length);
  
  for (const domain of config.domains) {
    const domainQuestions = questionBanks[domain]?.[config.level] || [];
    const availableQuestions = domainQuestions.filter(q => 
      !usedIds.includes(`${domain}-${config.level}-${q.type}-${q.tags[0]}`)
    );
    
    // Shuffle available questions
    const shuffled = shuffleArray([...availableQuestions], rng);
    const selected = shuffled.slice(0, questionsPerDomain);
    
    selected.forEach((q, index) => {
      questions.push({
        id: `${domain}-${config.level}-${q.type}-${q.tags[0]}-${index}`,
        domain,
        level: config.level,
        type: q.type,
        tags: q.tags,
        prompt: q.prompt,
        context: q.context,
        options: q.options,
        correctAnswer: q.correctAnswer,
        hint: q.hint,
        rationale: q.rationale,
        estimatedTime: q.estimatedTime
      });
    });
  }
  
  return shuffleArray(questions, rng).slice(0, totalQuestions);
};

function seedRandom(seed: number) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function shuffleArray<T>(array: T[], rng: () => number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
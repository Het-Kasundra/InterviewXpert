import { useState } from 'react';

export const PracticeArenaTab = () => {
  const [selectedDomain, setSelectedDomain] = useState('finance');
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);

  const quickSets = [
    {
      id: 'finance-basics',
      title: 'Finance Fundamentals',
      domain: 'finance',
      duration: '5 min',
      questions: 5,
      icon: 'ri-money-dollar-circle-line',
      color: 'from-green-400 to-emerald-600'
    },
    {
      id: 'soft-skills-communication',
      title: 'Communication Skills',
      domain: 'soft-skills',
      duration: '5 min',
      questions: 5,
      icon: 'ri-chat-3-line',
      color: 'from-pink-400 to-rose-600'
    },
    {
      id: 'marketing-metrics',
      title: 'Marketing Metrics',
      domain: 'marketing',
      duration: '5 min',
      questions: 5,
      icon: 'ri-line-chart-line',
      color: 'from-purple-400 to-violet-600'
    },
    {
      id: 'sales-objections',
      title: 'Objection Handling',
      domain: 'sales',
      duration: '5 min',
      questions: 5,
      icon: 'ri-shield-check-line',
      color: 'from-blue-400 to-cyan-600'
    }
  ];

  const flashcards = {
    finance: [
      {
        front: 'What is ROI?',
        back: 'Return on Investment - measures the efficiency of an investment. Formula: (Gain - Cost) / Cost × 100%'
      },
      {
        front: 'What is NPV?',
        back: 'Net Present Value - the difference between present value of cash inflows and outflows. Positive NPV indicates profitable investment.'
      },
      {
        front: 'What is the Cash Conversion Cycle?',
        back: 'Time it takes to convert investments in inventory and receivables back to cash. Formula: DIO + DSO - DPO'
      }
    ],
    'soft-skills': [
      {
        front: 'What is the STAR method?',
        back: 'Situation, Task, Action, Result - a structured approach to answering behavioral interview questions with specific examples.'
      },
      {
        front: 'What is active listening?',
        back: 'Fully concentrating, understanding, responding and remembering what is being said. Includes verbal and non-verbal feedback.'
      },
      {
        front: 'What is emotional intelligence?',
        back: 'The ability to recognize, understand and manage our own emotions and effectively interact with others.'
      }
    ]
  };

  const handleQuickStart = (setId: string) => {
    // This would trigger a quick practice session
    alert(`Starting ${setId} practice session!`);
  };

  const handleFlashcardStart = (domain: string) => {
    setSelectedDomain(domain);
    setCurrentCard(0);
    setShowFlashcard(true);
  };

  const nextCard = () => {
    const cards = flashcards[selectedDomain] || [];
    setCurrentCard((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    const cards = flashcards[selectedDomain] || [];
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
  };

  if (showFlashcard) {
    const cards = flashcards[selectedDomain] || [];
    const card = cards[currentCard];
    const [flipped, setFlipped] = useState(false);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFlashcard(false)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <i className="ri-arrow-left-line" />
            <span>Back to Practice Arena</span>
          </button>
          <span className="text-sm text-gray-500">
            {currentCard + 1} / {cards.length}
          </span>
        </div>

        <div className="relative">
          <div 
            className={`bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 min-h-64 cursor-pointer transform transition-all duration-500 ${flipped ? 'rotate-y-180' : ''}`}
            onClick={() => setFlipped(!flipped)}
          >
            <div className={`${flipped ? 'hidden' : 'block'}`}>
              <div className="text-center">
                <div className="text-4xl mb-4">🤔</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Question</h3>
                <p className="text-lg text-gray-700 dark:text-gray-300">{card?.front}</p>
              </div>
            </div>
            
            <div className={`${flipped ? 'block' : 'hidden'}`}>
              <div className="text-center">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Answer</h3>
                <p className="text-lg text-gray-700 dark:text-gray-300">{card?.back}</p>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-4 right-4 text-sm text-gray-400">
            Click to flip
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={prevCard}
            disabled={currentCard === 0}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <i className="ri-arrow-left-line" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => setFlipped(!flipped)}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 whitespace-nowrap"
          >
            {flipped ? 'Show Question' : 'Show Answer'}
          </button>

          <button
            onClick={nextCard}
            disabled={currentCard === cards.length - 1}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <span>Next</span>
            <i className="ri-arrow-right-line" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Practice Sets */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <i className="ri-flash-line mr-2 text-yellow-500" />
          Quick 5-Minute Sets
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickSets.map((set) => (
            <div key={set.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <div className={`w-12 h-12 bg-gradient-to-r ${set.color} rounded-xl flex items-center justify-center mb-4`}>
                <i className={`${set.icon} text-white text-xl`} />
              </div>
              
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{set.title}</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center space-x-1">
                  <i className="ri-time-line" />
                  <span>{set.duration}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <i className="ri-question-line" />
                  <span>{set.questions} questions</span>
                </span>
              </div>
              
              <button
                onClick={() => handleQuickStart(set.id)}
                className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Quick Start
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Flashcards Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <i className="ri-stack-line mr-2 text-purple-500" />
          Study Flashcards
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <i className="ri-money-dollar-circle-line text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200">Finance Formulas</h4>
                <p className="text-sm text-green-600 dark:text-green-400">Essential calculations & concepts</p>
              </div>
            </div>
            <button
              onClick={() => handleFlashcardStart('finance')}
              className="w-full py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              Study Finance Cards
            </button>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl p-6 border border-pink-200 dark:border-pink-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                <i className="ri-heart-line text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-pink-800 dark:text-pink-200">Soft Skills</h4>
                <p className="text-sm text-pink-600 dark:text-pink-400">Communication & leadership tips</p>
              </div>
            </div>
            <button
              onClick={() => handleFlashcardStart('soft-skills')}
              className="w-full py-2 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-colors whitespace-nowrap"
            >
              Study Soft Skills Cards
            </button>
          </div>
        </div>
      </div>

      {/* Practice Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
        <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
          <i className="ri-lightbulb-line mr-2" />
          Practice Tips
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-timer-line text-white" />
            </div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Daily Practice</h4>
            <p className="text-sm text-blue-600 dark:text-blue-400">Spend 5-10 minutes daily on quick sets to build consistency</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-focus-3-line text-white" />
            </div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Focus Areas</h4>
            <p className="text-sm text-blue-600 dark:text-blue-400">Target your weakest domains for maximum improvement</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-repeat-line text-white" />
            </div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Spaced Repetition</h4>
            <p className="text-sm text-blue-600 dark:text-blue-400">Review flashcards regularly to reinforce learning</p>
          </div>
        </div>
      </div>
    </div>
  );
};
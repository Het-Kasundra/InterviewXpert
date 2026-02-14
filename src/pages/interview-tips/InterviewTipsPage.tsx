import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TipItem {
  id: string;
  title: string;
  description: string;
  category: 'article' | 'video' | 'expert' | 'case-study';
  tags: string[];
  content?: string;
  videoUrl?: string;
  author?: string;
  date: string;
  readTime?: number;
  featured?: boolean;
}

const tipsData: TipItem[] = [
  // Articles
  {
    id: '1',
    title: '10 Common Interview Questions and How to Answer Them',
    description: 'Master the most frequently asked interview questions with proven strategies and example answers.',
    category: 'article',
    tags: ['preparation', 'questions', 'answers', 'beginner'],
    content: 'Learn how to answer common questions like "Tell me about yourself", "Why do you want this job?", and more.',
    date: '2024-01-15',
    readTime: 8,
    featured: true
  },
  {
    id: '2',
    title: 'STAR Method: A Complete Guide to Behavioral Interview Answers',
    description: 'Use the STAR method to structure compelling answers to behavioral interview questions.',
    category: 'article',
    tags: ['behavioral', 'star-method', 'structure', 'intermediate'],
    content: 'The STAR method (Situation, Task, Action, Result) helps you provide structured, impactful answers.',
    date: '2024-01-20',
    readTime: 10
  },
  {
    id: '3',
    title: 'Technical Interview Preparation: Coding Challenges Guide',
    description: 'Prepare for technical interviews with strategies for solving coding problems effectively.',
    category: 'article',
    tags: ['technical', 'coding', 'algorithms', 'advanced'],
    content: 'Learn problem-solving frameworks, time management, and communication strategies for technical interviews.',
    date: '2024-02-01',
    readTime: 15
  },
  {
    id: '4',
    title: 'Body Language and Non-Verbal Communication in Interviews',
    description: 'Master non-verbal cues to project confidence and professionalism during interviews.',
    category: 'article',
    tags: ['communication', 'body-language', 'confidence', 'beginner'],
    content: 'Your body language speaks volumes. Learn how to use eye contact, posture, and gestures effectively.',
    date: '2024-02-10',
    readTime: 6
  },
  {
    id: '5',
    title: 'How to Handle Stress and Anxiety During Interviews',
    description: 'Practical techniques to manage interview anxiety and perform at your best.',
    category: 'article',
    tags: ['anxiety', 'stress-management', 'mental-health', 'beginner'],
    content: 'Discover breathing exercises, preparation strategies, and mindset shifts to reduce interview stress.',
    date: '2024-02-15',
    readTime: 7
  },
  {
    id: '6',
    title: 'Salary Negotiation: Getting What You Deserve',
    description: 'Navigate salary discussions confidently with proven negotiation strategies.',
    category: 'article',
    tags: ['salary', 'negotiation', 'compensation', 'intermediate'],
    content: 'Learn when and how to discuss salary, research market rates, and negotiate effectively.',
    date: '2024-02-20',
    readTime: 12
  },
  
  // Videos
  {
    id: '7',
    title: 'Virtual Interview Best Practices',
    description: 'Video tutorial covering setup, lighting, background, and technical tips for virtual interviews.',
    category: 'video',
    tags: ['virtual', 'video-interview', 'technology', 'beginner'],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    date: '2024-01-18',
    readTime: 15,
    featured: true
  },
  {
    id: '8',
    title: 'Mock Interview: Software Engineer Role',
    description: 'Watch a complete mock interview for a software engineering position with detailed feedback.',
    category: 'video',
    tags: ['mock-interview', 'software-engineering', 'technical', 'intermediate'],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    date: '2024-01-25',
    readTime: 25
  },
  {
    id: '9',
    title: 'How to Answer "Tell Me About Yourself"',
    description: 'Step-by-step guide to crafting a compelling introduction that sets you apart.',
    category: 'video',
    tags: ['introduction', 'elevator-pitch', 'beginner'],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    date: '2024-02-05',
    readTime: 8
  },
  
  // Expert Interviews
  {
    id: '10',
    title: 'Interview with Google Recruiter: What Hiring Managers Look For',
    description: 'Insights from a Google recruiter on what makes candidates stand out in the hiring process.',
    category: 'expert',
    tags: ['recruiter-insights', 'google', 'hiring-process', 'advanced'],
    author: 'Sarah Johnson, Senior Recruiter at Google',
    date: '2024-01-22',
    readTime: 20,
    featured: true
  },
  {
    id: '11',
    title: 'Tech Industry Hiring Trends: Expert Panel Discussion',
    description: 'Industry experts discuss current hiring trends, in-demand skills, and interview evolution.',
    category: 'expert',
    tags: ['trends', 'industry-insights', 'tech', 'advanced'],
    author: 'Panel: Tech Industry Leaders',
    date: '2024-02-12',
    readTime: 30
  },
  {
    id: '12',
    title: 'Career Coach Q&A: Common Interview Mistakes to Avoid',
    description: 'A career coach answers frequently asked questions about interview pitfalls and how to avoid them.',
    category: 'expert',
    tags: ['mistakes', 'career-coach', 'qa', 'beginner'],
    author: 'Michael Chen, Certified Career Coach',
    date: '2024-02-18',
    readTime: 15
  },
  
  // Case Studies
  {
    id: '13',
    title: 'Case Study: Landing a FAANG Job After 50 Rejections',
    description: 'Real story of how a candidate improved their interview skills and landed their dream job.',
    category: 'case-study',
    tags: ['success-story', 'faang', 'persistence', 'intermediate'],
    content: 'Follow the journey of a candidate who transformed their interview performance through dedicated practice.',
    date: '2024-01-28',
    readTime: 12,
    featured: true
  },
  {
    id: '14',
    title: 'Case Study: Career Transition from Non-Tech to Software Engineer',
    description: 'How a marketing professional successfully transitioned to software engineering through interview preparation.',
    category: 'case-study',
    tags: ['career-change', 'transition', 'non-tech', 'intermediate'],
    content: 'Learn the strategies and preparation methods that helped a non-technical professional break into tech.',
    date: '2024-02-08',
    readTime: 14
  },
  {
    id: '15',
    title: 'Case Study: Overcoming Interview Anxiety and Landing Multiple Offers',
    description: 'A candidate shares their journey of managing severe interview anxiety and receiving multiple job offers.',
    category: 'case-study',
    tags: ['anxiety', 'success', 'mental-health', 'beginner'],
    content: 'Discover the techniques and mindset shifts that helped overcome interview anxiety.',
    date: '2024-02-22',
    readTime: 10
  }
];

export const InterviewTipsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'article' | 'video' | 'expert' | 'case-study'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tipsData.forEach(tip => tip.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, []);

  const filteredTips = useMemo(() => {
    return tipsData.filter(tip => {
      const matchesSearch = searchQuery === '' || 
        tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory;
      const matchesTag = selectedTag === null || tip.tags.includes(selectedTag);
      
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [searchQuery, selectedCategory, selectedTag]);

  const featuredTips = useMemo(() => {
    return tipsData.filter(tip => tip.featured);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'article': return 'ri-article-line';
      case 'video': return 'ri-video-line';
      case 'expert': return 'ri-user-star-line';
      case 'case-study': return 'ri-file-chart-line';
      default: return 'ri-file-line';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'article': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'video': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'expert': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'case-study': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Interview Tips & Best Practices
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Curated library of interview strategies, expert insights, and success stories
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
            <input
              type="text"
              placeholder="Search articles, videos, expert interviews, and case studies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex flex-wrap gap-2"
        >
          {(['all', 'article', 'video', 'expert', 'case-study'] as const).map(category => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setSelectedTag(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
            </button>
          ))}
        </motion.div>

        {/* Tag Filter */}
        {selectedCategory !== 'all' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by tag:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTag === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All Tags
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Featured Section */}
        {searchQuery === '' && selectedCategory === 'all' && selectedTag === null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <i className="ri-star-line text-yellow-500 mr-2"></i>
              Featured Content
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTips.map((tip, index) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-yellow-200 dark:border-yellow-800"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(tip.category)}`}>
                      <i className={`${getCategoryIcon(tip.category)} mr-1`}></i>
                      {tip.category.replace('-', ' ')}
                    </span>
                    <span className="text-yellow-500">
                      <i className="ri-star-fill"></i>
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {tip.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{tip.date}</span>
                    {tip.readTime && <span>{tip.readTime} min read</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {searchQuery || selectedCategory !== 'all' || selectedTag ? 'Search Results' : 'All Content'}
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredTips.length} {filteredTips.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {filteredTips.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <i className="ri-search-line text-6xl text-gray-400 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredTips.map((tip, index) => (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(tip.category)}`}>
                        <i className={`${getCategoryIcon(tip.category)} mr-1`}></i>
                        {tip.category.replace('-', ' ')}
                      </span>
                      {tip.featured && (
                        <span className="text-yellow-500">
                          <i className="ri-star-fill"></i>
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tip.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {tip.description}
                    </p>

                    {tip.category === 'video' && tip.videoUrl && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <iframe
                          src={tip.videoUrl}
                          className="w-full h-48"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}

                    {tip.author && (
                      <div className="mb-3 flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <i className="ri-user-line mr-2"></i>
                        <span>{tip.author}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {tip.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {tip.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                          +{tip.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span>{new Date(tip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {tip.readTime && (
                        <span className="flex items-center">
                          <i className="ri-time-line mr-1"></i>
                          {tip.readTime} min
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Update Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
        >
          <div className="flex items-start">
            <i className="ri-information-line text-blue-600 dark:text-blue-400 text-2xl mr-4"></i>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Regular Updates
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                Our library is regularly updated with new articles, video tutorials, expert interviews, and case studies. 
                Check back frequently for the latest interview tips and best practices!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};


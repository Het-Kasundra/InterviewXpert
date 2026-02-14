
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../contexts/SessionProvider';

export default function HomePage() {
  const navigate = useNavigate();
  const { session } = useSession();

  const handleScheduleClick = () => {
    if (session?.user) {
      navigate('/schedule');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                InterviewXpert
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {session?.user ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Master Your
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                  Interview Skills
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-6 leading-relaxed">
                Practice with AI-powered mock interviews, get instant feedback, and land your dream job with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={() => session?.user ? navigate('/interviews/start') : navigate('/signup')}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Start Free Practice
                </button>
                <button
                  onClick={handleScheduleClick}
                  className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Schedule Interview
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded w-2/3"></div>
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                        Great answer! Score: 92%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Comprehensive interview preparation tools designed by industry experts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                <i className="ri-brain-line text-2xl text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI-Powered Questions</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Dynamic question generation based on your role, experience level, and target companies.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-6">
                <i className="ri-feedback-line text-2xl text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Instant Feedback</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get detailed analysis of your answers with personalized improvement suggestions.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-6">
                <i className="ri-code-line text-2xl text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Code Challenges</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Practice coding problems with real-time compilation and automated test cases.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-6">
                <i className="ri-calendar-check-line text-2xl text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Smart Scheduling</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Schedule practice sessions and track your progress with intelligent reminders.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-6">
                <i className="ri-bar-chart-line text-2xl text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Progress Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Detailed insights into your performance trends and areas for improvement.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-6">
                <i className="ri-mic-line text-2xl text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Voice Practice</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Practice speaking with voice recognition and get feedback on your communication skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who have improved their interview skills with InterviewXpert
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => session?.user ? navigate('/interviews/start') : navigate('/signup')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Practicing Now
            </button>
            <button
              onClick={handleScheduleClick}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 whitespace-nowrap border-2 border-white hover:border-gray-200 transition-colors"
            >
              Schedule Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">InterviewXpert</h3>
              <p className="text-gray-400">
                Master your interview skills with AI-powered practice sessions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Mock Interviews</li>
                <li>Code Challenges</li>
                <li>Progress Tracking</li>
                <li>Voice Practice</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigate('/privacy')}>Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms')}>Terms of Service</button></li>
                <li><button onClick={() => navigate('/support')}>Support</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigate('/signup')}>Sign Up</button></li>
                <li><button onClick={() => navigate('/login')}>Sign In</button></li>
                <li><a href="https://readdy.ai/?origin=logo" className="hover:text-white transition-colors">Powered by Readdy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 InterviewXpert. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

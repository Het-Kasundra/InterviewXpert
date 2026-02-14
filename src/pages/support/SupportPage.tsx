
export const SupportPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Get help and find answers to your questions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
            <i className="ri-question-line text-blue-600 dark:text-blue-400 text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">FAQ</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Find answers to commonly asked questions
          </p>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium whitespace-nowrap">
            Browse FAQ →
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
            <i className="ri-chat-3-line text-green-600 dark:text-green-400 text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Live Chat</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Chat with our support team in real-time
          </p>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium whitespace-nowrap">
            Start Chat →
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
            <i className="ri-mail-line text-purple-600 dark:text-purple-400 text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Support</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Send us an email and we'll get back to you
          </p>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium whitespace-nowrap">
            Send Email →
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mb-4">
            <i className="ri-book-line text-yellow-600 dark:text-yellow-400 text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Documentation</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Learn how to use InterviewXpert effectively
          </p>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium whitespace-nowrap">
            View Docs →
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Email</div>
            <div className="text-gray-600 dark:text-gray-400">support@interviewxpert.com</div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Response Time</div>
            <div className="text-gray-600 dark:text-gray-400">Within 24 hours</div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Availability</div>
            <div className="text-gray-600 dark:text-gray-400">Monday - Friday, 9 AM - 6 PM EST</div>
          </div>
        </div>
      </div>
    </div>
  );
};

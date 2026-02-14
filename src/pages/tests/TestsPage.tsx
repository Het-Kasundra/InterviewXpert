
export const TestsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Test History</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review your past interview performances
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center py-12">
          <i className="ri-history-line text-6xl text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No test history</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Complete interviews to see your performance history
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 whitespace-nowrap">
            Start First Test
          </button>
        </div>
      </div>
    </div>
  );
};

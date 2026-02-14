
export const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-600 dark:text-gray-400">Last updated: December 2024</p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              participate in mock interviews, or contact us for support.
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>Account information (name, email, timezone)</li>
              <li>Interview recordings and transcripts</li>
              <li>Performance data and analytics</li>
              <li>Usage information and preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We use the information we collect to provide, maintain, and improve our services:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>Provide personalized interview coaching</li>
              <li>Generate performance analytics and feedback</li>
              <li>Improve our AI interview algorithms</li>
              <li>Send you service-related communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Data Security</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You have the right to access, update, or delete your personal information. 
              You can also opt out of certain communications from us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400">
              If you have any questions about this Privacy Policy, please contact us at 
              privacy@interviewxpert.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

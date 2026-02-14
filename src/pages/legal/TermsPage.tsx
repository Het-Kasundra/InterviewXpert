
export const TermsPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
          <p className="text-gray-600 dark:text-gray-400">Last updated: December 2024</p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              By accessing and using InterviewXpert, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Use License</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Permission is granted to temporarily use InterviewXpert for personal, non-commercial 
              interview preparation purposes.
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>This license shall automatically terminate if you violate any restrictions</li>
              <li>You may not modify or copy the materials</li>
              <li>You may not use the materials for commercial purposes</li>
              <li>You may not reverse engineer any software</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">User Accounts</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              When you create an account with us, you must provide accurate and complete information. 
              You are responsible for safeguarding your account credentials.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Prohibited Uses</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You may not use our service:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Service Availability</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We reserve the right to withdraw or amend our service, and any service or material 
              we provide, in our sole discretion without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              In no event shall InterviewXpert or its suppliers be liable for any damages arising 
              out of the use or inability to use the materials on our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-400">
              If you have any questions about these Terms of Service, please contact us at 
              legal@interviewxpert.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

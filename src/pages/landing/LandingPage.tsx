
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

export const LandingPage = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      image: "https://readdy.ai/api/search-image?query=Professional%20young%20Asian%20woman%20software%20engineer%20smiling%20confidently%20in%20modern%20tech%20office%20environment%2C%20wearing%20business%20casual%20attire%2C%20clean%20background%2C%20professional%20headshot%20style&width=80&height=80&seq=testimonial1&orientation=squarish",
      quote: "InterviewXpert helped me land my dream job at Google. The AI feedback was incredibly detailed and helped me improve my technical communication skills.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Data Scientist at Microsoft",
      image: "https://readdy.ai/api/search-image?query=Professional%20African%20American%20man%20data%20scientist%20smiling%20warmly%20in%20modern%20office%20setting%2C%20wearing%20smart%20casual%20shirt%2C%20clean%20background%2C%20professional%20headshot%20style&width=80&height=80&seq=testimonial2&orientation=squarish",
      quote: "The mock interviews felt so realistic. I went from nervous wreck to confident candidate in just 2 weeks of practice.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Product Manager at Amazon",
      image: "https://readdy.ai/api/search-image?query=Professional%20Hispanic%20woman%20product%20manager%20smiling%20confidently%20in%20modern%20corporate%20environment%2C%20wearing%20professional%20blazer%2C%20clean%20background%2C%20professional%20headshot%20style&width=80&height=80&seq=testimonial3&orientation=squarish",
      quote: "The personalized coaching and real-time feedback made all the difference. I felt prepared for every question they threw at me.",
      rating: 5
    }
  ];

  const features = [
    {
      icon: "ri-brain-line",
      title: "AI-Powered Mock Interviews",
      description: "Practice with advanced AI that adapts to your industry, role, and experience level. Get personalized questions that mirror real interview scenarios.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "ri-feedback-line",
      title: "Real-Time Performance Analytics",
      description: "Receive instant feedback on your responses, body language, speaking pace, and confidence level. Track your improvement over time.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "ri-trophy-line",
      title: "Gamified Learning Experience",
      description: "Earn XP, unlock badges, and climb leaderboards while improving your skills. Make interview preparation engaging and fun.",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: "ri-team-line",
      title: "Industry-Specific Training",
      description: "Specialized interview tracks for tech, finance, consulting, healthcare, and more. Practice with questions from your target industry.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: "ri-calendar-check-line",
      title: "Flexible Scheduling",
      description: "Practice anytime, anywhere. Schedule mock interviews that fit your busy student or professional schedule.",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: "ri-shield-check-line",
      title: "Proven Success Rate",
      description: "Join 50,000+ students and professionals who've landed their dream jobs. 94% success rate within 3 months.",
      color: "from-rose-500 to-red-500"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Students Helped", icon: "ri-graduation-cap-line" },
    { number: "94%", label: "Success Rate", icon: "ri-trophy-line" },
    { number: "500+", label: "Companies", icon: "ri-building-line" },
    { number: "4.9/5", label: "User Rating", icon: "ri-star-fill" }
  ];

  // const pricingPlans = [
  //   {
  //     name: "Student",
  //     price: "Free",
  //     period: "forever",
  //     description: "Perfect for students getting started",
  //     features: [
  //       "5 AI mock interviews per month",
  //       "Basic performance analytics",
  //       "General interview questions",
  //       "Email support"
  //     ],
  //     popular: false,
  //     color: "from-gray-500 to-gray-600"
  //   },
  //   {
  //     name: "Professional",
  //     price: "$19",
  //     period: "per month",
  //     description: "For serious job seekers",
  //     features: [
  //       "Unlimited AI mock interviews",
  //       "Advanced analytics & insights",
  //       "Industry-specific questions",
  //       "Real-time feedback",
  //       "Priority support",
  //       "Resume analysis"
  //     ],
  //     popular: true,
  //     color: "from-blue-500 to-purple-500"
  //   },
  //   {
  //     name: "Enterprise",
  //     price: "$49",
  //     period: "per month",
  //     description: "For teams and organizations",
  //     features: [
  //       "Everything in Professional",
  //       "Team management dashboard",
  //       "Custom interview templates",
  //       "Bulk user management",
  //       "Advanced reporting",
  //       "Dedicated account manager"
  //     ],
  //     popular: false,
  //     color: "from-amber-500 to-orange-500"
  //   }
  // ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="backdrop-blur-md bg-white/80 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold font-['Pacifico']">
                <span className="text-amber-500">Interview</span>
                <span className="text-blue-600">Xpert</span>
              </h1>
            </motion.div>
            <motion.div 
              className="hidden md:flex items-center space-x-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Success Stories</a>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap"
              >
                Start Free Trial
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-amber-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-medium mb-6">
                <i className="ri-star-fill text-amber-500 mr-2" />
                Trusted by 50,000+ Students & Professionals
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Master Your
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">
                  Dream Interview
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                Transform your interview skills with AI-powered mock interviews, real-time feedback, 
                and personalized coaching. Join thousands of students who've landed their dream jobs 
                at top companies like Google, Microsoft, and Amazon.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 whitespace-nowrap"
                >
                  <i className="ri-rocket-line mr-2" />
                  Start Free Trial
                </Link>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-blue-500 hover:text-blue-600 font-semibold text-lg transition-all duration-300 whitespace-nowrap">
                  <i className="ri-play-circle-line mr-2" />
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center justify-center lg:justify-start mt-8 space-x-6">
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <img
                        key={i}
                        src={`https://readdy.ai/api/search-image?query=Professional%20diverse%20student%20headshot%20smiling%20confidently%2C%20clean%20background%2C%20professional%20style&width=40&height=40&seq=hero${i}&orientation=squarish`}
                        alt="Student"
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                      />
                    ))}
                  </div>
                  <span className="ml-3 text-gray-600 font-medium">2,000+ this month</span>
                </div>
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map(i => (
                    <i key={i} className="ri-star-fill" />
                  ))}
                  <span className="ml-2 text-gray-600 font-medium">4.9/5 rating</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 shadow-2xl border border-white/50">
                <img
                  src="https://readdy.ai/api/search-image?query=Modern%20professional%20student%20practicing%20interview%20with%20AI%20technology%2C%20laptop%20screen%20showing%20interview%20interface%2C%20confident%20posture%2C%20clean%20modern%20office%20environment%2C%20high-tech%20atmosphere%2C%20professional%20lighting&width=600&height=400&seq=hero-main&orientation=landscape"
                  alt="AI Interview Practice"
                  className="w-full h-80 object-cover rounded-2xl"
                />
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg">
                  <i className="ri-trophy-line mr-1" />
                  94% Success Rate
                </div>
                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg">
                  <i className="ri-brain-line mr-1" />
                  AI-Powered
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className={`${stat.icon} text-white text-2xl`} />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Ace Your Interviews</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and insights designed specifically for students and professionals 
              to boost interview performance and land dream jobs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <i className={`${feature.icon} text-white text-2xl`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and see results in days. Our proven 3-step process 
              has helped thousands of students land their dream jobs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                description: "Tell us about your target role, industry, and experience level. Our AI will customize everything for you.",
                icon: "ri-user-settings-line",
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "02",
                title: "Practice with AI",
                description: "Take unlimited mock interviews with our advanced AI. Get real-time feedback and personalized coaching.",
                icon: "ri-robot-line",
                color: "from-purple-500 to-pink-500"
              },
              {
                step: "03",
                title: "Land Your Dream Job",
                description: "Apply with confidence. Track your progress and celebrate your success with our community.",
                icon: "ri-trophy-line",
                color: "from-amber-500 to-orange-500"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center relative"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <i className={`${step.icon} text-white text-3xl`} />
                </div>
                <div className="text-6xl font-bold text-gray-200 mb-4">{step.step}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">{step.description}</p>
                {index < 2 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full">
                    <div className="flex items-center justify-center">
                      <i className="ri-arrow-right-line text-gray-300 text-2xl" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Success Stories from
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Real Students</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of students who've transformed their careers with InterviewXpert
            </p>
          </motion.div>

          <div className="relative">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-2xl border border-white/50 max-w-4xl mx-auto"
            >
              <div className="flex items-center mb-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <i key={i} className="ri-star-fill text-amber-500 text-xl" />
                ))}
              </div>
              <blockquote className="text-2xl text-gray-700 font-medium mb-8 leading-relaxed">
                "{testimonials[activeTestimonial].quote}"
              </blockquote>
              <div className="flex items-center">
                <img
                  src={testimonials[activeTestimonial].image}
                  alt={testimonials[activeTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-bold text-gray-900 text-lg">{testimonials[activeTestimonial].name}</div>
                  <div className="text-gray-600">{testimonials[activeTestimonial].role}</div>
                </div>
              </div>
            </motion.div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial 
                      ? 'bg-blue-600 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Choose Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Success Plan</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and upgrade as you grow. All plans include our core features 
              with no hidden fees or long-term commitments.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-white rounded-3xl p-8 shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-blue-500 ring-4 ring-blue-500/20' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-bold text-sm">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    {plan.price !== "Free" && (
                      <span className="text-gray-600 ml-2">/{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <i className="ri-check-line text-green-500 mr-3 text-lg" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  className={`w-full py-4 rounded-xl font-semibold text-center transition-all duration-300 whitespace-nowrap block ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.price === "Free" ? "Get Started Free" : "Start Free Trial"}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join 50,000+ students and professionals who've already transformed their careers. 
              Start your free trial today and land your dream job within 30 days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-100 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 whitespace-nowrap"
              >
                <i className="ri-rocket-line mr-2" />
                Start Free Trial - No Credit Card Required
              </Link>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 font-bold text-lg transition-all duration-300 whitespace-nowrap">
                <i className="ri-calendar-line mr-2" />
                Schedule Demo
              </button>
            </div>
            <p className="text-blue-200 mt-6 text-sm">
              ✓ 7-day free trial ✓ No setup fees ✓ Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 font-['Pacifico']">
                <span className="text-amber-500">Interview</span>
                <span className="text-blue-400">Xpert</span>
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering students and professionals worldwide to ace their interviews 
                and land their dream jobs with AI-powered practice and coaching.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <i className="ri-twitter-line" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <i className="ri-linkedin-line" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <i className="ri-youtube-line" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-center md:text-left">
              &copy; 2024 InterviewXpert. All rights reserved.
            </p>
            <a 
              href="https://readdy.ai/?origin=logo" 
              className="text-gray-400 hover:text-white transition-colors mt-4 md:mt-0"
            >
              Powered by Readdy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

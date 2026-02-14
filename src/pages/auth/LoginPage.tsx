
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Ensure profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!profile) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
        }

        navigate('/dashboard');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      setMagicLinkSent(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 flex-col justify-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-6">
              <span className="text-yellow-400">Interview</span>
              <span className="text-white">Xpert</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Practice smarter. Interview with confidence.
            </p>
            <div className="space-y-4 text-blue-100">
              <div className="flex items-center">
                <i className="ri-check-line text-green-400 mr-3" />
                AI-powered mock interviews
              </div>
              <div className="flex items-center">
                <i className="ri-check-line text-green-400 mr-3" />
                Real-time feedback and scoring
              </div>
              <div className="flex items-center">
                <i className="ri-check-line text-green-400 mr-3" />
                Skill development tracking
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-mail-check-line text-2xl text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-600">
                We've sent a magic link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Click the link in your email to sign in to your account.
              </p>
            </div>

            <button
              onClick={() => setMagicLinkSent(false)}
              className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 flex-col justify-center">
        <div className="text-white">
          <h1 className="text-4xl font-bold mb-6">
            <span className="text-yellow-400">Interview</span>
            <span className="text-white">Xpert</span>
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Practice smarter. Interview with confidence.
          </p>
          <div className="space-y-4 text-blue-100">
            <div className="flex items-center">
              <i className="ri-check-line text-green-400 mr-3" />
              AI-powered mock interviews
            </div>
            <div className="flex items-center">
              <i className="ri-check-line text-green-400 mr-3" />
              Real-time feedback and scoring
            </div>
            <div className="flex items-center">
              <i className="ri-check-line text-green-400 mr-3" />
              Skill development tracking
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap"
            >
              {loading ? 'Signing in...' : 'Continue'}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full text-blue-600 hover:text-blue-700 py-2 text-sm font-medium whitespace-nowrap"
            >
              Use magic link instead
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                <i className="ri-google-fill text-red-500 mr-2" />
                Google
              </button>
              <button
                onClick={() => handleOAuthLogin('github')}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                <i className="ri-github-fill mr-2" />
                GitHub
              </button>
            </div>
          </div>

          <div className="mt-6 text-center space-y-2">
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Create an account
            </Link>
            <div>
              <Link
                to="/reset-password"
                className="text-gray-600 hover:text-gray-700 text-sm"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

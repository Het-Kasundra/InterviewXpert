
import { ChallengeProvider, useChallengeArena } from '../../contexts/ChallengeProvider';
import { useSession } from '../../contexts/SessionProvider';
import { Navigate } from 'react-router-dom';
import ChallengeArenaContent from './components/ChallengeArenaContent';
import LoadingState from './components/LoadingState';

const ChallengeArenaPage = () => {
  const { user, loading: sessionLoading } = useSession();

  // Show loading while checking session
  if (sessionLoading) {
    return <LoadingState />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ChallengeProvider>
      <ChallengeArenaWrapper />
    </ChallengeProvider>
  );
};

const ChallengeArenaWrapper = () => {
  const { loading, error, refreshData } = useChallengeArena();

  // Always render something - never return null
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-red-900/20 border border-red-700/30 rounded-2xl p-8 max-w-md text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-error-warning-line text-3xl text-red-400"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Error Loading Arena</h3>
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button
                onClick={refreshData}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <i className="ri-refresh-line mr-2"></i>
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ChallengeArenaContent />;
};

export default ChallengeArenaPage;

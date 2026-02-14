
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '../../contexts/SessionProvider';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const publicRoutes = ['/', '/login', '/signup', '/reset-password', '/privacy', '/terms'];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    if (requireAuth && !session && !isPublicRoute) {
      navigate('/login', { replace: true });
    } else if (!requireAuth && session && (location.pathname === '/login' || location.pathname === '/signup')) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, loading, navigate, location.pathname, requireAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};

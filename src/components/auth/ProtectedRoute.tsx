import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingScreen } from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onRedirect: (path: string) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, onRedirect }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;
      const fullTarget = currentPath + currentHash;
      const redirectTarget =
        fullTarget && fullTarget !== '/' && fullTarget !== '/login'
          ? `/login?returnUrl=${encodeURIComponent(fullTarget)}`
          : '/login';

      onRedirect(redirectTarget);
    }
  }, [user, loading, onRedirect]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};


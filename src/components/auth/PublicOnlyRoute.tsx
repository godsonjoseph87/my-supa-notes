import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingScreen } from './LoadingScreen';
import { sanitizeReturnUrl } from '../../utils/auth';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
  onRedirect: (path: string) => void;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children, onRedirect }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      const params = new URLSearchParams(window.location.search);
      const returnUrl = sanitizeReturnUrl(params.get('returnUrl'));
      onRedirect(returnUrl);
    }
  }, [user, loading, onRedirect]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};


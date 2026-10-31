import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AuthUser, AuthContextType } from '../types/auth';
import {
  loadAuthSession,
  saveAuthSession,
  clearAuthSession,
  validateGoogleCredential
} from '../utils/auth';
import { DRIVE_SCOPE } from '../services/googleDrive';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [driveSyncStatus, setDriveSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Reference for GIS OAuth2 Token Client
  const tokenClientRef = useRef<{ requestAccessToken: (config?: { prompt?: string }) => void } | null>(null);
  const driveResolveRef = useRef<((granted: boolean) => void) | null>(null);
  const loginResolveRef = useRef<((res: { success: boolean; error?: string }) => void) | null>(null);

  // Read Google OAuth Client ID from Vite environment variable
  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  const isConfigured = Boolean(
    googleClientId &&
    googleClientId !== 'your-google-oauth-client-id' &&
    googleClientId !== 'your-google-client-id'
  );

  // Check if access token is still valid
  const isAccessTokenValid = useCallback((u: AuthUser | null): boolean => {
    if (!u || !u.accessToken || !u.accessTokenExp) return false;
    return Date.now() < u.accessTokenExp - 60000; // 1 min buffer
  }, []);

  const driveConnected = Boolean(accessToken && isAccessTokenValid(user));

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
    setAccessToken(null);
    setDriveSyncStatus('idle');
    try {
      window.google?.accounts?.id?.disableAutoSelect();
      if (accessToken && window.google?.accounts?.oauth2?.revoke) {
        window.google.accounts.oauth2.revoke(accessToken, () => {});
      }
    } catch {
      // SDK might not be loaded
    }
  }, [accessToken]);

  // Check ID token expiration
  const checkTokenExpiry = useCallback(() => {
    if (!user) return;
    if (Date.now() >= user.exp) {
      logout();
    }
  }, [user, logout]);

  // Initial session restoration
  useEffect(() => {
    const session = loadAuthSession();
    if (session) {
      setUser(session);
      if (session.accessToken && session.accessTokenExp && Date.now() < session.accessTokenExp) {
        setAccessToken(session.accessToken);
      }
    }
    setLoading(false);
  }, []);

  // Initialize GIS OAuth2 Token Client with Combined Identity + Drive Scopes
  const setupTokenClient = useCallback(() => {
    if (!window.google?.accounts?.oauth2 || !isConfigured) return false;

    try {
      const combinedScope = `openid email profile ${DRIVE_SCOPE}`;

      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: combinedScope,
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            const errDesc = tokenResponse.error_description || tokenResponse.error || 'Authorization failed';
            if (loginResolveRef.current) {
              loginResolveRef.current({ success: false, error: errDesc });
              loginResolveRef.current = null;
            }
            if (driveResolveRef.current) {
              driveResolveRef.current(false);
              driveResolveRef.current = null;
            }
            return;
          }

          if (!tokenResponse.access_token) {
            if (loginResolveRef.current) {
              loginResolveRef.current({ success: false, error: 'No access token received from Google.' });
              loginResolveRef.current = null;
            }
            return;
          }

          const token = tokenResponse.access_token;
          const expiresInMs = (tokenResponse.expires_in || 3600) * 1000;
          const tokenExp = Date.now() + expiresInMs;

          setAccessToken(token);

          // If in login flow, fetch Google profile and establish session
          if (loginResolveRef.current) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` }
              });

              if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Failed to load Google profile: ${errText}`);
              }

              const userInfo = await res.json();
              const authUser: AuthUser = {
                sub: userInfo.sub,
                name: userInfo.name || userInfo.email || 'Google User',
                email: userInfo.email,
                picture: userInfo.picture,
                exp: tokenExp,
                idToken: token,
                accessToken: token,
                accessTokenExp: tokenExp
              };

              saveAuthSession(authUser);
              setUser(authUser);
              setDriveSyncStatus('idle');

              loginResolveRef.current({ success: true });
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Sign-in failed';
              loginResolveRef.current({ success: false, error: message });
            } finally {
              loginResolveRef.current = null;
            }
          } else {
            // Re-authorizing or renewing Drive token for existing user
            setUser((prev) => {
              if (!prev) return null;
              const updated: AuthUser = {
                ...prev,
                accessToken: token,
                accessTokenExp: tokenExp
              };
              saveAuthSession(updated);
              return updated;
            });

            if (driveResolveRef.current) {
              driveResolveRef.current(true);
              driveResolveRef.current = null;
            }
          }
        },
        error_callback: (err) => {
          if (loginResolveRef.current) {
            loginResolveRef.current({
              success: false,
              error: err?.message || 'Google authorization was cancelled or closed.'
            });
            loginResolveRef.current = null;
          }
          if (driveResolveRef.current) {
            driveResolveRef.current(false);
            driveResolveRef.current = null;
          }
        }
      });
      return true;
    } catch (err) {
      console.warn('Could not initialize Google OAuth2 Token Client:', err);
      return false;
    }
  }, [googleClientId, isConfigured]);

  useEffect(() => {
    if (!isConfigured) return;

    if (setupTokenClient()) return;

    const interval = setInterval(() => {
      if (setupTokenClient()) clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, [isConfigured, setupTokenClient]);

  // Unified Google Login + Drive Authorization in ONE single prompt
  const loginWithGoogleAndDrive = useCallback((): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!isConfigured) {
        resolve({ success: false, error: 'Google Client ID is not configured.' });
        return;
      }

      if (!tokenClientRef.current) {
        setupTokenClient();
      }

      if (!tokenClientRef.current) {
        resolve({
          success: false,
          error: 'Google Sign-In is initializing. Please try again in a few seconds.'
        });
        return;
      }

      loginResolveRef.current = resolve;
      tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
    });
  }, [isConfigured, setupTokenClient]);

  // Request Drive Permission on demand if ever needed
  const requestDrivePermission = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (tokenClientRef.current) {
        driveResolveRef.current = resolve;
        tokenClientRef.current.requestAccessToken({ prompt: '' });
      } else {
        resolve(false);
      }
    });
  }, []);

  // Monitor expiration on window focus, visibility change, and interval
  useEffect(() => {
    if (!user) return;

    checkTokenExpiry();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkTokenExpiry();
      }
    };

    window.addEventListener('focus', checkTokenExpiry);
    document.addEventListener('visibilitychange', handleVisibility);

    const interval = setInterval(checkTokenExpiry, 30000);

    return () => {
      window.removeEventListener('focus', checkTokenExpiry);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, [user, checkTokenExpiry]);

  // Login handler with Google credential
  const loginWithCredential = useCallback(
    (credential: string): { success: boolean; error?: string } => {
      const result = validateGoogleCredential(credential, googleClientId);

      if (!result.valid || !result.user) {
        return { success: false, error: result.error || 'Invalid Google credential.' };
      }

      saveAuthSession(result.user);
      setUser(result.user);
      return { success: true };
    },
    [googleClientId]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        googleClientId,
        isConfigured,
        accessToken,
        driveConnected,
        driveSyncStatus,
        setDriveSyncStatus,
        requestDrivePermission,
        loginWithGoogleAndDrive,
        loginWithCredential,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

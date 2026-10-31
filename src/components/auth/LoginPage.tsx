import React, { useEffect, useState } from 'react';
import { BrandLogo } from '../BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { sanitizeReturnUrl } from '../../utils/auth';
import { AlertCircle, ExternalLink, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';

interface LoginPageProps {
  onSuccess: (targetPath: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { isConfigured, loginWithGoogleAndDrive } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGsiReady, setIsGsiReady] = useState(false);

  // Verify Google Identity Services SDK availability
  useEffect(() => {
    if (!isConfigured) return;

    const checkSdk = () => {
      if (window.google?.accounts?.oauth2) {
        setIsGsiReady(true);
        return true;
      }
      return false;
    };

    if (checkSdk()) return;

    const interval = setInterval(() => {
      if (checkSdk()) clearInterval(interval);
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      // Fallback check
      if (window.google?.accounts?.oauth2) {
        setIsGsiReady(true);
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isConfigured]);

  const handleSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);

    try {
      const result = await loginWithGoogleAndDrive();
      if (result.success) {
        const params = new URLSearchParams(window.location.search);
        const returnUrl = sanitizeReturnUrl(params.get('returnUrl'));
        onSuccess(returnUrl);
      } else if (result.error) {
        setAuthError(result.error);
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-[1.18fr_0.82fr] bg-[#F6F8FC] font-sans select-none antialiased overflow-x-hidden">
      {/* Left Visual Brand Panel (55-60%) */}
      <section className="relative flex flex-col justify-between overflow-hidden p-8 sm:p-12 lg:p-16 text-[#F4F6FF] bg-radial-gradient min-h-[380px] lg:min-h-screen bg-[#151F30] border-b lg:border-b-0 lg:border-r border-[#1E2B42]">
        {/* Ambient Glows */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 20% 25%, rgba(102, 84, 255, 0.28), transparent 50%), linear-gradient(145deg, #151F30 0%, #1B2340 68%, #252155 100%)'
          }}
        />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <BrandLogo size={36} />
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-[560px] my-auto py-10 lg:py-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[#C4B5FD] text-[12.5px] font-semibold tracking-wide uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Smart Note Taking</span>
          </div>

          <h1 className="text-[36px] sm:text-[48px] lg:text-[58px] font-bold leading-[1.1] tracking-[-1.8px] text-white">
            Your thoughts,<br />beautifully organized.
          </h1>

          <p className="mt-5 text-[#C5CEE4] text-[16px] sm:text-[17px] leading-[1.75] max-w-[460px] font-normal">
            A calm, distraction-free space to capture ideas, organize notes, and bring your thoughts together.
          </p>

          <div className="mt-8 flex items-center gap-6 text-[13px] text-[#8093BB]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Private & Local</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6654FF]" />
              <span>Offline First</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2ED18C]" />
              <span>Account Isolated</span>
            </div>
          </div>
        </div>

        {/* Layered Polygonal Mountain Silhouette Artwork Anchored to Bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[36%] w-full pointer-events-none opacity-90 select-none">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 320"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="loginPeakLit" x1="600" y1="120" x2="700" y2="320" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8A76FA" />
                <stop offset="60%" stopColor="#5E49DF" />
                <stop offset="100%" stopColor="#252155" />
              </linearGradient>
              <linearGradient id="loginPeakShadow" x1="700" y1="120" x2="850" y2="320" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#302868" />
                <stop offset="100%" stopColor="#141B33" />
              </linearGradient>
              <linearGradient id="loginRidge" x1="200" y1="200" x2="500" y2="320" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6C55F2" />
                <stop offset="100%" stopColor="#1B2340" />
              </linearGradient>
            </defs>

            {/* Distant Ridge Layer */}
            <polygon points="0,200 120,160 260,190 440,140 620,180 780,130 920,170 1000,150 1000,320 0,320" fill="#1B2446" fillOpacity="0.8" />

            {/* Midground Layer */}
            <polygon points="0,240 180,180 340,210 520,150 680,200 850,160 1000,210 1000,320 0,320" fill="#252458" fillOpacity="0.85" />

            {/* Prominent Majestic Peak */}
            <polygon points="720,120 890,240 850,320 640,320" fill="url(#loginPeakShadow)" />
            <polygon points="720,120 540,230 650,320 750,260" fill="url(#loginPeakLit)" />
            <polyline points="720,120 680,320" stroke="#C7D2FE" strokeOpacity="0.55" strokeWidth="1.5" />

            {/* Left Foreground Ridges */}
            <polygon points="80,210 240,170 360,250 120,320 0,300" fill="url(#loginRidge)" />
            <polygon points="240,170 420,240 320,320 180,320" fill="#221D4A" fillOpacity="0.9" />

            {/* Bottom Horizon Glow Fade */}
            <rect y="290" width="1000" height="30" fill="#151F30" fillOpacity="0.8" />
          </svg>
        </div>

        {/* Empty footer spacer for positioning */}
        <div className="relative z-10 hidden lg:block text-[12px] text-[#8093BB]">
          NoteNest Application · Local Workspace Storage
        </div>
      </section>

      {/* Right Login Panel */}
      <section className="flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14 bg-[#F9FAFF] relative">
        {/* Soft Ambient Light */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 80% 10%, rgba(102, 84, 255, 0.07), transparent 45%), #F9FAFF'
          }}
        />

        <div className="relative z-10 w-full max-w-[420px] bg-white/95 backdrop-blur-sm border border-[#E1E6F3] rounded-[24px] p-8 sm:p-10 shadow-[0_24px_70px_rgba(24,34,63,0.08),0_3px_12px_rgba(24,34,63,0.025)]">
          {/* Card Header */}
          <div className="text-left mb-7">
            <h2 className="text-[28px] sm:text-[30px] font-bold text-[#151F30] tracking-[-0.9px] leading-[1.25]">
              Welcome to NoteNest
            </h2>
            <p className="mt-2 text-[#7183A6] text-[15px] leading-[1.6]">
              Your ideas deserve a home.
            </p>
          </div>

          {/* Authentication Error Feedback */}
          {authError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-[13px] animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Sign-in Notice</span>
                <span>{authError}</span>
              </div>
            </div>
          )}

          {/* Real Google Sign-In Button or Configuration Alert */}
          {isConfigured ? (
            <div className="flex flex-col items-center justify-center my-3 w-full">
              <button
                type="button"
                id="google-signin-btn"
                onClick={handleSignIn}
                disabled={isSigningIn || !isGsiReady}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-white hover:bg-[#F8FAFC] active:bg-[#F1F5F9] border border-[#CFD7E6] hover:border-[#8E9DB8] shadow-[0_2px_10px_rgba(20,32,57,0.06)] hover:shadow-[0_4px_16px_rgba(20,32,57,0.1)] transition-all cursor-pointer font-medium text-[#1A2338] text-[15px] disabled:opacity-60 disabled:cursor-not-allowed select-none group"
                aria-label="Sign in with Google and Enable Drive Sync"
              >
                {/* Official Google G multicolor SVG */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {isSigningIn
                    ? 'Connecting to Google...'
                    : !isGsiReady
                    ? 'Loading Google...'
                    : 'Sign in with Google'}
                </span>
              </button>
            </div>
          ) : (
            /* Missing Google Client ID Setup Guide */
            <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl text-left space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-[14px]">
                <KeyRound className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Google Client ID Required</span>
              </div>

              <p className="text-[12.5px] text-amber-900/80 leading-relaxed">
                To enable real Google Sign-In, provide your Google Cloud OAuth Client ID in your local environment file:
              </p>

              <div className="p-2.5 bg-amber-100/70 border border-amber-300/60 rounded-xl font-mono text-[11.5px] text-amber-950 select-all overflow-x-auto">
                VITE_GOOGLE_CLIENT_ID=your-client-id
              </div>

              <div className="pt-1 text-[12px] text-amber-900/90 space-y-1">
                <p className="font-medium">Setup Steps:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-[11.5px]">
                  <li>Create a project in Google Cloud Console</li>
                  <li>Configure the OAuth consent screen</li>
                  <li>Create a <strong>Web application</strong> OAuth Client</li>
                  <li>Add <code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono">http://localhost:3000</code> to <strong>Authorized JavaScript origins</strong></li>
                  <li>Copy Client ID to <code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono">.env.local</code> and restart Vite</li>
                </ol>
              </div>

              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#5145FF] hover:underline pt-1"
              >
                <span>Open Google Cloud Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Privacy Note */}
          <p className="mt-6 text-[#8390A8] text-center text-[12px] leading-[1.6]">
            Sign in securely with your Google account. Notes auto-sync directly to your Google Drive.
          </p>

          <div className="mt-7 pt-5 border-t border-[#E9EDF5] text-center">
            <span className="text-[12.5px] text-[#8995AD] font-medium">
              Simple notes. Clear thoughts.
            </span>
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-8 text-center text-[12px] text-[#8995AD] select-none">
          NoteNest © 2026 · Frontend-Only Architecture
        </footer>
      </section>
    </div>
  );
};


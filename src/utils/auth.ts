import { AuthUser, GoogleIdTokenPayload } from '../types/auth';

export const AUTH_SESSION_KEY = 'notenest_auth_session';

/**
 * Safely decodes a base64url encoded JWT payload.
 * NOTE: This is client-side decoding for UI/profile purposes only.
 * It is NOT cryptographic verification of signature, which requires a backend.
 */
export function parseJwt(token: string): GoogleIdTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Validates Google ID token claims client-side.
 */
export function validateGoogleCredential(
  token: string,
  expectedClientId: string
): { valid: boolean; user?: AuthUser; error?: string } {
  if (!token) {
    return { valid: false, error: 'No credential token received from Google.' };
  }

  const payload = parseJwt(token);
  if (!payload) {
    return { valid: false, error: 'Unable to parse Google credential token.' };
  }

  // 1. Validate Issuer
  const validIssuers = ['https://accounts.google.com', 'accounts.google.com'];
  if (!validIssuers.includes(payload.iss)) {
    return { valid: false, error: 'Invalid token issuer.' };
  }

  // 2. Validate Audience / Client ID (if a real client ID is configured)
  const isCustomClientId =
    expectedClientId &&
    expectedClientId !== 'your-google-oauth-client-id' &&
    expectedClientId !== 'your-google-client-id';

  if (isCustomClientId && payload.aud !== expectedClientId) {
    return { valid: false, error: 'Token audience does not match configured Google Client ID.' };
  }

  // 3. Validate Expiration
  if (!payload.exp || typeof payload.exp !== 'number') {
    return { valid: false, error: 'Token contains invalid expiration timestamp.' };
  }

  const expMs = payload.exp * 1000;
  if (Date.now() >= expMs) {
    return { valid: false, error: 'Google credential has already expired.' };
  }

  // 4. Validate Subject identifier
  if (!payload.sub || typeof payload.sub !== 'string' || !payload.sub.trim()) {
    return { valid: false, error: 'Missing unique user identifier (sub).' };
  }

  const user: AuthUser = {
    sub: payload.sub,
    name: payload.name || payload.given_name || 'Google User',
    email: payload.email,
    picture: payload.picture,
    exp: expMs,
    idToken: token
  };

  return { valid: true, user };
}

/**
 * Loads and validates existing local session from storage.
 * If expired, malformed, or missing, immediately clears storage.
 */
export function loadAuthSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;

    const session: AuthUser = JSON.parse(raw);

    // Validate required fields exist
    if (!session || !session.sub || !session.exp) {
      clearAuthSession();
      return null;
    }

    // Check expiration timestamp
    if (Date.now() >= session.exp) {
      clearAuthSession();
      return null;
    }

    // If ID token is a standard 3-part JWT, verify claims
    if (session.idToken && session.idToken.includes('.')) {
      const payload = parseJwt(session.idToken);
      if (!payload || Date.now() >= payload.exp * 1000) {
        clearAuthSession();
        return null;
      }
    }

    return session;
  } catch {
    clearAuthSession();
    return null;
  }
}

/**
 * Saves authenticated user session to localStorage.
 */
export function saveAuthSession(user: AuthUser): void {
  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
  } catch {
    // Quota or storage unavailable fallback
  }
}

/**
 * Clears authenticated user session from localStorage.
 */
export function clearAuthSession(): void {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch {
    // Fallback
  }
}

/**
 * Validates return-to URLs to prevent Open Redirect attacks.
 * Only relative paths starting with / (and not // or protocol schemes) are allowed.
 */
export function sanitizeReturnUrl(returnUrl: string | null): string {
  if (!returnUrl) return '/';
  const trimmed = returnUrl.trim();
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.includes('\\') &&
    !trimmed.includes(':')
  ) {
    return trimmed;
  }
  return '/';
}


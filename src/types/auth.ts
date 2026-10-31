export interface AuthUser {
  sub: string;
  name: string;
  email?: string;
  picture?: string;
  exp: number; // in milliseconds
  idToken: string;
  accessToken?: string;
  accessTokenExp?: number;
}

export interface GoogleIdTokenPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number; // in seconds
  iat: number;
  name?: string;
  email?: string;
  picture?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  googleClientId: string;
  isConfigured: boolean;
  setCustomClientId: (id: string) => void;
  accessToken: string | null;
  driveConnected: boolean;
  driveSyncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  setDriveSyncStatus: (status: 'idle' | 'syncing' | 'synced' | 'error') => void;
  requestDrivePermission: () => Promise<boolean>;
  loginWithGoogleAndDrive: () => Promise<{ success: boolean; error?: string }>;
  loginWithCredential: (credential: string) => { success: boolean; error?: string };
  logout: () => void;
}

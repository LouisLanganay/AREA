interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: number;
  updatedAt: number;
  lastConnection?: number;
  status: 'active' | 'suspended';
  role: string;
  provider: string;
}

interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  emailNotifications: boolean;
}

interface UserSession {
  id: string;
  userId: string;
  token: string;
  lastActive: number;
  expiresAt: number;
  device?: {
      type: string;
      os: string;
      browser: string;
  };
}

interface UserAuthResponse {
  user: User;
  session: UserSession;
}

interface UserUpdateRequest {
  email?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
}

export type {
  User,
  UserPreferences,
  UserSession,
  UserAuthResponse,
  UserUpdateRequest
};

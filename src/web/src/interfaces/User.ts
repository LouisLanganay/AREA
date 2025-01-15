/**
 * Interface representing a user in the system
 */
interface User {
  id: string;                     // Unique identifier for the user
  email: string;                  // User's email address
  username: string;               // User's chosen username
  displayName?: string;           // Optional display name
  avatarUrl?: string;            // Optional URL to user's avatar
  createdAt: number;             // Timestamp of account creation
  updatedAt: number;             // Timestamp of last account update
  lastConnection?: number;        // Optional timestamp of last login
  status: 'active' | 'suspended'; // User account status
  role: string;                   // User's role in the system
  provider: string;              // Authentication provider (e.g., 'local', 'google')
}

/**
 * Interface for user preference settings
 */
interface UserPreferences {
  id: string;                           // Unique identifier for preferences
  userId: string;                       // Associated user ID
  theme: 'light' | 'dark' | 'system';  // UI theme preference
  notifications: boolean;               // In-app notifications toggle
  emailNotifications: boolean;          // Email notifications toggle
}

/**
 * Interface representing an active user session
 */
interface UserSession {
  id: string;           // Unique session identifier
  userId: string;       // Associated user ID
  token: string;        // Session token
  lastActive: number;   // Timestamp of last activity
  expiresAt: number;    // Session expiration timestamp
  device?: {            // Optional device information
      type: string;     // Device type (e.g., 'mobile', 'desktop')
      os: string;       // Operating system
      browser: string;  // Browser name
  };
}

/**
 * Interface for authentication response data
 */
interface UserAuthResponse {
  user: User;           // User information
  session: UserSession; // Session information
}

/**
 * Interface for user update request payload
 */
interface UserUpdateRequest {
  email?: string;       // New email address
  username?: string;    // New username
  displayName?: string; // New display name
  avatarUrl?: string;   // New avatar URL
}

export type {
  User,
  UserPreferences,
  UserSession,
  UserAuthResponse,
  UserUpdateRequest
};

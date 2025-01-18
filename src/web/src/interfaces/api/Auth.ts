/**
 * Interface for login request payload
 */
interface loginRequest {
  id: string;      // Can be either email or username
  password: string;
}

/**
 * Interface for user registration request payload
 */
interface registerRequest {
  email: string;
  username: string;
  password: string;
  displayName?: string;  // Optional display name
  avatarUrl?: string;    // Optional avatar URL
}

/**
 * Interface for forgot password request payload
 */
interface forgotRequest {
  email: string;
}

/**
 * Interface for password reset request payload
 */
interface resetRequest {
  password: string;  // New password
  token: string;     // Reset token received via email
}

/**
 * Interface for successful login response
 */
interface loginResponse {
  access_token: string;
}

/**
 * Interface for successful registration response
 */
interface registerResponse {
  access_token: string;
}

// Export all interfaces for use in other files
export type {
  loginRequest,
  loginResponse,
  registerRequest,
  registerResponse,
  forgotRequest,
  resetRequest
};

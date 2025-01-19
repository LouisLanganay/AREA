import {
  forgotRequest,
  loginRequest,
  loginResponse,
  registerRequest,
  registerResponse,
  resetRequest,
} from '../interfaces/api/Auth';
import axiosInstance from './axiosInstance';

/**
 * Registers a new user
 * @param request - User registration data
 * @returns Promise with registration response
 * @throws Error if registration fails
 */
export const register = async (
  request: registerRequest
): Promise<registerResponse> => {
  const response = await axiosInstance.post<any>(`/auth/register`, {
    email: request.email,
    password: request.password,
    username: request.username,
  });

  if (response.status !== 201) {
    throw new Error('Failed to register');
  }

  return response.data;
};

/**
 * Authenticates a user
 * @param request - Login credentials
 * @returns Promise with login response
 * @throws Error if login fails
 */
export const login = async (
  request: loginRequest
): Promise<loginResponse> => {
  const response = await axiosInstance.post<any>(`/auth/login`, {
    id: request.id,
    password: request.password,
  });

  if (response.status !== 200) {
    throw new Error('Failed to login');
  }

  return response.data;
};

/**
 * Initiates password recovery process
 * @param request - Email for password recovery
 * @throws Error if request fails
 */
export const forgotPassword = async (
  request: forgotRequest
): Promise<void> => {
  const response = await axiosInstance.post(`/auth/forgot-password`, {
    email: request.email
  });

  if (response.status !== 200) {
    throw new Error('Failed to forgot password');
  }

  return response.data;
};

/**
 * Handles OAuth callback processing
 * @param callback_uri - OAuth callback URL
 * @param token - OAuth token
 * @param userToken - User's authentication token
 * @returns Promise with OAuth response
 * @throws Error if authentication fails
 */
export const oauthCallback = async (callback_uri: string, token: string, userToken: string) => {
  const response = await axiosInstance.post(`${callback_uri}`, {
    code: token
  }, {
    headers: {
      Authorization: `Bearer ${userToken}`,
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to authenticate with service');
  }

  return response.data;
};

/**
 * Resets user password
 * @param request - New password and reset token
 * @returns Promise with reset response
 * @throws Error if reset fails
 */
export const resetPassword = async (request: resetRequest) => {
  const response = await axiosInstance.post(`/auth/reset-password`, request);

  if (response.status !== 200) {
    throw new Error('Failed to reset password');
  }

  return response.data;
};

/**
 * Handles Google OAuth authentication
 * @param code - Google OAuth code
 * @returns Promise with login response
 * @throws Error if authentication fails
 */
export const googleOAuth = async (code: string): Promise<loginResponse> => {
  const response = await axiosInstance.post(`/auth/google`, {
    code: code
  });
  if (response.status !== 200 && response.status !== 201) {
    throw new Error('Failed to authenticate with Google');
  }
  return response.data;
};

/**
 * Handles Discord OAuth authentication
 * @param code - Discord OAuth code
 * @returns Promise with login response
 * @throws Error if authentication fails
 */
export const discordOAuth = async (code: string): Promise<loginResponse> => {
  const response = await axiosInstance.post(`/auth/discord`, {
    code: code
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error('Failed to authenticate with Discord');
  }

  return response.data;
};

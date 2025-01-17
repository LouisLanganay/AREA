import { checkIfUsernameIsAvailableResponse, getMeResponse, isAdminResponse } from "@/interfaces/api/User";
import { User } from "@/interfaces/User";
import axiosInstance from "./axiosInstance";

/**
 * Fetches current user's information
 * @param token - User's authentication token
 * @returns Promise with user data
 * @throws Error if request fails
 */
export const getMe = async (token: string): Promise<getMeResponse> => {
  const response = await axiosInstance.get<getMeResponse>(`/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to get me');
  }

  return response.data;
};

/**
 * Updates user profile information
 * @param token - User's authentication token
 * @param user - Updated user data
 * @throws Error if update fails
 */
export const updateUser = async (token: string, user: User): Promise<void> => {
  const response = await axiosInstance.put(`/users/update`, user, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to update user');
  }

  return response.data;
};

/**
 * Checks if a username is available
 * @param username - Username to check
 * @returns Promise with availability status
 */
export const checkIfUsernameIsAvailable = async (username: string): Promise<checkIfUsernameIsAvailableResponse> => {
  const response = await axiosInstance.get<checkIfUsernameIsAvailableResponse>(`/users/use/${username}`);
  return response.data;
};

/**
 * Fetches all users (admin only)
 * @param token - Admin's authentication token
 * @returns Promise with array of users
 */
export const getUsers = async (token: string): Promise<User[]> => {
  const response = await axiosInstance.get<User[]>(`/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.data;
};

/**
 * Deletes a user (admin only)
 * @param token - Admin's authentication token
 * @param userId - ID of user to delete
 */
export const deleteUser = async (token: string, userId: string): Promise<void> => {
  const response = await axiosInstance.delete(`/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.data;
};

/**
 * Deletes the current user
 * @param token - User's authentication token
 */
export const deleteMe = async (token: string): Promise<void> => {
  const response = await axiosInstance.delete(`/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.data;
};

/**
 * Updates user status (admin only)
 * @param token - Admin's authentication token
 * @param userId - ID of user to update
 * @param status - New status value
 */
export const setStatus = async (token: string, userId: string, status: string): Promise<void> => {
  const response = await axiosInstance.get(`/users/setStatus/${userId}/${status}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.data;
};

/**
 * Creates an admin user
 * Used for initial setup
 */
export const createAdmin = async (): Promise<void> => {
  const response = await axiosInstance.get(`/auth/createAdmin`);
  return response.data;
};

/**
 * Checks if current user is an admin
 * @param token - User's authentication token
 * @returns Promise with admin status
 */
export const isAdmin = async (token: string): Promise<isAdminResponse> => {
  const response = await axiosInstance.get<isAdminResponse>(`/users/isAdmin`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.data;
};


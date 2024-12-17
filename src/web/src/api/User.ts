import { checkIfUsernameIsAvailableResponse, getMeResponse } from "@/interfaces/api/User";
import { User } from "@/interfaces/User";
import axiosInstance from "./axiosInstance";

export const getMe = async (token: string): Promise<getMeResponse> => {
  const response = await axiosInstance.get<getMeResponse>(`/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to get me');
  }

  return response.data;
};

export const updateUser = async (token: string, user: User): Promise<void> => {
  const response = await axiosInstance.put(`/users/update`, user, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to update user');
  }

  return response.data;
};

export const checkIfUsernameIsAvailable = async (username: string): Promise<checkIfUsernameIsAvailableResponse> => {
  const response = await axiosInstance.get<checkIfUsernameIsAvailableResponse>(`/users/use/${username}`);
  return response.data;
};

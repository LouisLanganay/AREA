import { checkIfUsernameIsAvailableResponse, getMeResponse } from "@/interfaces/api/User";
import { User } from "@/interfaces/User";
import axiosInstance from "./axiosInstance";

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

export const checkIfUsernameIsAvailable = async (username: string): Promise<checkIfUsernameIsAvailableResponse> => {
  const response = await axiosInstance.get<checkIfUsernameIsAvailableResponse>(`/users/use/${username}`);
  return response.data;
};

export const getUsers = async (token: string): Promise<User[]> => {
  const response = await axiosInstance.get<User[]>(`/users/allUsers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.data;
};

export const deleteUser = async (token: string, userId: string): Promise<void> => {
  const response = await axiosInstance.delete(`/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.data;
};

export const setStatus = async (token: string, userId: string, status: string): Promise<void> => {
  const response = await axiosInstance.get(`/users/setStatus/${userId}/${status}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.data;
};

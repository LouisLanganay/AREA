import axios from 'axios';
import { User } from '../../../shared/Users';
import { getMeResponse } from '@/interfaces/api/User';

export const getUser = async (userId: string): Promise<User> => {
  const response = await axios.get<User>(`${import.meta.env.VITE_API_URL}/users/${userId}`);
  return response.data;
};

export const getMe = async (token: string): Promise<getMeResponse> => {
  const response = await axios.get<any>(`${import.meta.env.VITE_API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error('Failed to get me');
  }

  return response.data;
};

export const updateUser = async (token: string, user: User): Promise<User> => {
  const response = await axios.put<User>(`${import.meta.env.VITE_API_URL}/users/update`, user, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error('Failed to update user');
  }

  return response.data;
};


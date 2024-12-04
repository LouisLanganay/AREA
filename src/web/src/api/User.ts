import axios from 'axios';
import { User } from '../../../shared/Users';
import { getMe_response } from '../../../shared/user/user_route';

export const getUser = async (userId: string): Promise<User> => {
  const response = await axios.get<User>(`${import.meta.env.VITE_API_URL}/users/${userId}`);
  return response.data;
};

export const getMe = async (token: string): Promise<getMe_response> => {
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

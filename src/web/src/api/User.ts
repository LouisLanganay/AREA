import axios from 'axios';
import { User } from '../../../shared/Users';
import { getMe_response } from '../../../shared/user/user_route';

const API_BASE_URL = 'http://localhost:8080';

export const getUser = async (userId: string): Promise<User> => {
  const response = await axios.get<User>(`${API_BASE_URL}/users/${userId}`);
  return response.data;
};

export const getMe = async (token: string): Promise<getMe_response> => {
  const response = await axios.get<any>(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error('Failed to get me');
  }

  return response.data;
};

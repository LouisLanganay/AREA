import axios from 'axios';
import { User } from '../../../shared/Users';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const getUser = async (userId: string): Promise<User> => {
  const response = await axios.get<User>(`${API_BASE_URL}/users/${userId}`);
  return response.data;
};

import axios from 'axios';
import { User } from '../../../shared/Users';

const API_BASE_URL = "http://localhost:8080/api";

export const getUser = async (userId: string): Promise<User> => {
  const response = await axios.get<User>(`${API_BASE_URL}/users/${userId}`);
  return response.data;
};

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export const register = async (
  email: string,
  password: string,
  username: string,
  displayName?: string,
  avatarUrl?: string,
): Promise<void> => {
  const response = await axios.post<void>(`${API_BASE_URL}/auth/register`, {
    email,
    password,
    username,
    displayName,
    avatarUrl,
  });

  console.log(response.data);

  return response.data;
};
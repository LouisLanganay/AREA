import { getMeResponse } from "@/interfaces/api/User";
import { User } from "@/interfaces/User";
import axios from "axios";

export const getMe = async (token: string): Promise<getMeResponse> => {
  const response = await axios.get<getMeResponse>(`${import.meta.env.VITE_API_URL}/users/me`, {
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
  const response = await axios.put(`${import.meta.env.VITE_API_URL}/users/update`, user, {
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

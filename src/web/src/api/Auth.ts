import axios from 'axios';
import {
  login_request,
  login_response,
  register_request,
  register_response
} from '../../../shared/user/login_register_forgot';
import { Service } from '../../../shared/Workflow';

export const register = async (
  request: register_request
): Promise<register_response> => {
  const response = await axios.post<any>(`${import.meta.env.VITE_API_URL}/auth/register`, {
    email: request.email,
    password: request.password,
    username: request.username,
  });

  if (response.status !== 201) {
    throw new Error('Failed to register');
  }

  return response.data;
};

export const login = async (
  request: login_request
): Promise<login_response> => {
  const response = await axios.post<any>(`${import.meta.env.VITE_API_URL}/auth/login`, {
    id: request.id,
    password: request.password,
  });

  if (response.status !== 200) {
    throw new Error('Failed to login');
  }

  return response.data;
};

export const forgotPassword = async (data: { email: string }) => {
  return await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, data);
};

export const oauthCallback = async (callback_uri: string, token: string, userToken: string) => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}${callback_uri}`, {
    token: token,
    headers: {
      Authorization: `Bearer ${userToken}`
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to authenticate with service');
  }

  return response.data;
};

import axios from 'axios';
import {
  login_request,
  login_response,
  register_request,
  register_response
} from '../../../shared/user/login_register_forgot';

const API_BASE_URL = 'http://localhost:8080';

export const register = async (
  request: register_request
): Promise<register_response> => {
  const response = await axios.post<any>(`${API_BASE_URL}/auth/register`, {
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
  const response = await axios.post<any>(`${API_BASE_URL}/auth/login`, {
    id: request.id,
    password: request.password,
  });

  if (response.status !== 200) {
    throw new Error('Failed to login');
  }

  return response.data;
};

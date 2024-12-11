import axios from 'axios';
import {
  loginRequest,
  loginResponse,
  registerRequest,
  registerResponse,
  forgotRequest,
  resetRequest,
} from '../interfaces/api/Auth';

export const register = async (
  request: registerRequest
): Promise<registerResponse> => {
  const response = await axios.post<any>(`${import.meta.env.VITE_API_URL}/auth/register`, {
    email: request.email,
    password: request.password,
    username: request.username,
  }, {
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  });

  if (response.status !== 201) {
    throw new Error('Failed to register');
  }

  return response.data;
};

export const login = async (
  request: loginRequest
): Promise<loginResponse> => {
  const response = await axios.post<any>(`${import.meta.env.VITE_API_URL}/auth/login`, {
    id: request.id,
    password: request.password,
  }, {
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to login');
  }

  return response.data;
};

export const forgotPassword = async (
  request: forgotRequest
): Promise<void> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
    email: request.email
  }, {
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to forgot password');
  }

  return response.data;
};

export const oauthCallback = async (callback_uri: string, token: string, userToken: string) => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}${callback_uri}`, {
    code: token
  }, {
    headers: {
      Authorization: `Bearer ${userToken}`,
      'ngrok-skip-browser-warning': 'true'
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to authenticate with service');
  }

  return response.data;
};

export const resetPassword = async (request: resetRequest) => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, request, {
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to reset password');
  }

  return response.data;
};

export const googleOAuth = async (code: string): Promise<loginResponse> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
    code: code
  }, {
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  });
  if (response.status !== 200 && response.status !== 201) {
    throw new Error('Failed to authenticate with Google');
  }
  return response.data;
};

export const discordOAuth = async (code: string): Promise<loginResponse> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/discord`, {
    code: code
  }, {
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error('Failed to authenticate with Discord');
  }

  return response.data;
};

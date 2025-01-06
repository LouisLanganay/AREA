import { ServiceAuth } from '@/interfaces/api/Service';
import { Service } from '@/interfaces/Services';
import axiosInstance from './axiosInstance';

export const getServices = async (token: string): Promise<Service[]> => {
  const response = await axiosInstance.get<Service[]>(`/services`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to get services');
  }

  return response.data;
};

export const getServiceAuth = async (serviceUri: string, userToken: string): Promise<ServiceAuth> => {
  const response = await axiosInstance.get<ServiceAuth>(`${serviceUri}`, {
    headers: {
      Authorization: `Bearer ${userToken}`,
      'ngrok-skip-browser-warning': 'true'
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to get service auth');
  }

  return response.data;
};

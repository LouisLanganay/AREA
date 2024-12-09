import axios from 'axios';
import { Service } from '../../../shared/Workflow';
import { ServiceAuth } from '@/interfaces/api/Service';

export const getServices = async (): Promise<Service[]> => {
  const response = await axios.get<Service[]>(`${import.meta.env.VITE_API_URL}/services`);

  if (response.status !== 200) {
    throw new Error('Failed to get services');
  }

  return response.data;
};

export const getServiceAuth = async (serviceUri: string, userToken: string): Promise<ServiceAuth> => {
  const response = await axios.get<ServiceAuth>(`${import.meta.env.VITE_API_URL}${serviceUri}`, {
    headers: {
      Authorization: `Bearer ${userToken}`
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to get service auth');
  }

  return response.data;
};

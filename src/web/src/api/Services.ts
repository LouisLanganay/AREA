import axios from 'axios';
import { Service } from '../../../shared/Workflow';

export const getServices = async (): Promise<Service[]> => {
  const response = await axios.get<Service[]>(`${import.meta.env.VITE_API_URL}/services`);

  if (response.status !== 200) {
    throw new Error('Failed to get services');
  }

  return response.data;
};

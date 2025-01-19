import { ServiceAuth } from '@/interfaces/api/Service';
import { Service } from '@/interfaces/Services';
import axiosInstance from './axiosInstance';

/**
 * Fetches all available services
 * @param token - User's authentication token
 * @returns Promise with array of services
 * @throws Error if request fails
 */
export const getServices = async (token: string): Promise<Service[]> => {
  const response = await axiosInstance.get<Service[]>(`/services`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to get services');
  }

  return response.data;
};

/**
 * Gets authentication details for a specific service
 * @param serviceUri - URI of the service to authenticate with
 * @param userToken - User's authentication token
 * @returns Promise with service authentication details
 * @throws Error if request fails
 */
export const getServiceAuth = async (serviceUri: string, userToken: string): Promise<ServiceAuth> => {
  const response = await axiosInstance.get<ServiceAuth>(`${serviceUri}`, {
    headers: {
      Authorization: `Bearer ${userToken}`,
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to get service auth');
  }

  return response.data;
};

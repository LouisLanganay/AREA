import axios from 'axios';
import { createWorkflowRequest, getWorkflowResponse } from '@/interfaces/api/Workflows';
import { Workflow } from '@/interfaces/Workflows';

export const getWorkflows = async (token: string): Promise<Workflow[]> => {
  const response = await axios.get<Workflow[]>(`${import.meta.env.VITE_API_URL}/workflows`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    },
  });
  return response.data;
};

export const updateWorkflow = async (id: string, data: Partial<Workflow>) => {
  const response = await axios.patch<Workflow>(`${import.meta.env.VITE_API_URL}/workflows/${id}`, data, {
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  });
  return response.data;
};

export const deleteWorkflow = async (id: string, token: string) => {
  const response = await axios.delete(`${import.meta.env.VITE_API_URL}/workflows/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    }
  });
  return response.data;
};

export const getWorkflow = async (id: string, token: string): Promise<getWorkflowResponse> => {
  const response = await axios.get<getWorkflowResponse>(`${import.meta.env.VITE_API_URL}/workflows/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to get workflow');
  }

  return response.data;
};

export const createWorkflow = async (data: createWorkflowRequest, token: string) => {
  const response = await axios.post<Workflow>(
    `${import.meta.env.VITE_API_URL}/workflows`,
    {
      ...data,
      image: "https://example.com/workflow.png",
      enabled: true // Default to enabled
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      },
    }
  );
  return response.data;
};


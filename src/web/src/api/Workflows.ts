import { createWorkflowRequest, getWorkflowResponse } from '@/interfaces/api/Workflows';
import { Workflow, ensureChildrenArrays } from '@/interfaces/Workflows';
import axiosInstance from './axiosInstance';

export const getWorkflows = async (token: string): Promise<Workflow[]> => {
  const response = await axiosInstance.get<Workflow[]>(`/workflows`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateWorkflow = async (id: string, data: Partial<Workflow>, token: string) => {
  const sanitizedData = ensureChildrenArrays(data);
  const response = await axiosInstance.patch<Workflow>(
    `/workflows/${id}`,
    sanitizedData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }
  );
  return response.data;
};

export const deleteWorkflow = async (id: string, token: string) => {
  const response = await axiosInstance.delete(`/workflows/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.data;
};

export const getWorkflow = async (id: string, token: string): Promise<getWorkflowResponse> => {
  const response = await axiosInstance.get<getWorkflowResponse>(`/workflows/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to get workflow');
  }

  return response.data;
};

export const createWorkflow = async (data: createWorkflowRequest, token: string) => {
  const response = await axiosInstance.post<Workflow>(
    `/workflows`,
    {
      ...data,
      image: "https://example.com/workflow.png",
      enabled: true // Default to enabled
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const runWorkflow = async (id: string, token: string) => {
  const response = await axiosInstance.get(`/workflows/run/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.data;
};

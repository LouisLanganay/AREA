import { createWorkflowRequest, getWorkflowResponse } from '@/interfaces/api/Workflows';
import { Workflow, ensureChildrenArrays } from '@/interfaces/Workflows';
import axiosInstance from './axiosInstance';

/**
 * Fetches all workflows
 * @param token - User's authentication token
 * @returns Promise with array of workflows
 */
export const getWorkflows = async (token: string): Promise<Workflow[]> => {
  const response = await axiosInstance.get<Workflow[]>(`/workflows`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Updates an existing workflow
 * @param id - Workflow ID
 * @param data - Updated workflow data
 * @param token - User's authentication token
 * @returns Promise with updated workflow
 */
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

/**
 * Deletes a workflow
 * @param id - Workflow ID
 * @param token - User's authentication token
 */
export const deleteWorkflow = async (id: string, token: string) => {
  const response = await axiosInstance.delete(`/workflows/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.data;
};

/**
 * Fetches a specific workflow
 * @param id - Workflow ID
 * @param token - User's authentication token
 * @returns Promise with workflow details
 * @throws Error if request fails
 */
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

/**
 * Creates a new workflow
 * @param data - New workflow data
 * @param token - User's authentication token
 * @returns Promise with created workflow
 */
export const createWorkflow = async (data: createWorkflowRequest, token: string) => {
  const sanitizedData = ensureChildrenArrays(data);
  const response = await axiosInstance.post<Workflow>(
    `/workflows`,
    {
      ...sanitizedData,
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

/**
 * Executes a workflow
 * @param id - Workflow ID
 * @param token - User's authentication token
 * @returns Promise with execution results
 */
export const runWorkflow = async (id: string, token: string) => {
  const response = await axiosInstance.get(`/workflows/run/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.data;
};

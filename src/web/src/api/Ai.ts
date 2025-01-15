import axiosInstance from "./axiosInstance";

/**
 * Generates a workflow based on the provided prompt
 * @param openaiToken - OpenAI API token
 * @param prompt - Workflow generation prompt
 * @returns Promise with the generated workflow response
 * @throws Error if generation fails
 */
export const generateWorkflow = async (openaiToken: string, prompt: string): Promise<WorkflowResponse> => {
  const response = await axiosInstance.post('/ai/generate-workflow', {
    openaiToken,
    prompt
  });

  if (response.status !== 201) {
    throw new Error('Failed to generate workflow');
  }

  return response.data;
};

interface WorkflowResponse {
  success: boolean;
  message: string;
  data: {
    prompt: string;
    workflow: any;
  };
}

import { Event, Workflow, WorkflowHistory } from "../Workflows";

/**
 * Interface for the response when fetching a workflow
 * Extends the base Workflow interface
 */
interface getWorkflowResponse extends Workflow {}

/**
 * Interface for creating a new workflow request
 */
interface createWorkflowRequest {
  name: string;        // Name of the workflow
  description: string; // Description of the workflow
  enabled: boolean;    // Whether the workflow is active
  triggers: Event[];   // Array of events that trigger the workflow
}

/**
 * Interface for workflow history entry with workflow details
 */
interface WorkflowHistoryEntry {
  executionDate: string;
  status: 'success' | 'failure';
  workflow: {
    id: string;
    name: string;
  };
}

/**
 * Interface for the response when fetching the workflow history
 * Updated to match actual API response structure
 */
interface getWorkflowHistoryResponse {
  workflowId: string;
  name: string;
  history: WorkflowHistory[]; // Array of workflow history items
}

export type {
  getWorkflowResponse,
  createWorkflowRequest,
  getWorkflowHistoryResponse,
  WorkflowHistoryEntry
};

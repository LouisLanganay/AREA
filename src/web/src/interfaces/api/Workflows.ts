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
 * Interface for the response when fetching the workflow history
 */
interface getWorkflowHistoryResponse {
  workflowId: string;
  name: string;
  history: WorkflowHistory[]; // Array of workflow history items
}

export type {
  getWorkflowResponse,
  createWorkflowRequest,
  getWorkflowHistoryResponse
};

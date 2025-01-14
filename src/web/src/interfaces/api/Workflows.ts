import { Event, Workflow } from "../Workflows";

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

export type {
  getWorkflowResponse,
  createWorkflowRequest
};

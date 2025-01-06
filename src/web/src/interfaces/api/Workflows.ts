import { Event, Workflow } from "../Workflows";

interface getWorkflowResponse extends Workflow {}

interface createWorkflowRequest {
  name: string;
  description: string;
  enabled: boolean;
  triggers: Event[];
}

export type {
  getWorkflowResponse,
  createWorkflowRequest
};

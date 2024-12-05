import { FieldGroup } from '../../../shared/Workflow';
import { Service } from '../../../shared/Workflow';

interface WorkflowNodeData {
  label?: string;
  status?: 'pending' | 'success' | 'error';
  service?: Service;
  fieldGroups?: FieldGroup[];
  description?: string;
  isTrigger?: boolean;
  isValid?: boolean;
  [key: string]: unknown;
}

type WorkflowNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: WorkflowNodeData;
};

type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: React.CSSProperties;
};

const nodeWidth = 330;
const nodeHeight = 100;

export { nodeWidth, nodeHeight };
export type { WorkflowNodeData, WorkflowNode, WorkflowEdge };

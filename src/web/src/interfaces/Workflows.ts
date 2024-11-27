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

export type { WorkflowNodeData };

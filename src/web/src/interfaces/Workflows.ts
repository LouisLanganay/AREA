import AddNode from "@/components/flow/AddNode";
import { Service } from "./Services";

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

const flowStyles = `
  @keyframes flowAnimation {
    from { stroke-dashoffset: 24; }
    to { stroke-dashoffset: 0; }
  }
`;

export { nodeWidth, nodeHeight, flowStyles };
export type { WorkflowNodeData, WorkflowNode, WorkflowEdge };

interface Field {
  id: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'date' | 'checkbox' | 'color';
  description: string;                    // ex: "Server"
  value?: any;                      // ex: "167628734852438"
  required: boolean;                // ex: true
  options?: any[];
}

interface FieldGroup {
  id: string;
  name: string;                     // ex: "Server"
  description: string;              // ex: "The server where the action will be executed"
  type: string;                     // ex: "server"
  fields: Field[];
}

interface Event {
  type : 'action' | 'reaction'
  id_node: string;
  id: string;
  name: string;
  description: string;
  serviceName: string;
  fieldGroups: FieldGroup[];
  dependsOn: string | null;
  execute?: (parameters: FieldGroup[]) => void;
  check?: (parameters: FieldGroup[]) => Promise<boolean>;
}

interface Condition {
  id: string;
  lastChecked?: number;            // timestamp
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  variable: string;                // The variable to check (e.g., "branch")
  value: any;                      // The value to compare against (e.g., "main")
  type?: 'string' | 'number' | 'boolean';  // Optional type for value validation
}

interface Variable {
  id: string;
  name: string;                    // ex: "%author_name%"
  description: string;             // ex: "The name of the author of the message"
  type: 'string' | 'number';       // ex: "string"
  value: any;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  image: string;
  nodes: Event[];
  enabled?: boolean;
}

export type {
  Field,
  FieldGroup,
  Event,
  Condition,
  Variable,
  Workflow
};

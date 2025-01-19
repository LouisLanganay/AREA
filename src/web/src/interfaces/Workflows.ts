import { Service } from "./Services";

/**
 * Interface for data associated with a workflow node
 */
interface WorkflowNodeData {
  label?: string;                                    // Display name of the node
  status?: 'pending' | 'success' | 'error';         // Current execution status
  service?: Service;                                // Associated service
  fieldGroups?: FieldGroup[];                       // Configuration field groups
  description?: string;                             // Node description
  isTrigger?: boolean;                             // Whether node is a trigger
  isValid?: boolean;                               // Validation status
  [key: string]: unknown;                          // Additional dynamic properties
}

/**
 * Type definition for a workflow node
 */
type WorkflowNode = {
  id: string;                                      // Unique node identifier
  type: string;                                    // Node type
  position: { x: number; y: number };              // Node position in workflow
  data: WorkflowNodeData;                         // Node data
};

/**
 * Type definition for workflow connections
 */
type WorkflowEdge = {
  id: string;                                      // Unique edge identifier
  source: string;                                  // Source node ID
  target: string;                                  // Target node ID
  type?: string;                                   // Edge type
  animated?: boolean;                              // Animation flag
  style?: React.CSSProperties;                     // Custom styling
};

/**
 * Interface for form fields in workflows
 */
interface Field {
  id: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'date' | 'checkbox' | 'color' | 'dateTime';
  description: string;                             // Field description
  value?: any;                                    // Field value
  required: boolean;                              // Required flag
  options?: any[];                                // Options for select fields
}

/**
 * Interface for grouping related fields
 */
interface FieldGroup {
  id: string;
  name: string;                                   // Group name
  description: string;                            // Group description
  type: string;                                   // Group type
  fields: Field[];                               // Contained fields
}

/**
 * Interface for workflow events
 */
interface Event {
  type: 'action' | 'reaction';                    // Event type
  id_node: string;                                // Associated node ID
  id: string;                                     // Event ID
  name: string;                                   // Event name
  description: string;                            // Event description
  serviceName: string;                            // Associated service
  fieldGroups: FieldGroup[];                      // Configuration groups
  children?: Event[];                             // Child events
  execute?: (parameters: FieldGroup[]) => void;    // Execution function
  check?: (parameters: FieldGroup[]) => Promise<boolean>; // Validation function
}

/**
 * Interface for workflow conditions
 */
interface Condition {
  id: string;
  lastChecked?: number;                           // Last check timestamp
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  variable: string;                               // Variable to check
  value: any;                                     // Comparison value
  type?: 'string' | 'number' | 'boolean';         // Value type
}

/**
 * Interface for workflow variables
 */
interface Variable {
  id: string;
  name: string;                                   // Variable name
  description: string;                            // Variable description
  type: 'string' | 'number';                      // Variable type
  value: any;                                     // Variable value
}

/**
 * Interface for complete workflow definition
 */
interface Workflow {
  id: string;                                     // Workflow ID
  name: string;                                   // Workflow name
  description: string;                            // Workflow description
  image: string;                                  // Workflow image
  triggers: Event[];                              // Trigger events
  createdAt: number;                              // Creation timestamp
  updatedAt: number;                              // Last update timestamp
  enabled?: boolean;                              // Enabled status
  favorite: boolean;                              // Favorite status
}

/**
 * Interface for basic workflow information
 */
interface BasicWorkflow {
  id: string;
  name: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Constants for node dimensions and styling
const nodeWidth = 330;
const nodeHeight = 100;

// Animation styles for flow connections
const flowStyles = `
  @keyframes flowAnimation {
    from { stroke-dashoffset: 24; }
    to { stroke-dashoffset: 0; }
  }
`;

/**
 * Ensures children arrays exist in workflow data
 */
const ensureChildrenArrays = (data: Partial<Workflow>): Partial<Workflow> => {
  if (!data.triggers)
    return data;
  const checkChildren = (children: Event[]): Event[] => {
    if (children.length > 0) {
      return children.map(child => ({
        ...child,
        children: checkChildren(child.children || [])
      }));
    }
    return children;
  };

  return {
    ...data,
    triggers: checkChildren(data.triggers || [])
  };
};

/**
 * Interface for workflow history
 */
interface WorkflowHistory {
  executionDate: string;
  status: 'success' | 'error';
}

export { nodeWidth, nodeHeight, flowStyles, ensureChildrenArrays };
export type {
  WorkflowNodeData,
  WorkflowNode,
  WorkflowEdge,
  Field,
  FieldGroup,
  Event,
  Condition,
  Variable,
  Workflow,
  WorkflowHistory,
  BasicWorkflow
};

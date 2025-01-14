import { WorkflowNode, WorkflowEdge, nodeWidth, nodeHeight, Workflow, Event, Field } from '@/interfaces/Workflows';
import dagre from '@dagrejs/dagre';
import { ConnectionLineType } from '@xyflow/react';

/**
 * Recursively searches for a node by its ID in a tree structure of events
 * @param nodes - Array of Event nodes to search through
 * @param nodeId - ID of the node to find
 * @returns The found Event node or undefined
 */
export function findNode(nodes: Event[] | undefined, nodeId: string): Event | undefined {
  if (!nodes || nodes.length === 0) return undefined;

  const directMatch = nodes.find((node) => node.id === nodeId);
  if (directMatch) return directMatch;

  // Recursively search through children
  for (const node of nodes) {
    const found = findNode(node.children, nodeId);
    if (found) return found;
  }
  return undefined;
}

/**
 * Recursively searches for a field by its ID in a tree structure of events
 * @param nodes - Array of Event nodes to search through
 * @param fieldId - ID of the field to find
 * @returns The found Field or undefined
 */
export function findField(nodes: Event[], fieldId: string): Field | undefined {
  for (const node of nodes) {
    // Search through field groups in current node
    for (const group of node.fieldGroups) {
      const found = group.fields.find(field => field.id === fieldId);
      if (found) return found;
    }
    // Recursively search through children
    if (node.children) {
      const found = findField(node.children, fieldId);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Validates a workflow by checking if all required fields have values
 * @param workflow - Workflow to validate
 * @returns boolean indicating if the workflow is valid
 */
export const validateWorkflow = (workflow: Workflow): boolean => {
  const validateFields = (nodes: Event[]): boolean => {
    if (!nodes) return true;
    for (const node of nodes) {
      // Check all fields in all groups
      for (const group of node.fieldGroups) {
        for (const field of group.fields) {
          if (field.required && !field.value) {
            return false;
          }
        }
      }
      // Recursively validate children
      if (node.children) {
        const isValid = validateFields(node.children);
        if (!isValid) return false;
      }
    }
    return true;
  };

  return validateFields(workflow.triggers);
};

/**
 * Calculates the layout positions for workflow nodes and edges using dagre
 * @param nodes - Array of workflow nodes
 * @param edges - Array of workflow edges
 * @param direction - Layout direction ('TB' for top-bottom, 'LR' for left-right)
 * @param ranksep - Vertical separation between nodes
 * @param nodesep - Horizontal separation between nodes
 * @param edgesep - Edge separation
 * @returns Object containing positioned nodes and styled edges
 */
export const getLayoutedElements = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  direction = 'TB',
  ranksep = 40,
  nodesep = 40,
  edgesep = 20
) => {
  // Initialize dagre graph
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep, ranksep, edgesep });

  // Separate normal nodes from add nodes
  const normalNodes = nodes.filter(node => node.type === 'node');
  const addNodes = nodes.filter(node => node.type === 'custom2');

  // Add normal nodes to dagre graph
  normalNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to dagre graph (excluding add node connections)
  edges.forEach((edge) => {
    if (!edge.target.includes('-add')) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply calculated positions to normal nodes
  const layoutedNormalNodes = normalNodes.map((node, index) => ({
    ...node,
    targetPosition: isHorizontal ? 'left' : 'top',
    sourcePosition: isHorizontal ? 'right' : 'bottom',
    position: {
      x: dagreGraph.node(node.id).x - nodeWidth / 2,
      y: dagreGraph.node(node.id).y - (index === 0 ? 25 : 0),
    },
  }));

  // Position add nodes relative to their parent nodes
  const layoutedAddNodes = addNodes.map((addNode, index) => {
    const parentId = addNode.id.split('-add')[0];
    const parentNode = layoutedNormalNodes.find(node => node.id === parentId);
    if (!parentNode) return addNode;

    return {
      ...addNode,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: parentNode.position.x + (nodeWidth - 36) / 2,
        y: parentNode.position.y + nodeHeight + (index === addNodes.length - 1 ? 22 : 0),
      },
    };
  });

  // Return positioned nodes and styled edges
  return {
    nodes: [...layoutedNormalNodes, ...layoutedAddNodes],
    edges: edges.map(edge => ({
      ...edge,
      type: ConnectionLineType.SmoothStep,
      style: {
        stroke: 'hsl(var(--muted-foreground))',
        opacity: 1,
      },
      markerEnd: {
        width: 20,
        height: 20,
        color: 'hsl(var(--muted-foreground))',
      },
    }))
  };
};

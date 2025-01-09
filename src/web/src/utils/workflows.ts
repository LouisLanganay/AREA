import { WorkflowNode, WorkflowEdge, nodeWidth, nodeHeight, Workflow, Event, Field } from '@/interfaces/Workflows';
import dagre from '@dagrejs/dagre';
import { ConnectionLineType, MarkerType } from '@xyflow/react';

export function findNode(nodes: Event[] | undefined, nodeId: string): Event | undefined {
  if (!nodes || nodes.length === 0) return undefined;

  const directMatch = nodes.find((node) => node.id === nodeId);
  if (directMatch)
    return directMatch;
  for (const node of nodes) {
    const found = findNode(node.children, nodeId);
    if (found) return found;
  }
  return undefined;
}

export function findField(nodes: Event[], fieldId: string): Field | undefined {
  for (const node of nodes) {
    for (const group of node.fieldGroups) {
      const found = group.fields.find(field => field.id === fieldId);
      if (found) return found;
    }
    if (node.children) {
      const found = findField(node.children, fieldId);
      if (found) return found;
    }
  }
  return undefined;
}

export const validateWorkflow = (workflow: Workflow): boolean => {
  const validateFields = (nodes: Event[]): boolean => {
    if (!nodes) return true;
    for (const node of nodes) {
      for (const group of node.fieldGroups) {
        for (const field of group.fields) {
          if (field.required && !field.value) {
            return false;
          }
        }
      }
      if (node.children) {
        const isValid = validateFields(node.children);
        if (!isValid) return false;
      }
    }
    return true;
  };

  return validateFields(workflow.triggers);
};

export const getLayoutedElements = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  direction = 'TB',
  ranksep = 100,
  nodesep = 100,
  edgesep = 50
) => {
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: nodesep,
    ranksep: ranksep,
    edgesep: edgesep,
  });

  const normalNodes = nodes.filter(node => node.type === 'node');
  const addNodes = nodes.filter(node => node.type === 'custom2');

  normalNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    if (!edge.target.includes('-add')) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  const layoutedNormalNodes = normalNodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y / 1.1,
      },
    };
  });

  const layoutedAddNodes = addNodes.map((addNode) => {
    const parentId = addNode.id.split('-add')[0];
    const parentNode = layoutedNormalNodes.find(node => node.id === parentId);
    if (!parentNode) return addNode;

    return {
      ...addNode,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: parentNode.position.x + (nodeWidth - 36) / 2,
        y: parentNode.position.y + nodeHeight + 35,
      },
    };
  });

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

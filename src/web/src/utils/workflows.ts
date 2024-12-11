import { WorkflowNode, WorkflowEdge, nodeWidth, nodeHeight, Workflow, Event } from '@/interfaces/Workflows';
import dagre from '@dagrejs/dagre';
import { ConnectionLineType } from '@xyflow/react';

export function findNode(nodes: Event[] | undefined, nodeId: string): Event | undefined {
  if (!nodes || nodes.length === 0) return undefined;

  const directMatch = nodes.find((node) => node.id_node === nodeId);
  if (directMatch)
    return directMatch;
  return undefined;
}

export const validateWorkflow = (workflow: Workflow): boolean => {
  const validateFields = (nodes: Event[]): boolean => {
    for (const node of nodes) {
      for (const group of node.fieldGroups) {
        for (const field of group.fields) {
          if (field.required && !field.value) {
            return false;
          }
        }
      }
    }
    return true;
  };

  return validateFields(workflow.nodes);
};

export const edgeStyles = {
  stroke: '#956FD6',
  strokeWidth: 1,
  strokeDasharray: '3,5',
  animation: 'flowAnimation 1s linear infinite',
};

export const getLayoutedElements = (nodes: WorkflowNode[], edges: WorkflowEdge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 100,
    ranksep: 100,
    edgesep: 50,
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
        y: nodeWithPosition.y - nodeHeight / 2,
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
        x: parentNode.position.x + (nodeWidth - 70) / 2,
        y: parentNode.position.y + nodeHeight + 50,
      },
    };
  });

  return {
    nodes: [...layoutedNormalNodes, ...layoutedAddNodes],
    edges: edges.map(edge => ({
      ...edge,
      type: ConnectionLineType.SmoothStep,
      animated: true,
      style: edgeStyles,
    }))
  };
};

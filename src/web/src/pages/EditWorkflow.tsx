import { getServices } from '@/api/Services';
import { getWorkflow } from '@/api/Workflows';
import { useToast } from '@/hooks/use-toast';
import { WorkflowEdge, WorkflowNode } from '@/interfaces/Workflows';
import { edgeStyles, findNode, getLayoutedElements } from '@/utils/workflows';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  ConnectionLineType,
  Controls,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Node as AreaNode, FieldGroup, Service, Workflow } from '../../../shared/Workflow';
import AddNode from '../components/flow/AddNode';
import Node from '../components/flow/Node';
import { EditWorkflowCommand } from './editor/EditWorkflowCommand';
import { WorkflowHeader } from './editor/EditWorkflowHeader';
import { EditWorkflowSidebar } from './editor/EditWorkflowSidebar';
import { useAuth } from '@/auth/AuthContext';

const nodeTypes = {
  node: Node,
  custom2: AddNode,
};

const flowStyles = `
  @keyframes flowAnimation {
    from {
      stroke-dashoffset: 24;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
`;

export default function EditWorkflow() {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<AreaNode | null>(null);
  const [updatedWorkflow, setUpdatedWorkflow] = useState<Workflow | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const { token } = useAuth();

  const flattenNodesAndCreateEdges = (
    nodes: AreaNode[],
    services: Service[],
    parentX = 100,
    parentY = 100,
    level = 0,
    parentId?: string
  ): { nodes: WorkflowNode[], edges: WorkflowEdge[] } => {
    let allEdges: WorkflowEdge[] = [];

    const flattenedNodes = nodes.flatMap((node, index) => {
      const hasInvalidFields = node.fieldGroups.some(group =>
        group.fields.some(field => field.required && !field.value)
      );

      const currentNode: WorkflowNode = {
        id: node.id,
        type: 'node',
        position: {
          x: parentX + (index * 300),
          y: parentY + (level * 250)
        },
        data: {
          label: node.name,
          service: services.find(s => s.id === node.service.id),
          fieldGroups: node.fieldGroups,
          description: node.description,
          isTrigger: node.type === 'reaction',
          selected: false,
          isValid: !hasInvalidFields,
        },
      };

      if (parentId) {
        allEdges.push({
          id: `${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
        });
      }

      if (node.nodes && node.nodes.length > 0) {
        const { nodes: childNodes, edges: childEdges } = flattenNodesAndCreateEdges(
          node.nodes,
          services,
          parentX + (index * 300),
          parentY + 250,
          level + 1,
          node.id
        );
        allEdges = [...allEdges, ...childEdges];
        return [currentNode, ...childNodes];
      } else {
        const addNode: WorkflowNode = {
          id: `${node.id}-add`,
          type: 'custom2',
          position: {
            x: parentX,
            y: parentY + ((level + 1) * 250)
          },
          data: {
            parentId: node.id,
            onAdd: handleAddNode,
          },
        };
        allEdges.push({
          id: `${node.id}-${addNode.id}`,
          source: node.id,
          target: addNode.id,
        });

        return [currentNode, addNode];
      }
    });

    return { nodes: flattenedNodes, edges: allEdges };
  };

  const onNodeClick = useCallback((_: React.MouseEvent, node: WorkflowNode) => {
    if (node.type === 'node') {
      const findNode = (nodes: AreaNode[]): AreaNode | null => {
        for (const n of nodes) {
          if (n.id === node.id) return n;
          if (n.nodes) {
            const found = findNode(n.nodes);
            if (found) return found;
          }
        }
        return null;
      };

      const areaNode = workflow?.nodes ? findNode(workflow.nodes) : null;
      setSelectedNode(areaNode);

      setNodes(nodes => nodes.map(n => ({
        ...n,
        data: {
          ...n.data,
          selected: n.id === node.id
        }
      })));
    }
  }, [workflow]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedServices = await getServices();
        setServices(fetchedServices);

        if (!id || !token) return;
        const workflow = await getWorkflow(id, token);
        if (!workflow) {
          navigate('/workflows');
          return;
        }
        setWorkflow(workflow);
        setUpdatedWorkflow(workflow);

        const { nodes: flowNodes, edges: flowEdges } = flattenNodesAndCreateEdges(workflow.nodes, fetchedServices);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flowNodes, flowEdges, 'TB');
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (error) {
        console.error('Failed to fetch data', error);
        navigate('/workflows');
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleFieldChange = (fieldId: string, value: any) => {
    if (!updatedWorkflow) return;

    const updateNodeFields = (nodes: AreaNode[]): AreaNode[] => {
      return nodes.map(node => ({
        ...node,
        fieldGroups: node.fieldGroups.map(group => ({
          ...group,
          fields: group.fields.map(field =>
            field.id === fieldId ? { ...field, value } : field
          )
        })),
        nodes: node.nodes ? updateNodeFields(node.nodes) : []
      }));
    };

    const updatedNodes = updateNodeFields(updatedWorkflow.nodes);
    setUpdatedWorkflow(prev => ({
      ...prev!,
      nodes: updatedNodes
    }));

    setNodes(nodes => nodes.map(node => {
      const workflowNode = findNodeInWorkflow(updatedNodes, node.id);
      if (!workflowNode) return node;

      const hasInvalidFields = workflowNode.fieldGroups.some(group =>
        group.fields.some(field => field.required && !field.value)
      );

      return {
        ...node,
        data: {
          ...node.data,
          isValid: !hasInvalidFields
        }
      };
    }));
  };

  const findNodeInWorkflow = (nodes: AreaNode[], nodeId: string): AreaNode | null => {
    for (const node of nodes) {
      if (node.id === nodeId) return node;
      if (node.nodes) {
        const found = findNodeInWorkflow(node.nodes, nodeId);
        if (found) return found;
      }
    }
    return null;
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
    setNodes(nodes => nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        selected: false
      }
    })));
  };

  const handleAddNode = (parentId: string) => {
    setSelectedParentId(parentId);
    setIsCommandOpen(true);

    console.info('Parent ID:', selectedParentId);
  };

  const handleSelectService = (service: Service, node: any) => {
    // TODO: Implement the logic to add a new node
    console.info('Selected service:', service);
    console.info('Selected node:', node);
    setIsCommandOpen(false);
  };

  const handleResetNode = (nodeId: string) => {
    if (!workflow || !updatedWorkflow) return;
    const defaultNode = findNode(workflow.nodes, nodeId);
    if (!defaultNode) return;
    const resetNodeInTree = (nodes: AreaNode[]): AreaNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return defaultNode;
        }
        if (node.nodes) {
          return {
            ...node,
            nodes: resetNodeInTree(node.nodes)
          };
        }
        return node;
      });
    };

    setUpdatedWorkflow(prev => ({
      ...prev!,
      nodes: resetNodeInTree(prev!.nodes)
    }));

    setNodes(nodes => nodes.map(node => {
      if (node.id === nodeId) {
        const hasInvalidFields = defaultNode.fieldGroups.some(group =>
          group.fields.some(field => field.required && !field.value)
        );

        return {
          ...node,
          data: {
            ...node.data,
            fieldGroups: defaultNode.fieldGroups,
            isValid: !hasInvalidFields
          }
        };
      }
      return node;
    }));

    toast({
      title: t('workflows.nodeResetTitle'),
      description: t('workflows.nodeResetDescription')
    });
  };

  const hasChangesOnNode = (nodeId: string): boolean => {
    if (!workflow || !updatedWorkflow) return false;
    const originalNode = findNode(workflow.nodes, nodeId);
    const currentNode = findNode(updatedWorkflow.nodes, nodeId);
    if (!originalNode || !currentNode) return false;

    const compareFieldGroups = (original: FieldGroup[], current: FieldGroup[]): boolean => {
      if (original.length !== current.length) return true;

      return original.some((originalGroup, index) => {
        const currentGroup = current[index];
        return originalGroup.fields.some((originalField, fieldIndex) => {
          const currentField = currentGroup.fields[fieldIndex];
          return originalField.value !== currentField.value;
        });
      });
    };

    const compareNodes = (original: AreaNode, current: AreaNode): boolean => {
      if (compareFieldGroups(original.fieldGroups, current.fieldGroups))
        return true;

      if (original.nodes?.length !== current.nodes?.length)
        return true;

      if (original.nodes && current.nodes)
        return original.nodes.some((originalChild, index) =>
          compareNodes(originalChild, current.nodes![index])
        );

      return false;
    };

    return compareNodes(originalNode, currentNode);
  };

  const handleRemoveNode = (nodeId: string) => {
    if (!updatedWorkflow) return;

    const removeNodeFromTree = (nodes: AreaNode[]): AreaNode[] => {
      return nodes.filter(node => {
        if (node.id === nodeId) return false;
        if (node.nodes) {
          node.nodes = removeNodeFromTree(node.nodes);
        }
        return true;
      });
    };

    setUpdatedWorkflow(prev => ({
      ...prev!,
      nodes: removeNodeFromTree(prev!.nodes)
    }));

    setNodes(nodes => nodes.filter(n => !n.id.startsWith(nodeId)));
    setEdges(edges => edges.filter(e => !e.source.startsWith(nodeId) && !e.target.startsWith(nodeId)));

    handleClosePanel();
  };

  if (!workflow) return null;

  return (
    <div className='h-screen w-full'>
      <WorkflowHeader
        workflow={workflow}
        updatedWorkflow={updatedWorkflow}
        setWorkflow={setWorkflow}
      />
      <div className='w-full flex h-[calc(100vh-64px)]'>
        <div className={clsx(
          'transition-all duration-300 h-full',
          selectedNode ? 'w-[calc(100%-400px)]' : 'w-full'
        )}>
          <style>{flowStyles}</style>
          <div className='bg-muted/50 h-full flex items-center justify-center w-full'>
            <div className='w-full h-full'>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds))}
                onEdgesChange={(changes) => setEdges((eds) => applyEdgeChanges(changes, eds))}
                onConnect={(params) => setEdges((eds) => addEdge({
                  ...params,
                  type: ConnectionLineType.SmoothStep,
                  animated: true,
                  style: edgeStyles,
                }, eds))}
                nodesConnectable={false}
                nodesDraggable={false}
                panOnDrag
                connectionLineType={ConnectionLineType.SmoothStep}
                defaultEdgeOptions={{
                  type: 'step',
                  style: edgeStyles,
                }}
                fitView
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                onNodeClick={onNodeClick}
              >
                <Background />
                <Controls showInteractive={false} className='Controls' showZoom={false} />
              </ReactFlow>
            </div>
          </div>
        </div>

        {selectedNode && (
          <EditWorkflowSidebar
            selectedNode={selectedNode}
            services={services}
            onClose={handleClosePanel}
            onFieldChange={handleFieldChange}
            onRemoveNode={handleRemoveNode}
            onResetNode={handleResetNode}
            hasChangesOnNode={hasChangesOnNode}
          />
        )}
      </div>

      <EditWorkflowCommand
        isOpen={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        services={services}
        onSelectService={handleSelectService}
      />
    </div>
  );
}

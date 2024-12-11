import { useToast } from '@/hooks/use-toast';
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
import { Event, FieldGroup, Workflow, WorkflowEdge, WorkflowNode } from '@/interfaces/Workflows';
import AddNode from '../components/flow/AddNode';
import Node from '../components/flow/Node';
import { EditWorkflowCommand } from './editor/EditWorkflowCommand';
import { WorkflowHeader } from './editor/EditWorkflowHeader';
import { EditWorkflowSidebar } from './editor/EditWorkflowSidebar';
import { useAuth } from '@/auth/AuthContext';
import { Service } from '@/interfaces/Services';
import { getServices } from '@/api/Services';
import { getWorkflow } from '@/api/Workflows';

const nodeTypes = {
  node: Node,
  custom2: AddNode,
};

const flowStyles = `
  @keyframes flowAnimation {
    from { stroke-dashoffset: 24; }
    to { stroke-dashoffset: 0; }
  }
`;

export default function EditWorkflow() {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<Event | null>(null);
  const [updatedWorkflow, setUpdatedWorkflow] = useState<Workflow | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const { token } = useAuth();

  const flattenNodesAndCreateEdges = useCallback((nodes: Event[], services: Service[]) => {
    let allEdges: WorkflowEdge[] = [];
    const nodeMap = new Map<string, WorkflowNode>();

    const flattenedNodes = nodes.map((node, index) => {
      const hasInvalidFields = node.fieldGroups.some(group =>
        group.fields.some(field => field.required && !field.value)
      );

      const currentNode: WorkflowNode = {
        id: node.id_node,
        type: 'node',
        position: { x: 100 + (index * 300), y: 100 },
        data: {
          label: node.name,
          service: services.find(s => s.id === node.serviceName),
          fieldGroups: node.fieldGroups,
          description: node.description,
          isTrigger: node.type === 'action',
          selected: false,
          isValid: !hasInvalidFields,
        },
      };

      nodeMap.set(node.id_node, currentNode);

      if (node.dependsOn) {
        allEdges.push({ id: `${node.dependsOn}-${node.id_node}`, source: node.dependsOn, target: node.id_node });
      }

      return currentNode;
    });

    nodes.forEach(node => {
      if (!nodes.some(n => n.dependsOn === node.id_node)) {
        const addNode: WorkflowNode = {
          id: `${node.id_node}-add`,
          type: 'custom2',
          position: { x: nodeMap.get(node.id_node)!.position.x, y: nodeMap.get(node.id_node)!.position.y + 250 },
          data: { parentId: node.id_node, onAdd: handleAddNode },
        };
        allEdges.push({ id: `${node.id_node}-${addNode.id}`, source: node.id_node, target: addNode.id });
        flattenedNodes.push(addNode);
      }
    });

    return { nodes: flattenedNodes, edges: allEdges };
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: WorkflowNode) => {
    if (node.type === 'node') {
      const areaNode = updatedWorkflow?.nodes.find(n => n.id_node === node.id) || null;
      setSelectedNode(areaNode);

      setNodes(nodes => nodes.map(n => ({
        ...n,
        data: { ...n.data, selected: n.id === node.id }
      })));
    }
  }, [updatedWorkflow]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const fetchedServices = await getServices(token);
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
  }, [id, navigate, token, flattenNodesAndCreateEdges]);

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    if (!updatedWorkflow) return;

    const updateNodeFields = (nodes: Event[]): Event[] => nodes.map(node => ({
      ...node,
      fieldGroups: node.fieldGroups.map(group => ({
        ...group,
        fields: group.fields.map(field => field.id === fieldId ? { ...field, value } : field)
      })),
    }));

    const updatedNodes = updateNodeFields(updatedWorkflow.nodes);
    setUpdatedWorkflow(prev => ({ ...prev!, nodes: updatedNodes }));

    setNodes(nodes => nodes.map(node => {
      const workflowNode = updatedNodes.find(n => n.id_node === node.id);
      if (!workflowNode) return node;

      const hasInvalidFields = workflowNode.fieldGroups.some(group =>
        group.fields.some(field => field.required && !field.value)
      );

      return { ...node, data: { ...node.data, isValid: !hasInvalidFields } };
    }));

    if (selectedNode) {
      const updatedSelectedNode = updatedNodes.find(n => n.id_node === selectedNode.id_node);
      if (updatedSelectedNode) {
        setSelectedNode(updatedSelectedNode);
      }
    }
  }, [updatedWorkflow, selectedNode]);

  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
    setNodes(nodes => nodes.map(n => ({ ...n, data: { ...n.data, selected: false } })));
  }, []);

  const handleAddNode = useCallback((parentId: string) => {
    setSelectedParentId(parentId);
    setIsCommandOpen(true);
  }, []);

  const handleSelectService = useCallback((service: Service, action: Event) => {
    if (!updatedWorkflow) return;
    const parentNode = nodes.find(n => n.id === selectedParentId);

    if (!parentNode) {
      console.error('Parent node not found');
      return;
    }

    action.dependsOn = parentNode.id;

    const newNode: WorkflowNode = {
      id: action.id_node,
      type: 'node',
      position: { x: parentNode.position.x, y: parentNode.position.y + 150 },
      data: {
        label: service.name,
        service: service,
        fieldGroups: action.fieldGroups,
        description: action.description,
        isTrigger: false,
        selected: false,
        isValid: true,
      },
    };

    const newEdge: WorkflowEdge = { id: `${parentNode.id}-${newNode.id}`, source: parentNode.id, target: newNode.id };

    const addNode: WorkflowNode = {
      id: `${newNode.id}-add`,
      type: 'custom2',
      position: { x: newNode.position.x + 130, y: newNode.position.y + 125 },
      data: { parentId: newNode.id, onAdd: handleAddNode },
    };

    const addEdge: WorkflowEdge = { id: `${newNode.id}-${addNode.id}`, source: newNode.id, target: addNode.id };

    const updatedNodes = nodes.filter(n => n.id !== `${parentNode.id}-add`);
    const updatedEdges = edges.filter(e => e.target !== `${parentNode.id}-add`);

    setNodes([...updatedNodes, newNode, addNode]);
    setEdges([...updatedEdges, newEdge, addEdge]);

    updatedWorkflow.nodes = [...updatedWorkflow.nodes, action];
    setIsCommandOpen(false);
  }, [nodes, edges, updatedWorkflow, selectedParentId, handleAddNode]);

  const handleResetNode = useCallback((nodeId: string) => {
    if (!workflow || !updatedWorkflow) return;
    const defaultNode = findNode(workflow.nodes, nodeId);
    if (!defaultNode) return;

    const resetNodeInTree = (nodes: Event[]): Event[] => nodes.map(node => node.id_node === nodeId ? defaultNode : node);

    setUpdatedWorkflow(prev => ({ ...prev!, nodes: resetNodeInTree(prev!.nodes) }));

    setNodes(nodes => nodes.map(node => {
      if (node.id === nodeId) {
        const hasInvalidFields = defaultNode.fieldGroups.some(group =>
          group.fields.some(field => field.required && !field.value)
        );

        return { ...node, data: { ...node.data, fieldGroups: defaultNode.fieldGroups, isValid: !hasInvalidFields } };
      }
      return node;
    }));

    toast({ title: t('workflows.nodeResetTitle'), description: t('workflows.nodeResetDescription') });
  }, [workflow, updatedWorkflow, toast, t]);

  const hasChangesOnNode = useCallback((nodeId: string): boolean => {
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

    return compareFieldGroups(originalNode.fieldGroups, currentNode.fieldGroups);
  }, [workflow, updatedWorkflow]);

  const handleRemoveNode = useCallback((nodeId: string) => {
    if (!updatedWorkflow) return;

    const removeNodeFromTree = (nodes: Event[]): Event[] => nodes.filter(node => node.id_node !== nodeId);

    setUpdatedWorkflow(prev => ({ ...prev!, nodes: removeNodeFromTree(prev!.nodes) }));

    setNodes(nodes => {
      const updatedNodes = nodes.filter(n => !n.id.startsWith(nodeId));

      updatedNodes.forEach(node => {
        if (!updatedNodes.some(n => n.data.parentId === node.id)) {
          const addNode: WorkflowNode = {
            id: `${node.id}-add`,
            type: 'custom2',
            position: { x: node.position.x + 130, y: node.position.y + 150 },
            data: { parentId: node.id, onAdd: handleAddNode },
          };
          updatedNodes.push(addNode);
          setEdges(edges => [...edges, { id: `${node.id}-${addNode.id}`, source: node.id, target: addNode.id }]);
        }
      });

      return updatedNodes;
    });

    setEdges(edges => edges.filter(e => !e.source.startsWith(nodeId) && !e.target.startsWith(nodeId)));

    handleClosePanel();
  }, [updatedWorkflow, handleAddNode, handleClosePanel]);

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
                defaultEdgeOptions={{ type: 'step', style: edgeStyles }}
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

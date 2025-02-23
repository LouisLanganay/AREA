import { getServices } from '@/api/Services';
import { getWorkflow, getWorkflowHistory, updateWorkflow } from '@/api/Workflows';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Service } from '@/interfaces/Services';
import { Event, FieldGroup, flowStyles, Workflow, WorkflowEdge, WorkflowNode, WorkflowHistory } from '@/interfaces/Workflows';
import { findNode, getLayoutedElements, validateWorkflow } from '@/utils/workflows';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  ConnectionLineType,
  Controls,
  ReactFlow,
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import AddNode from '../components/flow/AddNode';
import NodeComponent from '../components/flow/Node';
import { EditWorkflowCommand } from './editor/EditWorkflowCommand';
import { WorkflowHeader } from './editor/EditWorkflowHeader';
import { EditWorkflowSidebar } from './editor/EditWorkflowSidebar';
import { AIWorkflowAssistant } from '@/components/AIWorkflowAssistant';
import Cookies from 'js-cookie';
import { WorkflowHistorySidebar } from './editor/WorkflowHistorySidebar';

const nodeTypes = {
  node: NodeComponent,
  custom2: AddNode,
};

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
  const hasChanges = !isEqual(workflow, updatedWorkflow);
  const isValid = updatedWorkflow ? validateWorkflow(updatedWorkflow) : false;
  const openaiToken = Cookies.get('openaiToken') ?? null;
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowHistory[]>([]);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);

  const flattenNodesAndCreateEdges = useCallback((triggers: Event[], services: Service[]) => {
    let allEdges: WorkflowEdge[] = [];
    let allNodes: WorkflowNode[] = [];

    const processNode = (node: Event, parentNode: WorkflowNode | null = null) => {
      const hasInvalidFields = node.fieldGroups.some(group =>
        group.fields.some(field => field.required && !field.value)
      );

      // Create the current node
      const currentNode: WorkflowNode = {
        id: node.id,
        type: 'node',
        position: { x: 0, y: 0 },
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
      allNodes.push(currentNode);

      // Create edge from parent if exists
      if (parentNode) {
        allEdges.push({
          id: `${parentNode.id}-${currentNode.id}`,
          source: parentNode.id,
          target: currentNode.id
        });
      }

      // Process children
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          processNode(child, currentNode);
        });
      }

      // Add "Add Node" button after the current node
      const addNode: WorkflowNode = {
        id: `${currentNode.id}-add`,
        type: 'custom2',
        position: { x: 0, y: 0 },
        data: { parentId: currentNode.id, onAdd: handleAddNode },
      };
      allNodes.push(addNode);
      allEdges.push({
        id: `${currentNode.id}-${addNode.id}`,
        source: currentNode.id,
        target: addNode.id
      });
    };

    // Process each trigger
    triggers.forEach(trigger => {
      processNode(trigger);
    });

    return { nodes: allNodes, edges: allEdges };
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: WorkflowNode) => {
    if (node.type === 'node') {
      const areaNode = findNode(updatedWorkflow?.triggers, node.id) || null;
      setSelectedNode(areaNode);
      setIsHistorySidebarOpen(false);

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
        const { history } = await getWorkflowHistory(id, token);
        if (!workflow) {
          navigate('/workflows');
          return;
        }
        setWorkflow(workflow);
        setUpdatedWorkflow(workflow);
        setWorkflowHistory(history);

        const { nodes: flowNodes, edges: flowEdges } = flattenNodesAndCreateEdges(workflow.triggers, fetchedServices);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flowNodes, flowEdges, 'TB');
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (error) {
        console.error('Failed to fetch data', error);
        toast({
          description: t('workflows.fetchErrorDescription'),
          variant: 'destructive',
        });
        navigate('/workflows');
      }
    };

    fetchData();
  }, [id, navigate, token, flattenNodesAndCreateEdges]);

  const handleFieldChange = useCallback((fieldId: string, value: any, nodeId: string) => {
    if (!updatedWorkflow) return;

    const updateNodeFields = (nodes: Event[]): Event[] => nodes.map(node => {
      const updatedNode = {
        ...node,
        fieldGroups: node.fieldGroups.map(group => ({
          ...group,
          fields: group.fields.map(field =>
            field.id === fieldId && node.id === nodeId ? { ...field, value } : field
          )
        })),
        children: node.children ? updateNodeFields(node.children) : undefined
      };
      return updatedNode;
    });
    const updatedNodes = updateNodeFields(updatedWorkflow.triggers);
    const newWorkflow = { ...updatedWorkflow, triggers: updatedNodes };
    setUpdatedWorkflow(newWorkflow);

    setNodes(nodes => nodes.map(node => {
      if (node.id === nodeId) {
        const workflowNode = findNode(newWorkflow.triggers, nodeId);
        if (!workflowNode) return node;

        const hasInvalidFields = workflowNode.fieldGroups.some(group =>
          group.fields.some(field => field.required && !field.value)
        );

        return { ...node, data: { ...node.data, isValid: !hasInvalidFields } };
      }
      return node;
    }));

    if (selectedNode && selectedNode.id === nodeId) {
      const updatedSelectedNode = findNode(newWorkflow.triggers, nodeId);
      if (updatedSelectedNode) {
        setSelectedNode(updatedSelectedNode);
        setIsHistorySidebarOpen(false);
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

  const handleSave = async () => {
    if (!updatedWorkflow || !token) return;
    if (!isValid) {
      toast({
        description: t('workflows.validationErrorDescription'),
        variant: 'destructive',
      });
      return;
    }
    const myToast = toast({
      description: t('workflows.saving'),
      variant: 'loading',
    });

    try {
      await updateWorkflow(updatedWorkflow.id, updatedWorkflow, token);
      setWorkflow(updatedWorkflow);
      myToast.update({
        id: myToast.id,
        description: t('workflows.enableSuccessDescription'),
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to update workflow', error);
      myToast.update({
        id: myToast.id,
        description: t('workflows.updateErrorDescription'),
        variant: 'destructive',
      });
    }
  };

  const handleSelectService = useCallback((service: Service, action: Event) => {
    if (!updatedWorkflow) return;
    const parentNode = nodes.find(n => n.id === selectedParentId);

    if (!parentNode) {
      console.error('Parent node not found');
      return;
    }

    const idGenerated = `${action.id_node}-${crypto.randomUUID()}`;

    const updateNodeChildren = (nodes: Event[]): Event[] => {
      const addChildToNode = (node: Event): Event => {
        if (node.id === selectedParentId) {
          return {
            ...node,
            children: [...(node.children || []), { ...action, id: idGenerated }]
          };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(child => addChildToNode(child))
          };
        }
        return node;
      };

      return nodes.map(node => addChildToNode(node));
    };

    setUpdatedWorkflow(prev => ({
      ...prev!,
      triggers: updateNodeChildren(prev!.triggers)
    }));

    const hasInvalidFields = action.fieldGroups.some(group =>
      group.fields.some(field => field.required && !field.value)
    );

    const newNode: WorkflowNode = {
      id: idGenerated,
      type: 'node',
      position: { x: parentNode.position.x, y: parentNode.position.y },
      data: {
        label: service.name,
        service: service,
        fieldGroups: action.fieldGroups,
        description: action.description,
        isTrigger: false,
        selected: false,
        isValid: !hasInvalidFields,
      },
    };

    const newEdge: WorkflowEdge = { id: `${parentNode.id}-${newNode.id}`, source: parentNode.id, target: newNode.id };

    const addNode: WorkflowNode = {
      id: `${newNode.id}-add`,
      type: 'custom2',
      position: { x: newNode.position.x, y: newNode.position.y },
      data: { parentId: newNode.id, onAdd: handleAddNode },
    };

    const addEdge: WorkflowEdge = { id: `${newNode.id}-${addNode.id}`, source: newNode.id, target: addNode.id };

    const updatedNodes = nodes.filter(n => n.id !== `${parentNode.id}-add`);
    const updatedEdges = edges.filter(e => e.target !== `${parentNode.id}-add`);

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      [...updatedNodes, newNode, addNode],
      [...updatedEdges, newEdge, addEdge],
      'TB'
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    updatedWorkflow.triggers = [...updatedWorkflow.triggers, action];
    setIsCommandOpen(false);
    setSelectedNode(null);
  }, [nodes, edges, updatedWorkflow, selectedParentId, handleAddNode]);

  const handleResetNode = useCallback((nodeId: string) => {
    if (!workflow || !updatedWorkflow) return;

    const defaultNode = findNode(workflow.triggers, nodeId);
    if (!defaultNode) return;

    setSelectedNode(null);

    const resetNodeInTree = (nodes: Event[]): Event[] => nodes.map(node => node.id === nodeId ? defaultNode : node);

    setUpdatedWorkflow(prev => ({ ...prev!, triggers: resetNodeInTree(prev!.triggers) }));

    setNodes(nodes => nodes.map(node => {
      if (node.id === nodeId) {
        const hasInvalidFields = defaultNode.fieldGroups.some(group =>
          group.fields.some(field => field.required && !field.value)
        );

        return { ...node, data: { ...node.data, fieldGroups: defaultNode.fieldGroups, isValid: !hasInvalidFields } };
      }
      return node;
    }));

  }, [workflow, updatedWorkflow, toast, t]);

  const hasChangesOnNode = useCallback((nodeId: string): boolean => {
    if (!workflow || !updatedWorkflow) return false;
    const originalNode = findNode(workflow.triggers, nodeId);
    const currentNode = findNode(updatedWorkflow.triggers, nodeId);
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

    // Remove node from the tree structure
    const removeNodeFromTree = (nodes: Event[]): Event[] => {
      const removeFromNode = (node: Event): Event | null => {
        if (node.id === nodeId) {
          return null;
        }
        if (node.children) {
          const filteredChildren = node.children
            .map(child => removeFromNode(child))
            .filter((child): child is Event => child !== null);
          return { ...node, children: filteredChildren };
        }
        return node;
      };

      return nodes
        .map(node => removeFromNode(node))
        .filter((node): node is Event => node !== null);
    };

    setUpdatedWorkflow(prev => ({
      ...prev!,
      triggers: removeNodeFromTree(prev!.triggers)
    }));

    const updatedNodes = nodes.filter(n => !n.id.startsWith(nodeId));
    const updatedEdges = edges.filter(e => !e.source.startsWith(nodeId) && !e.target.startsWith(nodeId));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      updatedNodes,
      updatedEdges,
      'TB'
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    handleClosePanel();
  }, [updatedWorkflow, handleAddNode, handleClosePanel]);

  if (!workflow) return null;

  return (
    <div className='h-screen w-full'>
      <WorkflowHeader
        workflow={workflow}
        updatedWorkflow={updatedWorkflow}
        setWorkflow={setWorkflow}
        setUpdatedWorkflow={setUpdatedWorkflow}
        onOpenHistory={() => {
          setIsHistorySidebarOpen(!isHistorySidebarOpen);
          setSelectedNode(null);
        }}
      />
      <div className='w-full flex h-[calc(100vh-64px)]'>
        <div className={clsx(
          'transition-all duration-300 h-full',
          (selectedNode || isHistorySidebarOpen) ? 'w-[calc(100%-400px)]' : 'w-full'
        )}>
          <style>{flowStyles}</style>
          <div className='bg-muted/50 h-full flex items-center justify-center w-full'>
            <div className='w-full h-full relative'>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds) as WorkflowNode[])}
                onEdgesChange={(changes) => setEdges((eds) => applyEdgeChanges(changes, eds) as WorkflowEdge[])}
                nodesConnectable={false}
                nodesDraggable={false}
                panOnDrag
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                onNodeClick={(_: React.MouseEvent, node: Node<any>) => {
                  onNodeClick(_, node as WorkflowNode);
                }}
              >
                <div className='w-full h-fit top-0 left-0 z-10 absolute'>
                  {hasChanges && (
                    <motion.div
                      className={clsx(
                        'justify-between items-center rounded-lg bg-background py-1 md:py-2 px-2 m-2 border   border-border gap-2',
                        selectedNode ? 'hidden md:flex' : 'flex'
                      )}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <div className='flex items-center justify-center text-sm font-regular'>
                        <InformationCircleIcon className='size-5 mr-2 shrink-0' />
                        <span>{t('workflows.changesToSave')}</span>
                      </div>
                      <div className='flex items-center justify-center gap-2 flex-col md:flex-row'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='hidden md:flex'
                          onClick={() => {
                            setUpdatedWorkflow(workflow);
                            setNodes(nodes => nodes.map(n => ({
                              ...n,
                              data: { ...n.data, selected: false }
                            })));
                            setSelectedNode(null);
                          }}
                        >
                          {t('workflows.discardChanges')}
                        </Button>
                        <Button
                          variant='default'
                          size='sm'
                          disabled={!hasChanges || !isValid}
                          onClick={handleSave}
                        >
                          {t('workflows.save')}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
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
        {isHistorySidebarOpen && (
          <WorkflowHistorySidebar
            workflow={workflow}
            history={workflowHistory.slice(-10)}
            onClose={() => setIsHistorySidebarOpen(false)}
            onRefresh={async () => {
              if (!id || !token) return;
              const { history } = await getWorkflowHistory(id, token);
              setWorkflowHistory(history);
            }}
          />
        )}
      </div>

      <EditWorkflowCommand
        isOpen={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        services={services}
        onSelectService={handleSelectService}
      />

      <AIWorkflowAssistant
        token={openaiToken}
        mode='edit'
        workflow={updatedWorkflow ?? workflow}
        onSuccess={(newWorkflow) => {
          setUpdatedWorkflow(newWorkflow);
          const { nodes: flowNodes, edges: flowEdges } = flattenNodesAndCreateEdges(newWorkflow.triggers, services);
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flowNodes, flowEdges, 'TB');
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          setSelectedNode(null);
          setIsCommandOpen(false);
        }}
      />
    </div>
  );
}

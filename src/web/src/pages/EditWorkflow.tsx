import { useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { getWorkflows, deleteWorkflow, getWorkflow, updateWorkflow } from '@/api/Workflows';
import { FieldGroup, Node as AreaNode, Service, Workflow, Field } from '../../../shared/Workflow';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArchiveBoxArrowDownIcon, ArrowDownTrayIcon, ArrowUturnDownIcon, ArrowUturnLeftIcon, Cog6ToothIcon, LinkIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { ChatBubbleBottomCenterTextIcon, PlayCircleIcon, ServerIcon } from '@heroicons/react/24/outline';
import { Switch } from '@/components/ui/switch';
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  ConnectionLineType,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import Node from '../components/flow/Node';
import AddNode from '../components/flow/AddNode';
import { getServices } from '@/api/Services';
import { WorkflowNodeData } from '@/interfaces/Workflows';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { isEqual } from 'lodash';
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import clsx from 'clsx';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

const nodeTypes = {
  node: Node,
  custom2: AddNode,
};

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

function findNode(nodes: AreaNode[] | undefined, nodeId: string): AreaNode | undefined {
  if (!nodes || nodes.length === 0) return undefined;

  const directMatch = nodes.find(node => node.id === nodeId);
  if (directMatch) return directMatch;

  for (const node of nodes) {
    if (node?.nodes) {
      const found = findNode(node.nodes, nodeId);
      if (found) return found;
    }
  }

  return undefined;
}

const getLayoutedElements = (nodes: WorkflowNode[], edges: WorkflowEdge[], direction = 'TB') => {
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

const validateWorkflow = (workflow: Workflow): boolean => {
  const validateFields = (nodes: AreaNode[]): boolean => {
    for (const node of nodes) {
      for (const group of node.fieldGroups) {
        for (const field of group.fields) {
          if (field.required && !field.value) {
            return false;
          }
        }
      }
      if (node.nodes && !validateFields(node.nodes)) {
        return false;
      }
    }
    return true;
  };

  return validateFields(workflow.nodes);
};

export function WorkflowHeader({
  workflow,
  updatedWorkflow,
  setWorkflow
}: {
  workflow: Workflow,
  updatedWorkflow: Workflow | null,
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow | null>>
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmWorkflowName, setConfirmWorkflowName] = useState('');

  const hasChanges = !isEqual(workflow, updatedWorkflow);
  const isValid = updatedWorkflow ? validateWorkflow(updatedWorkflow) : false;

  const copyWorkflowUrl = () => {
    const url = `${window.location.origin}/workflows/${workflow?.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: t('workflows.linkCopied'),
      description: t('workflows.linkCopiedDescription'),
    });
  };

  const handleDelete = async () => {
    try {
      if (!workflow) return;
      setIsLoading(true);
      await deleteWorkflow(workflow.id);
      toast({
        title: t('workflows.deleteSuccessTitle'),
        description: t('workflows.deleteSuccessDescription'),
      });
      navigate('/workflows');
    } catch (error) {
      console.error('Failed to delete workflow', error);
      toast({
        title: t('workflows.deleteErrorTitle'),
        description: t('workflows.deleteErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable = async (value: boolean) => {
    if (!workflow) return;
    setIsLoading(true);
    setWorkflow(prevWorkflow => ({
      ...prevWorkflow!,
      enabled: value
    }));
    try {
      const updatedWorkflow = await updateWorkflow(workflow.id, { enabled: value });
      setWorkflow(updatedWorkflow);
      toast({
        title: t('workflows.updateSuccessTitle'),
        description: t('workflows.updateSuccessDescription'),
      });
    } catch (error) {
      console.error('Failed to update workflow', error);
      setWorkflow(prevWorkflow => ({
        ...prevWorkflow!,
        enabled: !value
      }));
      toast({
        title: t('workflows.updateErrorTitle'),
        description: t('workflows.updateErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!updatedWorkflow) return;
    if (!isValid) {
      toast({
        title: t('workflows.validationErrorTitle'),
        description: t('workflows.validationErrorDescription'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateWorkflow(updatedWorkflow.id, updatedWorkflow);
      setWorkflow(updatedWorkflow);
      toast({
        title: t('workflows.updateSuccessTitle'),
        description: t('workflows.updateSuccessDescription'),
      });
    } catch (error) {
      console.error('Failed to update workflow', error);
      toast({
        title: t('workflows.updateErrorTitle'),
        description: t('workflows.updateErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatWorkflowName = (name: string) => {
    return name.toUpperCase().replace(/\s+/g, '-');
  };

  if (!workflow) return null;

  return (
    <>
      <div className='flex items-center gap-2 ml-auto'>
        <Button
          variant='default'
          size='sm'
          disabled={!hasChanges || isLoading || !isValid}
          onClick={handleSave}
        >
          <ArrowDownTrayIcon className='w-4 h-4' />
          {t('workflows.save')}
        </Button>
        <Separator orientation='vertical' className='mx-2 h-4' />
        <Button
          variant='outline'
          size='sm'
          disabled={isLoading}
        >
          <PlayCircleIcon className='w-4 h-4' />
          {t('workflows.runNow')}
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handleEnable(!workflow.enabled)}
          disabled={isLoading}
        >
          <div className='flex items-center gap-2 w-[85px]'>
            <Switch
              checked={workflow.enabled}
              size='sm'
              disabled={isLoading}
            />
            {workflow.enabled ? t('workflows.enabled') : t('workflows.disabled')}
          </div>
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='p-2'
          onClick={copyWorkflowUrl}
        >
          <LinkIcon className='w-4 h-4' />
        </Button>
        <Separator orientation='vertical' className='h-4' />
        <Button
          variant='destructiveOutline'
          size='sm'
          className='p-2'
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isLoading}
        >
          <TrashIcon className='w-4 h-4' />
        </Button>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('workflows.confirmDeleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('workflows.confirmDelete', { workflowName: workflow.name })}
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <Label htmlFor='confirmName' className='flex flex-row items-center flex-wrap gap-1'>
              {t('workflows.typeNameToConfirm', { workflowName: formatWorkflowName(workflow.name) })}
            </Label>
            <Input
              id='confirmName'
              value={confirmWorkflowName}
              onChange={(e) => setConfirmWorkflowName(e.target.value)}
              placeholder={formatWorkflowName(workflow.name)}
              className='mt-2'
            />
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setConfirmWorkflowName('');
                setIsDeleteDialogOpen(false);
              }}
              disabled={isLoading}
            >
              {t('workflows.cancel')}
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={isLoading || confirmWorkflowName !== formatWorkflowName(workflow.name)}
            >
              <TrashIcon className='w-4 h-4' />
              {t('workflows.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const edgeStyles = {
  stroke: '#956FD6',
  strokeWidth: 1,
  strokeDasharray: '3,5',
  animation: 'flowAnimation 1s linear infinite',
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
  const [deleteNodeConfirmation, setDeleteNodeConfirmation] = useState<boolean>(false);

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

        if (!id) return;
        const workflow = await getWorkflow(id);
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

    // Mettre à jour l'état visuel des nodes
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

  // Fonction utilitaire pour trouver un node dans le workflow
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

  const renderField = (field: Field) => {
    const getCurrentValue = () => {
      if (!updatedWorkflow) return field.value;

      const findFieldValue = (nodes: AreaNode[]): any => {
        for (const node of nodes) {
          const foundField = node.fieldGroups
            .flatMap(group => group.fields)
            .find(f => f.id === field.id);

          if (foundField) return foundField.value;

          if (node.nodes) {
            const nestedValue = findFieldValue(node.nodes);
            if (nestedValue !== undefined) return nestedValue;
          }
        }
        return undefined;
      };

      return findFieldValue(updatedWorkflow.nodes) ?? field.value;
    };

    const currentValue = getCurrentValue();
    const isInvalid = field.required && !currentValue;

    switch (field.type) {
      case 'text':
        return (
          <Input
            variantSize='sm'
            type='text'
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className={isInvalid ? 'border-destructive !ring-0' : ''}
          />
        );
      case 'number':
        return (
          <Input
            type='number'
            variantSize='sm'
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value))}
            required={field.required}
            className={isInvalid ? 'border-destructive !ring-0' : ''}
          />
        );
      case 'boolean':
        return (
          <Checkbox
            checked={currentValue || false}
            onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
          />
        );
      case 'select':
        return (
          <Select value={currentValue} onValueChange={(value) => handleFieldChange(field.id, value)}>
            <SelectTrigger>
              <SelectValue placeholder='Select an option' />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'date':
        return (
          <Calendar
            mode='single'
            selected={currentValue ? new Date(currentValue) : undefined}
            onSelect={(date) => handleFieldChange(field.id, date)}
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            checked={currentValue || false}
            onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
          />
        );
      case 'color':
        return (
          <Input
            type='color'
            value={currentValue || '#000000'}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      default:
        return null;
    }
  };

  const getGroupIcon = (type: string) => {
    switch (type) {
      case 'server':
        return <ServerIcon className='w-4 h-4' />;
      case 'message':
        return <ChatBubbleBottomCenterTextIcon className='w-4 h-4' />;
      default:
        return <Cog6ToothIcon className='w-4 h-4' />;
    }
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
  };

  const handleSelectService = (service: Service, node: any) => {
    // TODO: Implement the logic to add a new node
    console.log('Selected service:', service);
    console.log('Selected node:', node);
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
    setDeleteNodeConfirmation(false);
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
    <div className='h-full w-full'>
      <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        <h1 className='text-lg font-semibold'>{workflow.name}</h1>
        <WorkflowHeader
          workflow={workflow}
          updatedWorkflow={updatedWorkflow}
          setWorkflow={setWorkflow}
        />
      </header>
      <div className='w-full flex'>
        <div className={clsx(
          'transition-all duration-300',
          selectedNode ? 'w-[calc(100%-400px)]' : 'w-full'
        )}>
          <style>{flowStyles}</style>
          <div className='bg-muted/50 h-full flex items-center justify-center w-full'>
            <div className='w-full h-[600px]'>
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
          <div className='w-[400px] bg-muted/50 p-4 border-l'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='p-1 rounded-md bg-muted border overflow-hidden'>
                    {services.find(s => s.id === selectedNode.service.id)?.image && (
                      <img src={services.find(s => s.id === selectedNode.service.id)?.image} alt={selectedNode.service.name} className='size-5 object-contain' />
                    )}
                  </div>
                  <div className='font-medium text-sm text-gray-900'>
                    {selectedNode.service.description}
                  </div>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  className='p-1 h-auto'
                  onClick={handleClosePanel}
                >
                  <XMarkIcon className='w-4 h-4' />
                </Button>
              </div>
              <div className='space-y-2'>
                {selectedNode.fieldGroups && (
                  <div className='space-y-4'>
                    {selectedNode.fieldGroups.map((group: FieldGroup) => (
                      <div key={group.id} className='space-y-4 bg-white border rounded-lg p-4 shadow-sm'>
                        <div className='flex items-center gap-2'>
                          <div className='p-1 min-w-6 min-h-6 rounded-full bg-muted border overflow-hidden'>
                            {getGroupIcon(group.type)}
                          </div>
                          <p className='text-sm font-semibold'>{group.name}</p>
                        </div>
                        {group.fields.map((field: Field) => (
                          <div key={field.id} className='space-y-1'>
                            <Label className='flex items-center gap-1'>
                              {field.label}
                              {field.required && (
                                <span className='text-sm text-destructive'>*</span>
                              )}
                            </Label>
                            {renderField(field)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='destructiveOutline'
                  size='sm'
                  onClick={() => handleRemoveNode(selectedNode.id)}
                >
                  <ArchiveBoxArrowDownIcon className='w-4 h-4' />
                  {t('workflows.remove')}
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleResetNode(selectedNode.id)}
                  disabled={!hasChangesOnNode(selectedNode.id)}
                >
                  <ArrowUturnLeftIcon className='w-4 h-4' />
                  {t('workflows.resetNode')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <Command className='rounded-lg border shadow-md'>
          <CommandInput placeholder={t('workflows.searchServices')} />
          <CommandList>
            <CommandEmpty>{t('workflows.noServicesFound')}</CommandEmpty>
            {services.map((service: Service) => (
              <CommandGroup heading={service.name}>
                {service.actions?.map((action) => (
                  <CommandItem
                    key={action.id}
                    onSelect={() => handleSelectService(service, action)}
                    className='flex items-center gap-2'
                  >
                    <div className='p-1 rounded-md bg-muted border overflow-hidden'>
                      {service.image && (
                        <img src={service.image} alt={service.name} className='size-4 object-contain' />
                      )}
                    </div>
                    {action.name} <span className='text-muted-foreground text-xs'>{action.description}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
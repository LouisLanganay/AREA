import { useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { getWorkflows, deleteWorkflow, getWorkflow, updateWorkflow } from '@/api/Workflows';
import { FieldGroup, Service, Workflow } from '../../../shared/Workflow';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LinkIcon, TrashIcon } from '@heroicons/react/24/solid';
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
import { PlayCircleIcon } from '@heroicons/react/24/outline';
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

const nodeTypes = {
  custom: Node,
  custom2: AddNode,
};

type WorkflowNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label?: string;
    service?: Service;
    fieldGroups?: FieldGroup[];
  };
};

type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: React.CSSProperties;
};

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: WorkflowNode[], edges: WorkflowEdge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
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

  return { nodes: layoutedNodes, edges };
};

export function WorkflowHeader() {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!id) return;
      const workflow = await getWorkflow(id);
      setWorkflow(workflow);
    };
    fetchWorkflow();
  }, [id]);

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
    setWorkflow((prevWorkflow) => ({
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
      setWorkflow((prevWorkflow) => ({
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

  if (!workflow) return null;

  return (
    <>
      <div className='flex items-center gap-2 ml-auto'>
        <Separator orientation='vertical' className='mr-2 h-4' />
        <Button
          variant='default'
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
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              {t('workflows.cancel')}
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={isLoading}
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

const flattenNodesAndCreateEdges = (
  nodes: any[],
  services: Service[],
  parentX = 100,
  parentY = 100,
  level = 0,
  parentId?: string
): { nodes: WorkflowNode[], edges: WorkflowEdge[] } => {
  let allEdges: WorkflowEdge[] = [];


  const flattenedNodes = nodes.flatMap((node, index) => {
    console.log("name ", node.name);
    console.log("services ", services);
    console.log("service found ", services.find(s => s.id === node.service.id));
    const currentNode: WorkflowNode = {
      id: node.id,
      type: 'custom',
      position: {
        x: parentX + (index * 200),
        y: parentY + (level * 150)
      },
      data: {
        label: node.name,
        service: services.find(s => s.id === node.service.id),
        fieldGroups: node.fieldGroups,
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
        parentX + (index * 200),
        parentY + 150,
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
          y: parentY + ((level + 1) * 150)
        },
        data: {},
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

const edgeStyles = {
  stroke: '#956FD6',
  strokeWidth: 1,
  strokeDasharray: '3,5',
};

export default function EditWorkflow() {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const navigate = useNavigate();

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

  if (!workflow) return null;

  return (
    <div className='container mx-auto'>
      <div className='bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25 h-[600px] flex items-center justify-center'>
        <div className='container mx-auto h-[600px]'>
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
            connectionLineType={ConnectionLineType.SmoothStep}
            defaultEdgeOptions={{
              type: 'step',
              style: edgeStyles,
            }}
            fitView
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            panOnScroll
            preventScrolling
          >
            <Background />
            <Controls showInteractive={false} className="Controls" showZoom={false} />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
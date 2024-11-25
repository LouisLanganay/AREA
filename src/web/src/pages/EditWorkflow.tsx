import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getWorkflows, deleteWorkflow, getWorkflow } from '@/api/Workflows';
import { Workflow } from '../../../shared/Workflow';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LinkIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';
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

export function WorkflowHeader() {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      await deleteWorkflow(workflow.id);
      navigate('/workflows');
    } catch (error) {
      console.error('Failed to delete workflow', error);
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
        >
          <PlayCircleIcon className='w-4 h-4' />
          {t('workflows.runNow')}
        </Button>
        <Button
          variant='outline'
          size='sm'
        >
          <div className='flex items-center gap-2'>
            <Switch
              checked={workflow.enabled}
              size='sm'
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
        >
          <TrashIcon className='w-4 h-4' />
        </Button>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('workflows.confirmDeleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('workflows.confirmDelete', { name: workflow.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t('workflows.cancel')}
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
            >
              {t('workflows.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function EditWorkflow() {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const workflows = await getWorkflows();
        const workflow = workflows.find(w => w.id === id);
        if (!workflow) {
          navigate('/workflows');
          return;
        }
        setWorkflow(workflow);
      } catch (error) {
        console.error('Failed to fetch workflow', error);
        navigate('/workflows');
      }
    };

    fetchWorkflow();
  }, [id, navigate]);

  if (!workflow) return null;

  return (
    <div className='container mx-auto'>
      <div className='bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25 h-[600px] flex items-center justify-center'>
        <p className='text-muted-foreground'>
          {workflow.name} - Workflow Builder Coming Soon
        </p>
      </div>
    </div>
  );
}
import { deleteWorkflow, updateWorkflow } from '@/api/Workflows';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { validateWorkflow } from '@/utils/workflows';
import { ArrowLeftIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import {
  ArrowDownTrayIcon,
  LinkIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
import '@xyflow/react/dist/style.css';
import { isEqual } from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Workflow } from '@/interfaces/Workflows';

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
      await deleteWorkflow(workflow.id, workflow.name);
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
    <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
      <SidebarTrigger className='-ml-1' />
      <Separator orientation='vertical' className='mr-2 h-4' />
      <Button variant='ghost' size='sm' onClick={() => navigate('/workflows')}>
        <ArrowLeftIcon className='w-4 h-4' />
        {t('workflows.back')}
      </Button>
      <h3 className='text-base font-semibold'>{workflow.name}</h3>
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
    </header>
  );
}

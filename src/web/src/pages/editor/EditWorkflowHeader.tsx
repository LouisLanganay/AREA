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
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import {
  ArrowDownTrayIcon,
  EllipsisHorizontalIcon,
  LinkIcon,
  PlayCircleIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import '@xyflow/react/dist/style.css';
import { isEqual } from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Workflow } from '@/interfaces/Workflows';
import { useAuth } from '@/auth/AuthContext';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

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
  const { token } = useAuth();

  const hasChanges = !isEqual(workflow, updatedWorkflow);
  const isValid = updatedWorkflow ? validateWorkflow(updatedWorkflow) : false;
  const copyWorkflowUrl = () => {
    const url = `${window.location.origin}/workflows/${workflow?.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: t('workflows.linkCopied'),
      description: t('workflows.linkCopiedDescription'),
      variant: 'success',
    });
  };

  const handleDelete = async () => {
    try {
      if (!workflow || !token) return;
      setIsLoading(true);
      await deleteWorkflow(workflow.id, token);
      toast({
        title: t('workflows.deleteSuccessTitle'),
        description: t('workflows.deleteSuccessDescription'),
        variant: 'success',
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
    if (!workflow || !token) return;
    setIsLoading(true);
    setWorkflow(prevWorkflow => ({
      ...prevWorkflow!,
      enabled: value
    }));
    try {
      const updatedWorkflow = await updateWorkflow(workflow.id, { enabled: value }, token);
      setWorkflow(updatedWorkflow);
      toast({
        title: t('workflows.enableSuccess'),
        description: t('workflows.enableSuccessDescription'),
        variant: 'success',
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
    if (!updatedWorkflow || !token) return;
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
      await updateWorkflow(updatedWorkflow.id, updatedWorkflow, token);
      setWorkflow(updatedWorkflow);
      toast({
        title: t('workflows.enableSuccess'),
        description: t('workflows.enableSuccessDescription'),
        variant: 'success',
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
    <header className='flex h-16 items-center gap-1 lg:gap-2 border-b px-4'>
      <SidebarTrigger className='-ml-1' />
      <Separator orientation='vertical' className='h-4' />
      <Button
        variant='ghost'
        size='sm'
        onClick={() => navigate('/workflows')}
      >
        <ArrowLeftIcon className='w-4 h-4' />
        <span className='hidden lg:block'>{t('workflows.back')}</span>
      </Button>
      <div className='flex-1 flex items-center overflow-hidden'>
        <span className='text-sm font-bold md:font-semibold text-nowrap hidden lg:block'>
          {workflow.name}
        </span>
        <span className='text-xs font-bold md:font-semibold text-nowrap block lg:hidden'>
          {workflow.name.length > 10 ? workflow.name.slice(0, 5) + '..' : workflow.name}
        </span>
      </div>
      <div className='flex shrink-0 items-center gap-1 lg:gap-2 ml-auto'>
        <Button
          variant='default'
          size='sm'
          disabled={!hasChanges || isLoading || !isValid}
          onClick={handleSave}
        >
          <ArrowDownTrayIcon className='w-4 h-4 hidden lg:block' />
          {t('workflows.save')}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='iconSm' className='flex lg:hidden'>
              <EllipsisHorizontalIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56 block lg:hidden mr-2'>
            <DropdownMenuLabel>{t('workflows.quickActions')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isLoading}
            >
              <PlayCircleIcon className='w-4 h-4' />
              {t('workflows.runNow')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleEnable(!workflow.enabled)}
              disabled={isLoading}
            >
              {workflow.enabled ? <CheckIcon className='size-4' /> : <XMarkIcon className='size-4' />}
              {workflow.enabled ? t('workflows.enabled') : t('workflows.disabled')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={copyWorkflowUrl}
            >
              <LinkIcon className='size-4' />
              {t('workflows.copyLink')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setIsDeleteDialogOpen(true)}
              disabled={isLoading}
            >
              <TrashIcon className='size-4' />
              {t('workflows.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className='hidden lg:flex items-center gap-2'>
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

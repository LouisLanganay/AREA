import { deleteWorkflow, runWorkflow, updateWorkflow } from '@/api/Workflows';
import { useAuth } from '@/context/AuthContext';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Workflow } from '@/interfaces/Workflows';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import {
  EllipsisHorizontalIcon,
  FolderIcon,
  PlayCircleIcon,
  StarIcon as StarIconSolid,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import {
  StarIcon as StarIconOutline
} from '@heroicons/react/24/outline';
import '@xyflow/react/dist/style.css';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getWorkflowName, getWorkflowPath } from '@/utils/workflowPath';

export function WorkflowHeader({
  workflow,
  setWorkflow,
  setUpdatedWorkflow
}: {
  workflow: Workflow,
  updatedWorkflow: Workflow | null,
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow | null>>,
  setUpdatedWorkflow: React.Dispatch<React.SetStateAction<Workflow | null>>
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmWorkflowName, setConfirmWorkflowName] = useState('');
  const { token } = useAuth();
  const [workflowName, setWorkflowName] = useState(getWorkflowName(workflow.name));
  const workflowPath = getWorkflowPath(workflow.name);

  const handleFavorite = async (value: boolean) => {
    if (!workflow || !token) return;
    setIsLoading(true);
    setWorkflow(prevWorkflow => ({
      ...prevWorkflow!,
      favorite: value
    }));
    const myToast = toast({
      description: t('workflows.updateLoadingDescription'),
      variant: 'loading',
    });
    try {
      const updatedWorkflow = await updateWorkflow(workflow.id, { favorite: value }, token);
      setWorkflow(updatedWorkflow);
      setUpdatedWorkflow(updatedWorkflow);
      myToast.update({
        id: myToast.id,
        description: value
          ? t('workflows.addedToFavorites')
          : t('workflows.removedFromFavorites'),
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to update workflow', error);
      setWorkflow(prevWorkflow => ({
        ...prevWorkflow!,
        favorite: !value
      }));
      myToast.update({
        id: myToast.id,
        description: t('workflows.updateErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!workflow || !token) return;
      setIsLoading(true);
      await deleteWorkflow(workflow.id, token);
      toast({
        description: t('workflows.deleteSuccessDescription'),
        variant: 'success',
      });
      navigate('/workflows');
    } catch (error) {
      console.error('Failed to delete workflow', error);
      toast({
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
      setUpdatedWorkflow(updatedWorkflow);
      toast({
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
        description: t('workflows.updateErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatWorkflowName = (name: string) => {
    const workflowName = getWorkflowName(name);
    return workflowName.toUpperCase().replace(/\s+/g, '-');
  };

  const handleRunWorkflow = async () => {
    if (!workflow || !token) return;
    const myToast = toast({
      description: t('workflows.runWorkflowDescription'),
      variant: 'loading',
    });
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      await runWorkflow(workflow.id, token);
      myToast.update({
        id: myToast.id,
        description: t('workflows.runWorkflowDescriptionSuccess'),
        variant: 'success',
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to run workflow', error);
      myToast.update({
        id: myToast.id,
        description: t('workflows.runWorkflowDescriptionError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!workflow || !token || workflowName === getWorkflowName(workflow.name)) return;
    setIsLoading(true);
    try {
      const newName = workflowPath
        ? `${workflowPath}/${workflowName}`
        : workflowName;

      const updatedWorkflow = await updateWorkflow(workflow.id, { name: newName }, token);
      setWorkflow(updatedWorkflow);
      setUpdatedWorkflow(updatedWorkflow);
      toast({
        description: t('workflows.updateSuccessDescription'),
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to update workflow name', error);
      setWorkflowName(getWorkflowName(workflow.name));
      toast({
        description: t('workflows.updateErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!workflow) return null;

  return (
    <header className='flex h-14 items-center gap-1 lg:gap-2 border-b px-4 z-20'>
      <SidebarTrigger className='-ml-1' />
      <Separator orientation='vertical' className='h-6' />
      <Breadcrumb className='hidden sm:block'>
        <BreadcrumbList className='flex-nowrap'>
          <BreadcrumbItem>
            <BreadcrumbLink href='/workflows' className='flex items-center gap-1'>
              <FolderIcon className='w-4 h-4' />
              Workflows
            </BreadcrumbLink>
          </BreadcrumbItem>
          {workflowPath && workflowPath.split('/').map((folder, index, array) => (
            <React.Fragment key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/workflows?folder=${array.slice(0, index + 1).join('/')}`}>
                  {folder}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          ))}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Label htmlFor="workflowNameInput" className="sr-only">
                {t('workflows.name')}
              </Label>
              <input
                id="workflowNameInput"
                value={workflowName}
                onChange={(e) => {
                  setWorkflowName(e.target.value);
                }}
                onBlur={handleNameUpdate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className='font-medium h-auto px-1 rounded-sm bg-transparent focus-visible:ring-0 transition-all duration-100 outline-none'
                aria-label={t('workflows.name')}
              />
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className='flex sm:hidden flex-1 w-10'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => navigate('/workflows')}
          className='shrink-0'
          aria-label={t('workflows.back')}
        >
          <ArrowLeftIcon className='w-4 h-4' />
          <span className='hidden lg:block'>{t('workflows.back')}</span>
        </Button>
        <div className='flex items-center overflow-hidden min-w-0'>
          <span className='text-sm font-medium truncate min-w-0'>
            {workflowName}
          </span>
        </div>
      </div>
      <div className='flex shrink-0 items-center gap-1 lg:gap-2 ml-auto'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='iconSm' className='flex lg:hidden' aria-label={t('workflows.openMenu')}>
              <EllipsisHorizontalIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56 block lg:hidden mr-2'>
            <DropdownMenuLabel>{t('workflows.quickActions')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isLoading}
              onClick={() => handleFavorite(!workflow.favorite)}
            >
              {workflow.favorite ? <StarIconSolid className='size-4 fill-yellow-400' /> : <StarIconOutline className='size-4 text-yellow-400' />}
              {workflow.favorite ? t('workflows.removeFromFavorites') : t('workflows.addToFavorites')}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isLoading}
              onClick={() => handleRunWorkflow()}
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
              onSelect={() => setIsDeleteDialogOpen(true)}
              disabled={isLoading}
            >
              <TrashIcon className='size-4' />
              {t('workflows.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className='hidden lg:flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='p-2'
            onClick={() => handleFavorite(!workflow.favorite)}
            aria-label={workflow.favorite ? t('workflows.removeFromFavorites') : t('workflows.addToFavorites')}
          >
            {workflow.favorite ?
              <StarIconSolid className='w-4 h-4 fill-yellow-400' /> :
              <StarIconOutline className='w-4 h-4 text-yellow-400' />
            }
          </Button>
          <Button
            variant='outline'
            size='sm'
            disabled={isLoading}
            onClick={() => handleRunWorkflow()}
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
                aria-label={workflow.enabled ? t('workflows.enabled') : t('workflows.disabled')}
              />
              {workflow.enabled ? t('workflows.enabled') : t('workflows.disabled')}
            </div>
          </Button>
          <Separator orientation='vertical' className='h-6' />
          <Button
            variant='destructiveOutline'
            size='sm'
            className='p-2'
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isLoading}
            aria-label={t('workflows.delete')}
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

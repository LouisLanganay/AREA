import { getServices } from '@/api/Services';
import { createWorkflow, deleteWorkflow, getWorkflows, updateWorkflow } from '@/api/Workflows';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ToastAction } from '@/components/ui/toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Service } from '@/interfaces/Services';
import { Event, Workflow } from '@/interfaces/Workflows';
import { getAllFolders, getWorkflowName, groupWorkflowsByFolder } from '@/utils/workflowPath';
import { ArrowRightCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon, EllipsisHorizontalIcon, FolderIcon, FolderPlusIcon, PauseIcon, PencilSquareIcon, PlayIcon, PlusIcon, StarIcon, TrashIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface FolderProps {
  path: string;
  workflows: Workflow[];
  onWorkflowClick: (workflow: Workflow) => void;
  expandedFolders: Set<string>;
  setExpandedFolders: (folders: Set<string>) => void;
};

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');
  const [step, setStep] = useState(0);
  const [selectedTrigger, setSelectedTrigger] = useState<Event | null>(null);
  const { toast } = useToast();
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [searchParams] = useSearchParams();
  const [workflowGroups, setWorkflowGroups] = useState<{ [key: string]: Workflow[] }>({});
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [availableFolders, setAvailableFolders] = useState<string[]>([]);

  useEffect(() => {
    const fetchWorkflows = async () => {
      if (!token) return;
      try {
        const data = await getWorkflows(token);
        setWorkflows(data);
      } catch (error) {
        console.error('Failed to fetch workflows', error);
      }
    };

    const fetchServices = async () => {
      if (!token) return;
      try {
        const data = await getServices(token);
        setServices(data);
      } catch (error) {
        console.error('Failed to fetch services', error);
      }
    };

    fetchWorkflows();
    fetchServices();
  }, []);

  useEffect(() => {
    const groups = groupWorkflowsByFolder(filteredWorkflows);
    setWorkflowGroups(groups);
  }, [workflows, filter]);

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(filter.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    const allPaths = Object.keys(workflowGroups);
    setExpandedFolders(new Set(allPaths));
  }, [workflowGroups]);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsCreateDialogOpen(true);
      setStep(0);
      setNewWorkflowName('');
      setNewWorkflowDescription('');
    }
  }, [searchParams]);

  useEffect(() => {
    setAvailableFolders(getAllFolders(workflows));
  }, [workflows]);

  const handleSelectTrigger = (action: Event) => {
    setSelectedTrigger(action);
  };

  function WorkflowItem({ workflow, onClick }: { workflow: Workflow, onClick: (workflow: Workflow) => void }) {
    return (
      <div
        className={clsx(
          'text-sm flex-col items-center justify-between gap-2 px-3 py-1 hover:bg-muted rounded-lg cursor-pointer border border-border shadow-sm',
        )}
        onClick={() => onClick(workflow)}
      >
        <div className='flex flex-row justify-between w-full'>
          <div className='flex items-center gap-2'>
            {workflow.favorite && <StarIcon className='size-4 text-yellow-400' />}
            <span>{getWorkflowName(workflow.name)}</span>
            <Separator orientation='vertical' className='h-4' />
            {extractServices(workflow.triggers).map((service) => {
              const icon = Array.isArray(services) ? services.find((s) => s.id === service)?.image : null;

              if (icon) {
                return (
                  <TooltipProvider key={service} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Badge variant='outline' className='p-1'>
                          <img src={icon} alt={service} className='size-5 aspect-square object-contain' />
                          <span className='sr-only'>{services.find((s) => s.id === service)?.name}</span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className='bg-background text-foreground border shadow-md'>
                        <p>{services.find((s) => s.id === service)?.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              } else {
                return (
                  <Badge key={service} variant='outline' className='text-xs h-full'>
                    <span>{service}</span>
                  </Badge>
                );
              }
            })}
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant='outline' className={clsx(
              'text-xs gap-1 px-1',
              workflow.enabled ? 'bg-success/10 border-success-foreground/10 text-success-foreground' : 'bg-muted border-muted-foreground/20 text-foreground'
            )}>
              {workflow.enabled ?
                <PlayIcon className='w-3 h-3' />
                :
                <PauseIcon className='w-3 h-3' />
              }
              {workflow.enabled ? t('workflows.live') : t('workflows.paused')}
            </Badge>
            <Separator orientation='vertical' className='h-4' />
            <span className='text-sm text-muted-foreground hidden md:block'>
              {new Date(workflow.createdAt).toLocaleDateString()}
            </span>
            <Separator orientation='vertical' className='h-4 hidden md:block' />
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant='outline' size='iconSm'>
                  <span className='sr-only'>{t('workflows.openMenu')}</span>
                  <EllipsisHorizontalIcon className='w-4 h-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuLabel>{t('workflows.actions')}</DropdownMenuLabel>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/workflows/${workflow.id}`);
                }}>
                  <PencilSquareIcon className='w-4 h-4' />
                  {t('workflows.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleToggleEnabled(workflow, e)}>
                  {workflow.enabled ? (
                    <>
                      <PauseIcon className='w-4 h-4' />
                      {t('workflows.disable')}
                    </>
                  ) : (
                    <>
                      <PlayIcon className='w-4 h-4' />
                      {t('workflows.enable')}
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(workflow.id);
                }}>
                  <TrashIcon className='w-4 h-4' />
                  {t('workflows.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {workflow.description && (
          <>
            <Separator className='w-full my-1.5' />
            <div className='text-sm text-muted-foreground'>
              {workflow.description}
            </div>
          </>
        )}
      </div>
    );
  }

  function WorkflowFolder({ path, workflows, onWorkflowClick, expandedFolders, setExpandedFolders }: FolderProps) {
    const { t } = useTranslation();
    const isExpanded = expandedFolders.has(path);

    const toggleFolder = () => {
      const newExpanded = new Set(expandedFolders);
      if (isExpanded) {
        newExpanded.delete(path);
      } else {
        newExpanded.add(path);
      }
      setExpandedFolders(newExpanded);
    };

    return (
      <div className='mb-2'>
        <div
          className='flex items-center gap-2 p-2 cursor-pointer hover:bg-muted rounded-lg group/folder transition-all duration-200'
          data-state={isExpanded ? 'open' : 'closed'}
          onClick={toggleFolder}
        >
          <ChevronRightIcon className='size-4 transition-transform duration-200 group-data-[state=open]/folder:rotate-90' />
          <FolderIcon className='size-4 text-muted-foreground text-sm' />
          <span className='font-medium'>{path || t('workflows.rootFolder')}</span>
          <span className='text-sm text-muted-foreground ml-auto'>
            {workflows.length} {workflows.length === 1 ? t('workflows.workflow') : t('workflows.workflows')}
          </span>
        </div>

        {isExpanded && (
          <div className='pl-6 pb-2 mt-1 space-y-2'>
            {workflows.map(workflow => (
              <WorkflowItem workflow={workflow} onClick={onWorkflowClick} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!token) return;
    const myToast = toast({
      description: t('workflows.deletingWorkflow'),
      variant: 'loading',
      action: (
        <ToastAction
          altText={t('workflows.cancel')}
          onClick={() => {
            if (deleteTimeoutRef.current) {
              clearTimeout(deleteTimeoutRef.current);
              deleteTimeoutRef.current = null;
              toast({
                description: t('workflows.deleteCancelledDescription'),
                variant: 'info',
              });
            }
          }}
        >
          {t('workflows.cancel').toLowerCase()}
        </ToastAction>
      ),
    });

    const workflowToDelete = workflows.find((workflow) => workflow.id === id);

    deleteTimeoutRef.current = setTimeout(async () => {
      setWorkflows((prevWorkflows) =>
        prevWorkflows.filter((workflow) => workflow.id !== id)
      );
      try {
        await deleteWorkflow(id, token);
        myToast.update({
          id: myToast.id,
          description: t('workflows.deleteSuccessDescription'),
          variant: 'success',
          action: undefined
        });
      } catch (error) {
        console.error('Failed to delete workflow', error);
        myToast.update({
          id: myToast.id,
          description: t('workflows.deleteErrorDescription'),
          variant: 'destructive',
          action: undefined
        });
        if (workflowToDelete)
          setWorkflows((prevWorkflows) => [...prevWorkflows, workflowToDelete]);
      }
    }, 3000); // 3 seconds delay
  };

  function extractServices(triggers: Event[], services: string[] = []) {
    for (const trigger of triggers) {
      if (trigger.serviceName && !services.includes(trigger.serviceName))
        services.push(trigger.serviceName);
      if (trigger.children)
        extractServices(trigger.children, services);
    }
    return services;
  }

  const handleCreate = async () => {
    if (!token || !selectedTrigger) return;
    const myToast = toast({
      description: t('workflows.creatingWorkflow'),
      variant: 'loading',
    });

    try {
      const finalFolder = isCreatingNewFolder ? newFolder : selectedFolder;
      const finalName = finalFolder
        ? `${finalFolder}/${newWorkflowName || t('workflows.newWorkflow')}`
        : newWorkflowName || t('workflows.newWorkflow');

      selectedTrigger.children = [];
      const newWorkflow = await createWorkflow({
        name: finalName,
        description: newWorkflowDescription,
        enabled: true,
        triggers: [selectedTrigger]
      }, token);

      setWorkflows((prev) => [...prev, newWorkflow]);
      setIsCreateDialogOpen(false);
      resetForm();
      myToast.update({
        id: myToast.id,
        description: t('workflows.createSuccessDescription'),
        variant: 'success',
      });
      navigate(`/workflows/${newWorkflow.id}`);
    } catch (error) {
      console.error('Failed to create workflow', error);
      myToast.update({
        id: myToast.id,
        description: t('workflows.createErrorDescription'),
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setNewWorkflowName('');
    setNewWorkflowDescription('');
    setSelectedFolder('');
    setNewFolder('');
    setIsCreatingNewFolder(false);
    setSelectedTrigger(null);
  };

  const handleToggleEnabled = async (workflow: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;

    const myToast = toast({
      description: workflow.enabled ? t('workflows.disabling') : t('workflows.enabling'),
      variant: 'loading',
    });

    try {
      const updatedWorkflow = await updateWorkflow(
        workflow.id,
        { ...workflow, enabled: !workflow.enabled },
        token
      );

      setWorkflows(prevWorkflows =>
        prevWorkflows.map(w => w.id === workflow.id ? updatedWorkflow : w)
      );

      myToast.update({
        id: myToast.id,
        description: workflow.enabled ? t('workflows.disableSuccess') : t('workflows.enableSuccess'),
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to toggle workflow status', error);
      myToast.update({
        id: myToast.id,
        description: t('workflows.toggleError'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='w-full'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:flex-1'>
          <Input
            placeholder={t('workflows.filterByName')}
            variantSize='sm'
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className='w-full sm:max-w-sm'
          />
        </div>
        <div className='flex items-center gap-2 w-full sm:w-auto'>
          <Button
            variant='default'
            size='sm'
            className='flex-1 sm:flex-none'
            onClick={() => {
              setIsCreateDialogOpen(true);
              setStep(0);
              setNewWorkflowName('');
              setNewWorkflowDescription('');
            }}
          >
            {t('workflows.create')} <PlusIcon />
          </Button>
        </div>
      </div>
      <div className='space-y-2'>
        {workflowGroups[''] && workflowGroups[''].map(workflow => (
          <WorkflowItem workflow={workflow} onClick={() => navigate(`/workflows/${workflow.id}`)} />
        ))}
        {Object.entries(workflowGroups)
          .filter(([path]) => path !== '')
          .map(([path, workflows]) => (
            <WorkflowFolder
              key={path}
              path={path}
              workflows={workflows}
              onWorkflowClick={(workflow) => navigate(`/workflows/${workflow.id}`)}
              expandedFolders={expandedFolders}
              setExpandedFolders={setExpandedFolders}
            />
          ))}
        {Object.entries(workflowGroups).length === 0 && (
          <div className='text-center py-8 text-muted-foreground'>
            {t('workflows.noResults')}
          </div>
        )}
        {filteredWorkflows.length === 0 && (
          <div className='text-center py-8 text-muted-foreground'>
            {t('workflows.noResults')}
          </div>
        )}
      </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          {step === 0 && (
            <>
              <DialogHeader>
                <DialogTitle>{t('workflows.creation.info.title')}</DialogTitle>
                <DialogDescription>
                  {t('workflows.creation.info.subtitle')}
                </DialogDescription>
              </DialogHeader>
              <div className='flex flex-col gap-2 items-start'>
                <Label htmlFor='name' className='text-right'>
                  {t('workflows.creation.info.name')}
                  <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='name'
                  required
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className='col-span-3'
                  placeholder={t('workflows.creation.info.namePlaceholder')}
                />
              </div>
              <div className='flex flex-col gap-2 items-start'>
                <Label htmlFor='description' className='text-right'>
                  {t('workflows.creation.info.description')}
                </Label>
                <Input
                  id='description'
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  className='col-span-3'
                  placeholder={t('workflows.creation.info.descriptionPlaceholder')}
                />
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}
                  size='sm'
                >
                  {t('workflows.creation.cancel')}
                </Button>
                <Button
                  onClick={() => setStep(1)}
                  disabled={!newWorkflowName.trim()}
                  size='sm'
                  variant='default'
                >
                  {t('workflows.creation.nextStep')}
                  <ArrowRightCircleIcon className='size-4' />
                </Button>
              </DialogFooter>
            </>
          )}
          {step === 1 && (
            <>
              <DialogHeader>
                <DialogTitle>{t('workflows.creation.folder.title')}</DialogTitle>
                <DialogDescription>
                  {t('workflows.creation.folder.description')}
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='space-y-4'>
                  {!isCreatingNewFolder && (
                    <div className='space-y-2'>
                      <Label>{t('workflows.creation.folder.existing')}</Label>
                      <div className='grid grid-cols-2 gap-2'>
                        <Button
                          variant={selectedFolder === '' ? 'default' : 'outline'}
                          className='justify-start'
                          onClick={() => setSelectedFolder('')}
                        >
                          <FolderIcon className='size-4' />
                          {t('workflows.rootFolder')}
                        </Button>
                        {availableFolders.map((folder) => (
                          <Button
                            key={folder}
                            variant={selectedFolder === folder ? 'default' : 'outline'}
                            className='justify-start'
                            onClick={() => setSelectedFolder(folder)}
                          >
                            <FolderIcon className='size-4' />
                            {folder}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {isCreatingNewFolder ? (
                    <div className='space-y-2'>
                      <Label>{t('workflows.creation.folder.new')}</Label>
                      <div className='flex gap-2'>
                        <Input
                          value={newFolder}
                          onChange={(e) => setNewFolder(e.target.value)}
                          placeholder={t('workflows.creation.folder.newPlaceholder')}
                        />
                        <Button
                          variant='outline'
                          onClick={() => {
                            setIsCreatingNewFolder(false);
                            setNewFolder('');
                          }}
                        >
                          {t('workflows.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={() => setIsCreatingNewFolder(true)}
                    >
                      <FolderPlusIcon className='size-4' />
                      {t('workflows.creation.folder.createNew')}
                    </Button>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setStep(0)}
                  size='sm'
                >
                  {t('workflows.creation.back')}
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  size='sm'
                  disabled={isCreatingNewFolder && !newFolder.trim()}
                >
                  {t('workflows.creation.nextStep')}
                  <ArrowRightCircleIcon className='size-4' />
                </Button>
              </DialogFooter>
            </>
          )}
          {step === 2 && (
            <>
              <DialogHeader>
                <DialogTitle>{t('workflows.creation.trigger.title')}</DialogTitle>
                <DialogDescription>{t('workflows.creation.trigger.description')}</DialogDescription>
              </DialogHeader>
              <div className='flex flex-col gap-2 items-start w-full'>
                {services.map((service: Service) => {
                  const hasActions = service.Event?.some((action: Event) => action.type === 'action');
                  if (!hasActions) return null;

                  return (
                    <div key={service.id} className='w-full overflow-hidden gap-1 flex flex-col p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground'>
                      <span>{service.name}</span>
                      {service.Event?.filter((action: Event) => action.type === 'action')?.map((action: Event) => (
                        <div
                          key={action.id}
                          className={clsx(
                            'transition-all duration-300 relative flex cursor-pointer gap-2 select-none items-center rounded-sm bg-muted border w-full px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
                            selectedTrigger?.id_node === action.id_node && 'border-green-500',
                          )}
                          onClick={() => handleSelectTrigger(action)}
                        >
                          <div className='flex-shrink-0 p-1 rounded-md bg-muted border overflow-hidden'>
                            {service.image ? (
                              <img src={service.image} alt={service.name} className='size-4 object-contain' />
                            ) : (
                              <div className='flex items-center justify-center size-4'>
                                <span>{service.name.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div className='flex flex-col min-w-0'>
                            <span className='truncate'>{action.name}</span>
                            <span className='text-muted-foreground text-xs truncate'>{action.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setStep(1)}
                  size='sm'
                >
                  {t('workflows.creation.back')}
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!selectedTrigger}
                  size='sm'
                  variant='default'
                >
                  {t('workflows.creation.create')}
                  <PlusCircleIcon className='size-4' />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

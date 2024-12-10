import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { deleteWorkflow, getWorkflows, updateWorkflow, createWorkflow } from '@/api/Workflows';
import { useNavigate } from 'react-router-dom';
import { ArrowsUpDownIcon, CheckIcon, ChevronDownIcon, EllipsisHorizontalIcon, PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getServices } from '@/api/Services';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Event, Node, Workflow } from '@/interfaces/Workflows';
import { Service } from '@/interfaces/Services';
import { useAuth } from '@/auth/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import clsx from 'clsx';
import { ArrowRightCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/hooks/use-toast';

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [services, setServices] = useState<Service[]>([]);
  const [rowSelection, setRowSelection] = useState({});
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowDescription, setNewWorkflowDescription] = useState("");
  const [step, setStep] = useState(0);
  const [selectedTrigger, setSelectedTrigger] = useState<Event | null>(null);
  const { toast } = useToast();

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
        console.log(data);
        setServices(data);
      } catch (error) {
        console.error('Failed to fetch services', error);
      }
    };

    fetchWorkflows();
    fetchServices();
  }, []);

  const handleSelectTrigger = (action: Event) => {
    console.log("selected trigger", action);
    setSelectedTrigger(action);
  };

  const handleEnable = async (id: string, value: boolean) => {
    setWorkflows((prevWorkflows) =>
      prevWorkflows.map((workflow) =>
        workflow.id === id ? { ...workflow, enabled: value } : workflow
      )
    );
    try {
      const updatedWorkflow = await updateWorkflow(id, { enabled: value });
      setWorkflows((prevWorkflows) =>
        prevWorkflows.map((workflow) =>
          workflow.id === id ? updatedWorkflow : workflow
        )
      );
    } catch (error) {
      console.error('Failed to update workflow', error);
      setWorkflows((prevWorkflows) =>
        prevWorkflows.map((workflow) =>
          workflow.id === id ? { ...workflow, enabled: !value } : workflow
        )
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    const workflowToDelete = workflows.find((workflow) => workflow.id === id);
    setWorkflows((prevWorkflows) =>
      prevWorkflows.filter((workflow) => workflow.id !== id)
    );
    try {
      await deleteWorkflow(id, token);
      toast({
        title: t('workflows.deleteSuccess'),
        description: t('workflows.deleteSuccessDescription'),
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to delete workflow', error);
      if (workflowToDelete)
        setWorkflows((prevWorkflows) => [...prevWorkflows, workflowToDelete]);
    }
  };

  const handleBulkEnable = async (value: boolean) => {
    const selectedWorkflows = table.getFilteredSelectedRowModel().rows.map(row => row.original);

    setWorkflows((prevWorkflows) =>
      prevWorkflows.map((workflow) =>
        selectedWorkflows.some(selected => selected.id === workflow.id)
          ? { ...workflow, enabled: value }
          : workflow
      )
    );

    try {
      await Promise.all(
        selectedWorkflows.map(workflow => updateWorkflow(workflow.id, { enabled: value }))
      );
    } catch (error) {
      console.error('Failed to update workflows', error);
      setWorkflows((prevWorkflows) =>
        prevWorkflows.map((workflow) =>
          selectedWorkflows.some(selected => selected.id === workflow.id)
            ? { ...workflow, enabled: selectedWorkflows.find(selected => selected.id === workflow.id)?.enabled ?? false }
            : workflow
        )
      );
    }
  };

  const handleBulkDelete = async () => {
    if (!token) return;
    const selectedWorkflows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
    setWorkflows((prevWorkflows) =>
      prevWorkflows.filter(workflow => !selectedWorkflows.some(selected => selected.id === workflow.id))
    );
    try {
      await Promise.all(
        selectedWorkflows.map(workflow => deleteWorkflow(workflow.id, token))
      );
      toast({
        title: t('workflows.bulkDeleteSuccess'),
        description: t('workflows.bulkDeleteSuccessDescription', { count: selectedWorkflows.length }),
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to delete workflows', error);
      setWorkflows((prevWorkflows) => [...prevWorkflows, ...selectedWorkflows]);
    }
  };

  function extractServices(nodes: Node[], services: string[] = []) {
    for (const node of nodes) {
      if (node.service)
        services.push(node.service.name);
      if (node.nodes && node.nodes.length > 0)
        extractServices(node.nodes, services);
    }
    return services;
  }

  const handleCreate = async () => {
    if (!token || !selectedTrigger) return;

    try {
      const newWorkflow = await createWorkflow({
        name: newWorkflowName || t('workflows.newWorkflow'),
        description: newWorkflowDescription,
        enabled: true,
        nodes: []
      }, token);

      setWorkflows((prev) => [...prev, newWorkflow]);
      setIsCreateDialogOpen(false);
      setNewWorkflowName("");
      setNewWorkflowDescription("");
      toast({
        title: t('workflows.createSuccess'),
        description: t('workflows.createSuccessDescription'),
        variant: 'success',
      });
      navigate(`/workflows/${newWorkflow.id}`);
    } catch (error) {
      console.error('Failed to create workflow', error);
      toast({
        title: t('workflows.createError'),
        description: t('workflows.createErrorDescription'),
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<Workflow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t('workflows.selectAll')}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t('workflows.selectRow')}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant='ghost'
          className='px-0 bg-transparent'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('workflows.name')}
          <ArrowsUpDownIcon />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'apps',
      header: () => (
        <>
          {t('workflows.apps')}
        </>
      ),
      cell: ({ row }) => {
        const extractedServices = extractServices(row.original.nodes);
        return (
          <div className='flex flex-row flex-wrap gap-1'>
            {extractedServices.map((service: string) => {
              const icon = services.find((s) => s.name === service)?.image;
              if (!icon)
                return (
                  <div key={service} className='flex flex-row items-center gap-2 border rounded-md p-1'>
                    <span>{service}</span>
                  </div>
                );
              return (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div key={service} className='cursor-pointer border rounded-md p-1'>
                        <img src={icon} alt={service} className='size-5 aspect-square object-contain' />
                        <span className='sr-only'>{service}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className='bg-background text-foreground border shadow-md'>
                      <p>{service}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        );
      }
    },
    {
      accessorKey: 'enabled',
      header: ({ column }) => (
        <Button
          variant='ghost'
          className='px-0 bg-transparent'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('workflows.enabled')}
          <ArrowsUpDownIcon />
        </Button>
      ),
      cell: ({ row }) => <div>
        <Switch
          checked={row.getValue('enabled')}
          onCheckedChange={(value) => handleEnable(row.original.id, value)}
        />
      </div>,
    },
    {
      id: 'actions',
      enableHiding: false,
      header: () => (
        <>
          {t('workflows.actions')}
        </>
      ),
      cell: ({ row }) => {
        const workflow = row.original;
        const navigate = useNavigate();
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='h-8 w-8 p-0'>
                <span className='sr-only'>{t('workflows.openMenu')}</span>
                <EllipsisHorizontalIcon className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuLabel>{t('workflows.actions')}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/workflows/${workflow.id}`)}>
                <PencilSquareIcon className='w-4 h-4' />
                {t('workflows.edit')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(workflow.id)}>
                <TrashIcon className='w-4 h-4' />
                {t('workflows.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: workflows,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className='w-full'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:flex-1'>
          <Input
            placeholder={t('workflows.filterByName')}
            variantSize='sm'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className='w-full sm:max-w-sm'
          />
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='destructiveOutline'
                  size='sm'
                  className='w-full sm:w-auto'
                >
                  {t('workflows.bulkActions')}
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuItem onClick={() => handleBulkEnable(true)}>
                  <CheckIcon className='w-4 h-4' />
                  {t('workflows.enableAll')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkEnable(false)}>
                  <XMarkIcon className='w-4 h-4' />
                  {t('workflows.disableAll')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkDelete()}>
                  <TrashIcon className='w-4 h-4' />
                  {t('workflows.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className='flex items-center gap-2 w-full sm:w-auto'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='flex-1 sm:flex-none'
              >
                {t('workflows.columns')} <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className='capitalize'
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {t(`workflows.${column.id}`)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant='default'
            size='sm'
            className='flex-1 sm:flex-none'
            onClick={() => {
              setIsCreateDialogOpen(true);
              setStep(0);
              setNewWorkflowName("");
              setNewWorkflowDescription("");
            }}
          >
            {t('workflows.create')} <PlusIcon />
          </Button>
        </div>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {t('workflows.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {t('workflows.selectedRows', {
            selected: table.getFilteredSelectedRowModel().rows.length,
            total: table.getFilteredRowModel().rows.length,
          })}
        </div>
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
              <div className="flex flex-col gap-2 items-start">
                <Label htmlFor="name" className="text-right">
                  {t('workflows.creation.info.name')}
                </Label>
                <Input
                  id="name"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className="col-span-3"
                  placeholder={t('workflows.creation.info.namePlaceholder')}
                />
              </div>
              <div className="flex flex-col gap-2 items-start">
                <Label htmlFor="description" className="text-right">
                  {t('workflows.creation.info.description')}
                </Label>
                <Input
                  id="description"
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  className="col-span-3"
                  placeholder={t('workflows.creation.info.descriptionPlaceholder')}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
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
                <DialogTitle>{t('workflows.creation.trigger.title')}</DialogTitle>
                <DialogDescription>{t('workflows.creation.trigger.description')}</DialogDescription>
              </DialogHeader>
              <div className='flex flex-col gap-2 items-start w-full'>
                {services.map((service: Service) =>
                  <div key={service.id} className='w-full overflow-hidden gap-1 flex flex-col p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground'>
                    <span>{service.name}</span>
                    {service.Event?.filter((action: Event) => action.type === 'Action')?.map((action: Event) => (
                      <div
                        key={action.id}
                        className={clsx(
                          'transition-all duration-300 relative flex cursor-pointer gap-2 select-none items-center rounded-sm bg-muted border w-full px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
                          selectedTrigger?.id === action.id && 'border-green-500'
                        )}
                        onClick={() => handleSelectTrigger(action)}
                      >
                        <div className='flex-shrink-0 p-1 rounded-md bg-muted border overflow-hidden'>
                          {service.image ? (
                            <img src={'https://www.svgrepo.com/show/353655/discord-icon.svg'} alt={service.name} className='size-4 object-contain' />
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
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setStep(0)}
                  size='sm'
                >
                  {t('workflows.creation.trigger.back')}
                </Button>
                <Button
                  onClick={() => handleCreate()}
                  disabled={!selectedTrigger}
                  size='sm'
                  variant='default'
                >
                  {t('workflows.creation.trigger.create')}
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

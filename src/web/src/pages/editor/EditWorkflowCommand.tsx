import { Service } from '../../../../shared/Workflow';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useTranslation } from 'react-i18next';

interface EditWorkflowCommandProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  services: Service[];
  onSelectService: (service: Service, action: any) => void;
}

export function EditWorkflowCommand({
  isOpen,
  onOpenChange,
  services,
  onSelectService,
}: EditWorkflowCommandProps) {
  const { t } = useTranslation();

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <Command className='rounded-lg border shadow-md'>
        <CommandInput placeholder={t('workflows.searchServices')} />
        <CommandList>
          <CommandEmpty>{t('workflows.noServicesFound')}</CommandEmpty>
          {services.map((service: Service) => (
            <CommandGroup key={service.id} heading={service.name}>
              {service.actions?.map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={() => onSelectService(service, action)}
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
  );
}

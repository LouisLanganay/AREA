import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Service } from '@/interfaces/Services';
import { Event } from '@/interfaces/Workflows';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

interface EditWorkflowCommandProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  services: Service[];
  onSelectService: (service: Service, action: Event) => void;
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
            <CommandGroup
              key={service.id}
              heading={service.name}
              className={clsx(service.Event?.filter((action) => action.type !== 'action').length === 0 && 'hidden')}
            >
              {service.Event?.filter((action) => action.type !== 'action')?.map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={() => onSelectService(service, action)}
                  className={clsx(
                    'flex items-center gap-2',
                    service.enabled ? '' : 'opacity-50 pointer-events-none'
                  )}
                >
                  <div className='p-1 rounded-md bg-muted border overflow-hidden'>
                    {service.image ? (
                      <img src={service.image} alt={service.name} className='size-4 rounded-sm object-contain flex-shrink-0' />
                    ) : (
                      <div className='size-4 bg-muted rounded-md items-center justify-center flex-shrink-0'>
                        <p className='text-xs text-muted-foreground flex items-center justify-center'>
                          {service.name.charAt(0).toUpperCase()}
                        </p>
                      </div>
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

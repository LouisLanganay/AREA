import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { XMarkIcon, ServerIcon, ChatBubbleBottomCenterTextIcon, Cog6ToothIcon, ArchiveBoxArrowDownIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Service } from '@/interfaces/Services';
import { Field, FieldGroup, Event } from '@/interfaces/Workflows';
import { DateTimePicker } from '@/components/ui/dateTimePicker';

interface EditWorkflowSidebarProps {
  selectedNode: Event | null;
  services: Service[];
  onClose: () => void;
  onFieldChange: (fieldId: string, value: any, nodeId: string) => void;
  onRemoveNode: (nodeId: string) => void;
  onResetNode: (nodeId: string) => void;
  hasChangesOnNode: (nodeId: string) => boolean;
}

export function EditWorkflowSidebar({
  selectedNode,
  services,
  onClose,
  onFieldChange,
  onRemoveNode,
  onResetNode,
  hasChangesOnNode,
}: EditWorkflowSidebarProps) {
  const { t } = useTranslation();

  if (!selectedNode) return null;

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

  const renderField = (field: Field, nodeId: string) => {
    const currentValue = field.value;
    const isInvalid = field.required && !currentValue;

    switch (field.type) {
    case 'string':
      return (
        <Input
          variantSize='sm'
          type='text'
          value={currentValue || ''}
          onChange={(e) => onFieldChange(field.id, e.target.value, nodeId)}
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
          onChange={(e) => onFieldChange(field.id, parseFloat(e.target.value), nodeId)}
          required={field.required}
          className={isInvalid ? 'border-destructive !ring-0' : ''}
        />
      );
    case 'boolean':
      return (
        <Checkbox
          checked={currentValue || false}
          onCheckedChange={(checked) => onFieldChange(field.id, checked, nodeId)}
        />
      );
    case 'select':
      return (
        <Select value={currentValue} onValueChange={(value) => onFieldChange(field.id, value, nodeId)}>
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
          onSelect={(date) => onFieldChange(field.id, date, nodeId)}
        />
      );
    case 'dateTime':
      return (
        <DateTimePicker
          value={currentValue ? new Date(currentValue) : undefined}
          onChange={(date) => onFieldChange(field.id, date, nodeId)}
        />
      );
    case 'checkbox':
      return (
        <Checkbox
          checked={currentValue || false}
          onCheckedChange={(checked) => onFieldChange(field.id, checked, nodeId)}
        />
      );
    case 'color':
      return (
        <Input
          type='color'
          value={currentValue || '#000000'}
          onChange={(e) => onFieldChange(field.id, e.target.value, nodeId)}
          required={field.required}
        />
      );
    default:
      return null;
    }
  };

  return (
    <div className='w-full md:w-[400px] bg-muted/50 p-4 border-l z-30'>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='p-1 rounded-md bg-muted border overflow-hidden'>
              {services.find(s => s.id === selectedNode.serviceName)?.image ? (
                <img
                  src={services.find(s => s.id === selectedNode.serviceName)?.image}
                  alt={selectedNode.serviceName}
                  className='size-5 object-contain'
                />
              ) : (
                <div className='size-5 bg-muted rounded-md flex items-center justify-center'>
                  <p className='text-xs text-muted-foreground'>
                    {selectedNode.serviceName.charAt(0).toUpperCase()}
                  </p>
                </div>
              )}
            </div>
            <div className='font-medium text-sm text-foreground'>
              {selectedNode.description}
            </div>
          </div>
          <Button
            variant='outline'
            size='sm'
            className='p-1 h-auto'
            onClick={onClose}
          >
            <XMarkIcon className='w-4 h-4' />
          </Button>
        </div>

        <div className='space-y-2'>
          {selectedNode.fieldGroups && (
            <div className='space-y-4'>
              {selectedNode.fieldGroups.map((group: FieldGroup) => (
                <div key={group.id} className='space-y-4 bg-card border rounded-lg p-4 shadow-sm'>
                  <div className='flex items-center gap-2'>
                    <div className='p-1 min-w-6 min-h-6 rounded-full bg-muted border overflow-hidden'>
                      {getGroupIcon(group.type)}
                    </div>
                    <p className='text-sm font-semibold'>{group.name}</p>
                  </div>
                  {group.fields.map((field: Field) => (
                    <div key={field.id} className='space-y-1'>
                      <Label className='flex items-center gap-1'>
                        {field.description}
                        {field.required && (
                          <span className='text-sm text-destructive'>*</span>
                        )}
                      </Label>
                      {renderField(field, selectedNode.id)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='flex items-center gap-2'>
          {selectedNode.type === 'reaction' && (
            <Button
              variant='destructiveOutline'
              size='sm'
              onClick={() => onRemoveNode(selectedNode.id)}
            >
              <ArchiveBoxArrowDownIcon className='w-4 h-4' />
              {t('workflows.remove')}
            </Button>
          )}
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onResetNode(selectedNode.id)}
            disabled={!hasChangesOnNode(selectedNode.id)}
          >
            <ArrowUturnLeftIcon className='w-4 h-4' />
            {t('workflows.resetNode')}
          </Button>
        </div>
      </div>
    </div>
  );
}

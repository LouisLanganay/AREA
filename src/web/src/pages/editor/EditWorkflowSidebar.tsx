import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Node as AreaNode, Field, FieldGroup, Service } from '../../../../shared/Workflow';
import { XMarkIcon, ServerIcon, ChatBubbleBottomCenterTextIcon, Cog6ToothIcon, ArchiveBoxArrowDownIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';

interface EditWorkflowSidebarProps {
  selectedNode: AreaNode | null;
  services: Service[];
  onClose: () => void;
  onFieldChange: (fieldId: string, value: any) => void;
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

  const renderField = (field: Field) => {
    const currentValue = field.value;
    const isInvalid = field.required && !currentValue;

    switch (field.type) {
      case 'text':
        return (
          <Input
            variantSize='sm'
            type='text'
            value={currentValue || ''}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
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
            onChange={(e) => onFieldChange(field.id, parseFloat(e.target.value))}
            required={field.required}
            className={isInvalid ? 'border-destructive !ring-0' : ''}
          />
        );
      case 'boolean':
        return (
          <Checkbox
            checked={currentValue || false}
            onCheckedChange={(checked) => onFieldChange(field.id, checked)}
          />
        );
      case 'select':
        return (
          <Select value={currentValue} onValueChange={(value) => onFieldChange(field.id, value)}>
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
            onSelect={(date) => onFieldChange(field.id, date)}
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            checked={currentValue || false}
            onCheckedChange={(checked) => onFieldChange(field.id, checked)}
          />
        );
      case 'color':
        return (
          <Input
            type='color'
            value={currentValue || '#000000'}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className='w-[400px] bg-muted/50 p-4 border-l'>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='p-1 rounded-md bg-muted border overflow-hidden'>
              {services.find(s => s.id === selectedNode.service.id)?.image && (
                <img 
                  src={services.find(s => s.id === selectedNode.service.id)?.image} 
                  alt={selectedNode.service.name} 
                  className='size-5 object-contain' 
                />
              )}
            </div>
            <div className='font-medium text-sm text-gray-900'>
              {selectedNode.service.description}
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
                <div key={group.id} className='space-y-4 bg-white border rounded-lg p-4 shadow-sm'>
                  <div className='flex items-center gap-2'>
                    <div className='p-1 min-w-6 min-h-6 rounded-full bg-muted border overflow-hidden'>
                      {getGroupIcon(group.type)}
                    </div>
                    <p className='text-sm font-semibold'>{group.name}</p>
                  </div>
                  {group.fields.map((field: Field) => (
                    <div key={field.id} className='space-y-1'>
                      <Label className='flex items-center gap-1'>
                        {field.label}
                        {field.required && (
                          <span className='text-sm text-destructive'>*</span>
                        )}
                      </Label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='destructiveOutline'
            size='sm'
            onClick={() => onRemoveNode(selectedNode.id)}
          >
            <ArchiveBoxArrowDownIcon className='w-4 h-4' />
            {t('workflows.remove')}
          </Button>
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
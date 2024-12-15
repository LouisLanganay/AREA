import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { WorkflowNodeData } from '@/interfaces/Workflows';
import { ExclamationTriangleIcon, SignalIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Badge } from '../ui/badge';

export default memo(({ data }: { data: WorkflowNodeData, isConnectable: boolean }) => {
  const { t } = useTranslation();

  const getStatusColor = () => {
    switch (data.status) {
    case 'success':
      return 'bg-green-100 border-green-200';
    case 'error':
      return 'bg-red-100 border-red-200';
    case 'pending':
      return 'bg-yellow-100 border-yellow-200';
    default:
      return 'bg-card';
    }
  };

  return (
    <div className='flex flex-col'>
      {data.isTrigger && (
        <div className='w-fit p-1 flex flex-row items-center gap-1 bg-muted border border-b-0 rounded-t-lg'>
          <SignalIcon className='size-4 text-muted-foreground' />
          <div className='text-xs text-muted-foreground'>
            {t('workflows.trigger')}
          </div>
        </div>
      )}
      <div className={clsx(
        'border shadow-sm text-sm px-2 py-2 w-[330px] h-fit ring-primary ring-0 transition-all',
        data.isTrigger ? 'rounded-b-lg rounded-r-lg' : 'rounded-lg',
        !data.isValid ? '!ring-destructive ring-1' : '',
        data.selected ? '!ring-2' : '',
        getStatusColor()
      )}>
        <div className='flex flex-col justify-start gap-2'>
          <div className='flex items-center gap-2 h-fit justify-between'>
            <div className='flex items-center gap-2'>
              <div className='p-0.5 rounded-md bg-muted border overflow-hidden'>
                {data.service?.image ? (
                  <img src={data.service.image} alt={data.service.name} className='size-4 object-contain' />
                ) : (
                  <div className='size-4 bg-muted rounded-md flex items-center justify-center'>
                    <p className='text-xs text-muted-foreground'>
                      {data.service?.name.charAt(0).toUpperCase()}
                    </p>
                  </div>
                )}
              </div>
              <div className='font-medium text-sm text-foreground'>
                {data.label}
              </div>
            </div>
            {!data.isValid && (
              <Badge variant='destructiveOutline'>
                <ExclamationTriangleIcon className='size-4 mr-1' />
                {t('workflows.invalidFields')}
              </Badge>
            )}
          </div>
          <hr className='w-full border-border' />
          <div className='text-xs text-muted-foreground tracking-tight'>
            {data.description}
          </div>
        </div>

        <Handle
          type='target'
          position={Position.Top}
          style={{ visibility: 'hidden' }}
        />
        <Handle
          type='source'
          position={Position.Bottom}
          style={{ visibility: 'hidden' }}
        />
      </div>
    </div>
  );
});

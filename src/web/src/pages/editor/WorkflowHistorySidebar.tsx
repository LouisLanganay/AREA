import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Workflow, WorkflowHistory } from '@/interfaces/Workflows';
import { PauseIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { formatDate } from 'date-fns/format';
import { fr } from 'date-fns/locale/fr';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WorkflowHistorySidebarProps {
  workflow: Workflow;
  history: WorkflowHistory[];
  onClose: () => void;
  onRefresh: () => void;
}

export function WorkflowHistorySidebar({
  workflow,
  history,
  onClose,
  onRefresh,
}: WorkflowHistorySidebarProps) {
  const { t } = useTranslation();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshDisabled, setIsRefreshDisabled] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastRefresh = new Date().getTime() - lastRefresh.getTime();
      setIsRefreshDisabled(timeSinceLastRefresh < 10000);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastRefresh]);

  const handleRefresh = () => {
    onRefresh();
    setLastRefresh(new Date());
    setIsRefreshDisabled(true);
  };

  return (
    <div className='w-full md:w-[400px] bg-muted p-4 border-l z-30'>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h2 className='font-medium text-lg'>{t('workflows.executionHistory')}</h2>
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

        <div className='flex flex-col gap-2 pb-2 border-b'>
          <p className='text-sm text-muted-foreground'>
            {t('workflows.lastTenExecutions')}
          </p>
          <div className='flex flex-row items-center gap-2'>
            <p className='text-sm text-muted-foreground'>
              {t('workflows.lastRefresh', { time: formatDate(lastRefresh, 'p', { locale: fr }) })}
            </p>
            <Button
              variant='outline'
              size='xs'
              onClick={handleRefresh}
              disabled={isRefreshDisabled}
            >
              {t('workflows.refresh')}
              <ArrowPathIcon className='w-4 h-4' />
            </Button>
          </div>
        </div>

        <ScrollArea className='h-[calc(100vh-300px)] pr-1 relative'>
          <div className='space-y-2'>
            {history.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-4'>
                {t('workflows.noHistory')}
              </p>
            ) : (
              <div className='space-y-2'>
                {!workflow.enabled && (
                  <div className='flex items-center gap-3 p-3 border border-dashed border-blue-500 bg-blue-500/10 rounded-lg shadow-sm'>
                    <PauseIcon className='w-5 h-5' />
                    <p className='text-sm'>
                      {t('workflows.workflowDisabled')}
                    </p>
                  </div>
                )}
                {history.slice().reverse().map((entry, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-3 p-3 bg-card border rounded-lg shadow-sm'
                  >
                    {entry.status === 'success' ? (
                      <CheckCircleIcon className='w-5 h-5 text-success' />
                    ) : (
                      <XCircleIcon className='w-5 h-5 text-destructive' />
                    )}
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>
                        {formatDate(new Date(entry.executionDate), 'PPp', { locale: fr })}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {entry.status === 'success'
                          ? t('workflows.executionSuccess')
                          : t('workflows.executionError')
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className='absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-muted to-transparent' />
        </ScrollArea>
      </div>
    </div>
  );
}

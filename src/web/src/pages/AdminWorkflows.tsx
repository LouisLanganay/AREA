import { getAllWorkflowsHistory } from '@/api/Workflows';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { WorkflowHistoryEntry } from '@/interfaces/api/Workflows';
import { CheckIcon, ExclamationTriangleIcon, SignalIcon, SignalSlashIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';

interface WorkflowStats {
  date: string;
  total: number;
  success: number;
  error: number;
}

export default function AdminWorkflows() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [workflowStats, setWorkflowStats] = useState<WorkflowStats[]>([]);
  const [viewMode, setViewMode] = useState<'daily' | 'hourly' | 'minute'>('minute');
  const [recentWorkflows, setRecentWorkflows] = useState<WorkflowHistoryEntry[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const fetchWorkflowsHistory = async () => {
      if (!token) return;
      try {
        const history = await getAllWorkflowsHistory(token);
        const stats = processWorkflowHistory(history);
        setWorkflowStats(stats);
        setRecentWorkflows(history);
      } catch (error) {
        console.error('Failed to fetch workflows history:', error);
        toast({
          variant: 'destructive',
          description: t('admin.fetchHistoryError'),
        });
      }
    };

    // Initial fetch
    fetchWorkflowsHistory();

    // Set up polling if live mode is enabled
    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(fetchWorkflowsHistory, 5000);
    }

    // Cleanup
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [token, viewMode, isLive]);

  const processWorkflowHistory = (history: WorkflowHistoryEntry[]): WorkflowStats[] => {
    const statsMap = new Map<string, { total: number; success: number; error: number }>();

    if (!history || !Array.isArray(history)) return [];

    history.forEach(entry => {
      if (!entry?.executionDate) return;

      const date = new Date(entry.executionDate);
      const key = viewMode === 'daily'
        ? date.toLocaleDateString()
        : viewMode === 'hourly'
          ? `${date.toLocaleDateString()} ${date.getHours()}:00`
          : `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`;

      const current = statsMap.get(key) || { total: 0, success: 0, error: 0 };

      current.total += 1;
      if (entry.status === 'success') {
        current.success += 1;
      } else {
        current.error += 1;
      }

      statsMap.set(key, current);
    });

    return Array.from(statsMap.entries())
      .map(([date, stats]) => ({
        date,
        ...stats
      }))
      .sort((a, b) => {
        const dateA = viewMode === 'daily'
          ? new Date(a.date)
          : new Date(a.date.split(' ')[0] + 'T' + a.date.split(' ')[1]);
        const dateB = viewMode === 'daily'
          ? new Date(b.date)
          : new Date(b.date.split(' ')[0] + 'T' + b.date.split(' ')[1]);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(viewMode === 'daily' ? -7 : viewMode === 'hourly' ? -24 : -1000);
  };

  const calculateAverages = (stats: WorkflowStats[]) => {
    if (stats.length === 0) return { successAvg: 0, errorAvg: 0 };

    const totals = stats.reduce((acc, curr) => ({
      success: acc.success + curr.success,
      error: acc.error + curr.error
    }), { success: 0, error: 0 });

    return {
      successAvg: totals.success / stats.length,
      errorAvg: totals.error / stats.length
    };
  };

  const chartConfig = {
    success: {
      label: t('admin.stats.success'),
      color: 'hsl(var(--success))',
    },
    error: {
      label: t('admin.stats.error'),
      color: 'hsl(var(--destructive))',
    },
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>{t('admin.workflowStats')}</h1>
          <p className='text-muted-foreground'>{t('admin.statsDescription')}</p>
        </div>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            className={clsx(
              'border-dashed',
              isLive ? 'border-success bg-success/20 hover:bg-success/10' : ''
            )}
            onClick={() => setIsLive(!isLive)}
          >
            {!isLive ? <SignalSlashIcon className='w-4 h-4' /> : <SignalIcon className='w-4 h-4' />}
            {!isLive ? t('admin.pause') : t('admin.live')}
          </Button>
          <Select value={viewMode} onValueChange={(value: 'daily' | 'hourly' | 'minute') => setViewMode(value)}>
            <SelectTrigger className='w-fit'>
              <SelectValue placeholder={t('admin.selectViewMode')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='daily'>{t('admin.viewMode.daily')}</SelectItem>
              <SelectItem value='hourly'>{t('admin.viewMode.hourly')}</SelectItem>
              <SelectItem value='minute'>{t('admin.viewMode.minute')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='rounded-md border p-4'>
        <ChartContainer config={chartConfig} className='max-h-[400px] w-full'>
          <AreaChart
            data={workflowStats}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              stroke='hsl(var(--muted-foreground))'
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              stroke='hsl(var(--muted-foreground))'
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={true}
              content={({ active, payload }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  formatter={(value, name) => (
                    <span className={clsx(
                      'font-bold flex items-center gap-2',
                      name === 'error' ? 'text-destructive' : 'text-success'
                    )}>
                      {name === 'error' ? <ExclamationTriangleIcon className='w-4 h-4' /> : <CheckIcon className='w-4 h-4' /> }
                      {`${value} ${t(`admin.stats.${name}`)}`}
                    </span>
                  )}
                />
              )}
            />
            <ReferenceLine
              y={calculateAverages(workflowStats).successAvg}
              stroke='hsl(var(--success))'
              strokeDasharray='3 4'
              strokeWidth={1}
              strokeOpacity={0.8}
              label={{
                value: `${calculateAverages(workflowStats).successAvg.toFixed(2)}%`,
                position: 'insideBottomRight',
                fontSize: 12,
                fill: 'hsl(var(--success))',
              }}
            />
            <ReferenceLine
              y={calculateAverages(workflowStats).errorAvg}
              stroke='hsl(var(--destructive))'
              strokeDasharray='3 4'
              strokeWidth={1}
              strokeOpacity={0.8}
              label={{
                value: `${calculateAverages(workflowStats).errorAvg.toFixed(2)}%`,
                position: 'insideBottomRight',
                fontSize: 12,
                fill: 'hsl(var(--destructive))',
              }}
            />
            <Area
              dataKey='error'
              type='basis'
              fill='hsl(var(--destructive))'
              fillOpacity={0.2}
              stroke='hsl(var(--destructive))'
              strokeWidth={2}
              stackId='a'
            />
            <Area
              dataKey='success'
              type='basis'
              fill='hsl(var(--success))'
              fillOpacity={0.2}
              stroke='hsl(var(--success))'
              strokeWidth={2}
              stackId='a'
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CheckIcon className='w-5 h-5 text-success' />
              {t('admin.recentSuccess')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className='h-[200px] relative'>
              <div className='space-y-2'>
                {recentWorkflows
                  .filter(wf => wf.status === 'success')
                  .slice(-10)
                  .map((workflow, index) => (
                    <div key={index} className='flex justify-between items-center p-2 rounded-lg border'>
                      <span className='text-sm'>{workflow.workflow.name}</span>
                      <span className='text-sm text-muted-foreground'>
                        {new Date(workflow.executionDate).toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
              <div className='absolute bottom-0 left-0 w-full h-14 bg-gradient-to-t from-card to-transparent' />
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ExclamationTriangleIcon className='w-5 h-5 text-destructive' />
              {t('admin.recentFailed')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className='h-[200px] relative'>
              <div className='space-y-2'>
                {recentWorkflows
                  .filter(wf => wf.status === 'failure')
                  .slice(-10)
                  .map((workflow, index) => (
                    <div key={index} className='flex justify-between items-center p-2 rounded-lg border'>
                      <span className='text-sm'>{workflow.workflow.name}</span>
                      <span className='text-sm text-muted-foreground'>
                        {new Date(workflow.executionDate).toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
              <div className='absolute bottom-0 left-0 w-full h-14 bg-gradient-to-t from-card to-transparent' />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

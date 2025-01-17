import { generateWorkflow, modifyWorkflow } from '@/api/Ai';
import { createWorkflow } from '@/api/Workflows';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Workflow } from '@/interfaces/Workflows';
import { BoltIcon, ChevronDownIcon, QuestionMarkCircleIcon, SparklesIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/solid';
import { AxiosError } from 'axios';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Wand2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

interface AIWorkflowAssistantProps {
  token: string | null;
  mode: 'create' | 'edit';
  workflow?: Workflow;
  onSuccess?: (result: Workflow) => void;
}

export function AIWorkflowAssistant({ token, mode, workflow, onSuccess }: AIWorkflowAssistantProps) {
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const [result, setResult] = useState<Workflow | null>(null);
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (result) {
      setIsTyping(true);
      const text = t('workflows.ai.resultDescription', {
        name: result?.name,
        id: result?.id,
        description: result?.description.toLowerCase()
      });
      let index = 0;
      setDisplayedText('');

      const typingInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText((current) => current + text.charAt(index));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);
        }
      }, 20);

      return () => clearInterval(typingInterval);
    }
  }, [result, t]);

  const handleGenerateWorkflow = async () => {
    if (!aiPrompt.trim() || !token) return;

    setIsGenerating(true);
    try {
      toast({
        description: t('workflows.ai.generating'),
        variant: 'loading',
        duration: Infinity,
      });

      let result = null;

      if (mode === 'create')
        result = await generateWorkflow(token, aiPrompt);
      else
        result = await modifyWorkflow(token, workflow!, aiPrompt);

      if (result.success) {
        let newWorkflow;

        if (mode === 'create')
          newWorkflow = await createWorkflow(result.data.workflow, token);
        else
          newWorkflow = result.data.workflow;

        toast({
          title: t('workflows.ai.success'),
          description: mode === 'create' ? t('workflows.ai.workflowCreated') : t('workflows.ai.workflowUpdated'),
          variant: 'success',
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        setResult(newWorkflow);
        if (onSuccess) onSuccess(newWorkflow);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast({
          title: t('error.' + error.response.data.message),
          description: error.response.data.error,
          variant: 'destructive',
        });
      } else {
        toast({
          description: t('workflows.ai.error'),
          variant: 'destructive',
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenAIAssistant = () => {
    setIsAIAssistantOpen(!isAIAssistantOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full md:min-w-[400px] max-w-[250px] md:max-w-[400px]">
      <div className="relative overflow-hidden rounded-xl p-[1px]">
        <div
          className={clsx("absolute inset-[-300px] bg-gradient-conic from-transparent from-70%",
            "via-premium to-premium animate-border-spin [transform-origin:50%_50%]",
            isAIAssistantOpen && isGenerating ? 'opacity-100' : 'opacity-0'
          )}
        />
        <div
          className={clsx(
            'bg-card p-3 border border-border rounded-xl opacity-100 relative overflow-hidden',
            !isAIAssistantOpen && 'cursor-pointer'
          )}
          onClick={() => !isAIAssistantOpen && handleOpenAIAssistant()}
        >
          <button
            aria-label={t('common.close')}
            className={clsx(
              'absolute right-2 top-2.5 p-1.5 rounded-md hover:bg-premium-bis/20 transition-all duration-200',
              isAIAssistantOpen ? 'rotate-0' : 'rotate-180'
            )}
            onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
          >
            <ChevronDownIcon className='size-3 text-premium' />
          </button>
          <div className="absolute top-10 right-0 size-16 bg-premium/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 size-24 bg-premium-bis/10 rounded-full blur-2xl pointer-events-none" />
          <div className='flex items-center relative z-10 w-fit'>
            <SparklesIcon className='size-5 text-premium mr-2' />
            <p className='text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-premium to-premium-bis'>
              {mode === 'create' ? t('workflows.ai.assistant') : t('workflows.ai.editor')}
            </p>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <QuestionMarkCircleIcon className='size-4 text-muted-foreground ml-2 hidden md:block' />
                </TooltipTrigger>
                <TooltipContent className='max-w-[300px]'>
                  <p>{t('workflows.ai.tooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <motion.div
            className='flex flex-col justify-between'
            animate={{
              opacity: isAIAssistantOpen ? 1 : 0,
              height: isAIAssistantOpen ? 'auto' : '0px',
              marginTop: isAIAssistantOpen ? '12px' : '0px',
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {token ? (
              <>
                <div className='flex flex-col gap-2 w-full'>
                  <textarea
                    disabled={isGenerating}
                    placeholder={t('workflows.ai.prompt')}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className={clsx(
                      'z-10 disabled:opacity-70 bg-muted text-sm rounded-md p-2 h-28 outline-none border first:border-border flex-grow resize-none',
                      '[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:rounded-lg [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-track]:my-1 [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20',
                      isAIAssistantOpen ? '' : 'pointer-events-none'
                    )}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateWorkflow();
                    }}
                    size='sm'
                    variant='premiumClasic'
                    disabled={!aiPrompt.trim() || isGenerating}
                    isLoading={isGenerating}
                  >
                    {mode === 'create' ? t('workflows.ai.generate') : t('workflows.ai.modify')}
                    <Wand2Icon className='size-4' />
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  {t('workflows.ai.description')}
                </p>
                {result && mode === 'create' && (
                  <motion.div
                    className='flex flex-col gap-1 w-full mt-4'
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <p className='text-sm text-muted-foreground'>
                      {displayedText}
                      {isTyping && <span className="animate-pulse">|</span>}
                    </p>
                    <div className='flex flex-row gap-2 w-full mt-2'>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setResult(null);
                          setAiPrompt('');
                        }}
                        size='sm'
                        variant='outline'
                      >
                        {t('workflows.ai.clear')}
                        <TrashIcon className='size-4' />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/workflows/${result?.id}`);
                        }}
                        size='sm'
                        variant='premiumClasic'
                      >
                        {t('workflows.ai.openWorkflow')}
                        <BoltIcon className='size-4' />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                {t('workflows.ai.setupToken')}
                <Link to="/settings?tab=security" className="text-premium hover:underline ml-1">
                  {t('workflows.ai.settings')}
                </Link>
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

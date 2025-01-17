import { Button } from '@/components/ui/button';
import { BoltIcon, CalendarIcon, ChevronRightIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { isPlatform } from '@ionic/react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { ClockIcon, FolderIcon, PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'left' | 'right' | 'top' | 'bottom';
  href?: string;
  schema?: React.ReactNode;
}

const steps: OnboardingStep[] = [
  {
    target: '[data-onboarding="sidebar"]',
    title: 'onboarding.sidebar.title',
    description: 'onboarding.sidebar.description',
    position: 'right',
    href: '/workflows',
    schema: (
      <div className='flex flex-col gap-2 bg-muted-foreground/10 p-2 rounded-md mb-2'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center'>
            <BoltIcon className='w-4 h-4 text-primary/70' />
          </div>
          <div className='flex-1'>
            <div className='h-2 w-32 bg-muted-foreground/20 rounded'></div>
            <div className='h-2 w-24 bg-muted-foreground/10 rounded mt-1'></div>
          </div>
          <ChevronRightIcon className='w-3 h-3 text-muted-foreground/50' />
        </div>
        <div className='flex items-center gap-2 opacity-75 pl-4'>
          <div className='w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center'>
            <DocumentIcon className='w-3 h-3 text-primary/70' />
          </div>
          <div className='flex-1'>
            <div className='h-2 w-24 bg-muted-foreground/20 rounded'></div>
          </div>
        </div>
        <div className='flex items-center gap-2 opacity-75 pl-4'>
          <div className='w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center'>
            <PlusIcon className='w-3 h-3 text-primary/70' />
          </div>
          <div className='flex-1'>
            <div className='h-2 w-20 bg-muted-foreground/20 rounded'></div>
          </div>
        </div>
      </div>
    )
  },
  {
    target: '[data-onboarding="sidebar-footer"]',
    title: 'onboarding.sidebarFooter.title',
    description: 'onboarding.sidebarFooter.description',
    position: 'right'
  },
  {
    target: '[data-onboarding="create-workflow"]',
    title: 'onboarding.createWorkflow.title',
    description: 'onboarding.createWorkflow.description',
    position: 'bottom',
    href: '/workflows',
    schema: (
      <div className='flex flex-col gap-2 bg-muted-foreground/10 p-2 rounded-md mb-2 relative'>
        <div className="absolute left-[150px] top-[50%] transform flex flex-row items-start gap-1">
          <svg
            fill="currentColor"
            className="text-cyan-400 -rotate-90"
            width="24px"
            height="24px"
            viewBox="0 0 266.495 266.494"
          >
            <g>
              <path d="M150.036,266.494c-0.264,0-0.517-0.006-0.792-0.018c-6.102-0.337-11.332-4.474-13.046-10.347l-26.067-89.027
                l-95.203-18.867c-6.014-1.194-10.614-6.059-11.476-12.123c-0.858-6.062,2.201-12.016,7.65-14.832L242.143,1.617
                C247.5-1.175,254.057-0.29,258.518,3.8c4.474,4.101,5.885,10.55,3.562,16.146l-98.743,237.655
                C161.097,263.018,155.836,266.494,150.036,266.494z"/>
            </g>
          </svg>
          <p className='text-xs text-background bg-cyan-400 border border-cyan-950 rounded-md px-1 py-0.5'>
            Louis
          </p>
        </div>
        <div className='flex items-center justify-between gap-2 p-2 rounded-md bg-muted-foreground/5'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center'>
              <div className='text-primary/70'>1</div>
            </div>
            <div className='flex-1'>
              <div className='h-2 w-32 bg-muted-foreground/20 rounded'></div>
              <div className='h-2 w-24 bg-muted-foreground/10 rounded mt-1'></div>
            </div>
          </div>
        </div>
        <div className='flex items-center justify-between gap-2 p-2 rounded-md bg-muted-foreground/5 ring-1 ring-primary/50'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center'>
              <div className='text-primary/70'>2</div>
            </div>
            <div className='flex-1'>
              <div className='h-2 w-24 bg-muted-foreground/20 rounded'></div>
              <div className='flex gap-2 mt-1'>
                <div className='h-6 w-20 bg-muted-foreground/10 rounded flex items-center justify-center'>
                  <FolderIcon className='w-4 h-4 text-primary/70' />
                </div>
                <div className='h-6 w-20 bg-muted-foreground/10 rounded flex items-center justify-center'>
                  <PlusIcon className='w-4 h-4 text-primary/70' />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex items-center justify-between gap-2 p-2 rounded-md bg-muted-foreground/5'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center'>
              <div className='text-primary/70'>3</div>
            </div>
            <div className='flex-1'>
              <div className='h-2 w-28 bg-muted-foreground/20 rounded'></div>
              <div className='flex gap-2 mt-1'>
                <div className='h-6 w-24 bg-muted-foreground/10 rounded flex items-center gap-1 px-2'>
                  <div className='w-4 h-4 rounded-sm bg-primary/20'></div>
                  <div className='h-2 w-12 bg-muted-foreground/20 rounded'></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    target: '[data-onboarding="services"]',
    title: 'onboarding.services.title',
    description: 'onboarding.services.description',
    position: 'bottom',
    href: '/services',
    schema: (
      <div className='flex flex-col gap-2 bg-muted-foreground/10 p-2 rounded-md mb-2'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center'>
            <CalendarIcon className='w-4 h-4 text-primary/70' />
          </div>
          <div className='flex-1'>
            <div className='h-2 w-24 bg-muted-foreground/20 rounded'></div>
            <div className='h-2 w-16 bg-muted-foreground/10 rounded mt-1'></div>
          </div>
        </div>
        <div className='flex items-center gap-2 opacity-75'>
          <div className='w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center'>
            <ClockIcon className='w-4 h-4 text-primary/70' />
          </div>
          <div className='flex-1'>
            <div className='h-2 w-20 bg-muted-foreground/20 rounded'></div>
            <div className='h-2 w-12 bg-muted-foreground/10 rounded mt-1'></div>
          </div>
        </div>
      </div>
    )
  }
];

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const currentHref = useLocation().pathname;

  useEffect(() => {
    const shouldShow = !isPlatform('capacitor') && Cookies.get('onboarding-completed') !== 'true';
    if (shouldShow) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      const target = document.querySelector(steps[currentStep].target);
      if (target) {
        const rect = target.getBoundingClientRect();
        const pos = calculatePosition(rect, steps[currentStep].position);
        setPosition(pos);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep]);

  const calculatePosition = (rect: DOMRect, position: string) => {
    switch (position) {
    case 'right':
      return {
        top: rect.top + rect.height / 2,
        left: rect.right + 20
      };
    case 'left':
      return {
        top: rect.top + rect.height / 2,
        left: rect.left - 320
      };
    case 'bottom':
      return {
        top: rect.bottom + 20,
        left: rect.left + rect.width / 2 - 200
      };
    case 'top':
      return {
        top: rect.top - 20 - 200,
        left: rect.left + rect.width / 2 - 200
      };
    default:
      return { top: 0, left: 0 };
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = steps[currentStep + 1];
      if (nextStep.href && !window.location.pathname.includes(nextStep.href)) {
        navigate(nextStep.href);
      }
      setCurrentStep(prev => prev + 1);
    } else {
      setIsVisible(false);
      Cookies.set('onboarding-completed', 'true', { expires: 365 });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const previousStep = steps[currentStep - 1];
      if (previousStep.href && !window.location.pathname.includes(previousStep.href)) {
        navigate(previousStep.href);
      }
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    Cookies.set('onboarding-completed', 'true', { expires: 365 });
  };

  useEffect(() => {
    if (currentHref !== steps[currentStep].href && steps[currentStep].href && isVisible) {
      if (currentHref === '/register' || currentHref === '/login')
        return;
      navigate(steps[currentStep].href);
    }
  }, [currentHref, currentStep, isVisible]);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVisible]);

  useEffect(() => {
    if (steps[currentStep].href && !currentHref.includes(steps[currentStep].href)) {
      return;
    }
  }, [currentHref, currentStep]);

  if (!isVisible || (steps[currentStep].href && !currentHref.includes(steps[currentStep].href))) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className='fixed z-50'
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        <div
          className={clsx('z-10 absolute w-4 h-4 bg-card border-l border-t transform -rotate-45', {
            'left-[-8px] top-[calc(35%-8px)]': steps[currentStep].position === 'right',
            'top-[-8px] left-[calc(35%-8px)] rotate-[45deg]': steps[currentStep].position === 'bottom',
            'right-[-8px] top-[calc(35%-8px)] rotate-[45deg]': steps[currentStep].position === 'left',
            'bottom-[-8px] left-[calc(35%-8px)] rotate-[45deg]': steps[currentStep].position === 'top',
          })}
        />
        <div className='bg-card border rounded-lg shadow-md p-4 w-[300px] relative overflow-hidden group/onboarding'>
          <motion.div
            className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-primary to-primary/80"
            initial={{ width: "0%" }}
            animate={{
              width: `${((currentStep + 1) / steps.length) * 100}%`
            }}
            transition={{ duration: 0.3 }}
          />
          <div className='flex justify-between items-center mb-2'>
            <motion.h4
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='font-semibold text-sm'
            >
              {t(steps[currentStep].title)}
            </motion.h4>
            <button
              onClick={handleSkip}
              aria-label={t('common.close')}
              className='absolute right-3 top-3 p-1 rounded-md hover:bg-muted-foreground/10 transition-all duration-200 group-hover/onboarding:opacity-100 md:opacity-0'
            >
              <XMarkIcon className='size-3 text-foreground' />
            </button>
          </div>
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='text-sm text-muted-foreground mb-3'
          >
            {t(steps[currentStep].description)}
          </motion.p>
          {steps[currentStep].schema}
          <div className='flex justify-between items-center'>
            <motion.p
              key={`step-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='text-sm text-muted-foreground'
            >
              {currentStep + 1} {t('onboarding.of')} {steps.length}
            </motion.p>
            <div className='flex gap-2'>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {currentStep > 0 && (
                  <Button
                    variant='outline'
                    size='xs'
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                  >
                    {t('onboarding.previous')}
                  </Button>
                )}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Button
                  variant='default'
                  className={clsx(
                    currentStep === steps.length - 1 ? 'ring-[1px] ring-primary/50 ring-offset-[3px] ring-offset-card' : ''
                  )}
                  size='xs'
                  onClick={handleNext}
                >
                  {currentStep === steps.length - 1 ? t('onboarding.finish') : t('onboarding.next')}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

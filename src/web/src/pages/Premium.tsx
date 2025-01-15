import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRightIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PricingTier {
  name: string;
  price: {
    monthly: string;
    yearly: string;
  } | null;
  description: string;
  features: string[];
  buttonText: string;
  highlighted?: boolean;
}

export default function Premium() {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isLaunching, setIsLaunching] = useState(false);

  const pricingTiers: PricingTier[] = [
    {
      name: t('premium.tiers.free.name'),
      price: {
        monthly: t('premium.tiers.free.price.monthly'),
        yearly: t('premium.tiers.free.price.yearly')
      },
      description: t('premium.tiers.free.description'),
      features: [
        t('premium.tiers.free.features.workflows'),
        t('premium.tiers.free.features.integrations'),
        t('premium.tiers.free.features.support'),
      ],
      buttonText: t('premium.tiers.free.button'),
    },
    {
      name: t('premium.tiers.pro.name'),
      price: {
        monthly: t('premium.tiers.pro.price.monthly'),
        yearly: t('premium.tiers.pro.price.yearly')
      },
      description: t('premium.tiers.pro.description'),
      features: [
        t('premium.tiers.pro.features.ai'),
        t('premium.tiers.pro.features.priority'),
        t('premium.tiers.pro.features.storage'),
        t('premium.tiers.pro.features.support'),
      ],
      buttonText: t('premium.tiers.pro.button'),
      highlighted: true,
    },
    {
      name: t('premium.tiers.enterprise.name'),
      price: null,
      description: t('premium.tiers.enterprise.description'),
      buttonText: t('premium.tiers.enterprise.button'),
      features: [
        t('premium.tiers.enterprise.features.commercial'),
      ],
    }
  ];

  const handleClick = () => {
    setIsLaunching(true);
    setTimeout(() => setIsLaunching(false), 2000);
  };

  return (
    <div className='py-8 px-4 flex flex-col items-center justify-center relative'>
      <div className='absolute inset-0 z-0 pointer-events-none'>
        <div className='absolute bg-premium/10 size-64 md:size-96 rounded-full blur-7xl animate-blob2' />
        <div className='absolute right-10 bottom-0 bg-premium-bis/10 size-64 md:size-96 rounded-full blur-7xl animate-blob animation-delay-2000' />
      </div>
      <div className='text-center mb-12'>
        <div className='flex items-center justify-center gap-2 mb-4'>
          <h1 className='text-xl md:text-2xl font-bold'>{t('premium.title')}</h1>
          <motion.div
            animate={isLaunching ? {
              y: -100,
              x: 100,
              rotate: 10,
              opacity: 0,
            } : {
              y: 0,
              x: 0,
              rotate: 0,
              opacity: 1,
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <RocketLaunchIcon className='size-4 md:size-6 text-premium' />
          </motion.div>
        </div>
        <p className='text-sm md:text-base text-muted-foreground mx-auto italic'>
          {t('premium.description')}
        </p>
      </div>

      <Tabs defaultValue='monthly' className='mb-8'>
        <TabsList>
          <TabsTrigger value='monthly' onClick={() => setSelectedPlan('monthly')}>Monthly</TabsTrigger>
          <TabsTrigger value='yearly' onClick={() => setSelectedPlan('yearly')}>Yearly (- 20%)</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className='max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {pricingTiers.map((tier, index) => (
          <div
            key={tier.name}
            className={clsx(
              'rounded-xl border p-6 relative max-w-sm',
              tier.highlighted ? 'border-premium bg-premium/5' : 'border-border backdrop-blur-3xl bg-background/70'
            )}
          >
            {tier.highlighted && (
              <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                <div className='bg-premium text-premium-foreground text-sm font-medium px-3 py-1 rounded-full'>
                  {t('premium.recommended')}
                </div>
              </div>
            )}

            <div className='mb-8 h-32'>
              <h2 className='text-2xl font-bold mb-2'>{tier.name}</h2>
              {tier.price ? (
                <div className='mb-4'>
                  <span className={clsx(
                    'text-4xl font-bold',
                    tier.highlighted ? 'bg-gradient-to-r from-premium to-premium-bis bg-clip-text text-transparent' : 'text-foreground'
                  )}>
                    {selectedPlan === 'monthly' ? tier.price.monthly : tier.price.yearly}€
                  </span>
                  <span className='text-muted-foreground ml-2'>/mo</span>
                </div>
              ) : (
                <div className='mb-4'>
                  <span className='text-4xl font-bold'>
                    {t('premium.contactUs')}
                  </span>
                </div>
              )}
              <p className='text-muted-foreground text-sm'>{tier.description}</p>
            </div>

            <Button
              className='w-full group'
              variant={tier.highlighted ? 'premium' : 'outline'}
              onClick={() => handleClick()}
            >
              {tier.buttonText} {tier.highlighted ? <RocketLaunchIcon className='size-4 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:rotate-12 transition-all duration-300' /> : null}
            </Button>

            <div className='h-[1px] w-full bg-gradient-to-r from-transparent via-premium-bis/50 to-transparent my-8' />

            <p className='text-sm text-foreground font-semibold mb-4'>
              {index > 0 ? (
                <span>
                  {t('premium.includes', { previous_tier: pricingTiers[index - 1].name })}
                </span>
              ) : (
                <span>
                  {t('premium.include')}
                </span>
              )}
            </p>

            <ul className='space-y-2 text-sm'>
              {tier.features.map((feature) => (
                <li key={feature} className='flex items-center'>
                  <ArrowUpRightIcon className='size-4 text-premium flex-shrink-0 mr-2' />
                  <span className='text-muted-foreground'>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

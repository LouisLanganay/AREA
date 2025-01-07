import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  highlighted?: boolean;
}

export default function Premium() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const pricingTiers: PricingTier[] = [
    {
      name: t('premium.tiers.free.name'),
      price: t('premium.tiers.free.price'),
      description: t('premium.tiers.free.description'),
      features: [
        t('premium.tiers.free.features.workflows'),
        t('premium.tiers.free.features.integrations'),
        t('premium.tiers.free.features.storage'),
        t('premium.tiers.free.features.support'),
      ],
      buttonText: t('premium.tiers.free.button'),
    },
    {
      name: t('premium.tiers.pro.name'),
      price: t('premium.tiers.pro.price'),
      description: t('premium.tiers.pro.description'),
      features: [
        t('premium.tiers.pro.features.everything'),
        t('premium.tiers.pro.features.ai'),
        t('premium.tiers.pro.features.priority'),
        t('premium.tiers.pro.features.analytics'),
        t('premium.tiers.pro.features.storage'),
        t('premium.tiers.pro.features.support'),
      ],
      buttonText: t('premium.tiers.pro.button'),
      highlighted: true,
    }
  ];

  return (
    <div className="py-8 px-4">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <SparklesIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">{t('premium.title')}</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('premium.description')}
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {pricingTiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-2xl border p-8 relative ${
              tier.highlighted
                ? 'border-primary/50 bg-primary/5'
                : 'border-border'
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                  {t('premium.recommended')}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">{tier.name}</h2>
              <div className="mb-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.price !== t('premium.tiers.free.price') && (
                  <span className="text-muted-foreground ml-2">/month</span>
                )}
              </div>
              <p className="text-muted-foreground">{tier.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant={tier.highlighted ? 'default' : 'outline'}
              onClick={() => navigate('/register')}
            >
              {tier.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

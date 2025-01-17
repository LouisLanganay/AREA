import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Loading() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setError(t('loading.error'));
    }, 10000);

    return () => clearTimeout(timer);
  }, [t]);

  return (
    <div className='flex min-h-screen items-center justify-center gap-4'>
      {error ? (
        <div className='flex flex-col items-center justify-center'>
          <div className='text-destructive'>
            {error}
          </div>
          <Button
            variant='outline'
            onClick={() => navigate('/login')}
          >
            {t('common.tryAgain')}
          </Button>
        </div>
      ) : (
        <div className='text-center'>
          <h2 className='text-3xl font-bold'>{t('loading.authenticating')}</h2>
          <p>{t('loading.pleaseWait')}</p>
        </div>
      )}
    </div>
  );
}

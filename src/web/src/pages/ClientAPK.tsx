import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ClientAPK() {
  const [seconds, setSeconds] = useState(3);
  const { t } = useTranslation();

  useEffect(() => {
    const countdown = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    const timer = setTimeout(() => {
      window.location.href = '/LinkIt.apk';
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdown);
    };
  }, []);

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='text-center'>
        <h2 className='text-3xl font-bold'>
          {seconds > 0 ? (
            <span>{t('client.apk.startIn', { seconds })}</span>
          ) : (
            <span>{t('client.apk.title')}</span>
          )}
        </h2>
        <p className='mt-2 text-sm text-muted-foreground'>
          {t('client.apk.description')}
          <Button
            variant='link'
            onClick={() => window.location.href = '/LinkIt.apk'}
            className='px-0'
          >
            {t('client.apk.download')}
          </Button>
          .
        </p>
      </div>
    </div>
  );
}

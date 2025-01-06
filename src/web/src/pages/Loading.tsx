import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Loading() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setError(t('loading.error'));
    }, 10000);

    return () => clearTimeout(timer);
  }, [t]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      {error ? (
        <>
          <div className="text-destructive">
            {error}
          </div>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-3xl font-bold">{t('loading.authenticating')}</h2>
          <p>{t('loading.pleaseWait')}</p>
        </div>
      )}
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { HomeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md space-y-8 p-8 text-center'>
        <div className='space-y-2'>
          <h1 className='text-8xl font-bold text-primary'>404</h1>
          <h2 className='text-2xl font-semibold'>
            {t('notFound.title')}
          </h2>
          <p className='text-sm text-muted-foreground'>
            {t('notFound.description')}
          </p>
        </div>

        <div className='flex justify-center'>
          <Button onClick={() => navigate(-1)}>
            <HomeIcon className='h-4 w-4' />
            {t('notFound.backHome')}
          </Button>
        </div>
      </div>
    </div>
  );
}

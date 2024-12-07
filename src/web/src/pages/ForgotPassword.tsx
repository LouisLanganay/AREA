import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { error } from '../../../shared/error/error';
import { forgotPassword } from '@/api/Auth';
import { ArrowLeftCircleIcon, Loader2 } from 'lucide-react';
import { ArrowRightCircleIcon, EnvelopeOpenIcon } from '@heroicons/react/24/solid';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const forgotPasswordSchema = z.object({
    email: z.string().email(t('forgotPassword.emailInvalid')),
  });

  type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    setIsLoading(true);
    try {
      await forgotPassword({
        email: data.email,
      });
      setIsSubmitted(true);
    } catch(error: any) {
      const data = error.response.data as error;
      setError(t('error.' + data.err_code));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='w-full max-w-md space-y-4 p-8'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-primary flex items-center justify-center'>
              {t('forgotPassword.checkEmail')}
              <EnvelopeOpenIcon className='size-6 ml-2' />
            </h2>
            <p className='mt-2 text-sm text-muted-foreground'>
              {t('forgotPassword.checkEmailDescription')}
            </p>
          </div>
          <Button asChild className='w-full'>
            <Link to='/login'>
              {t('forgotPassword.backToLogin')}
              <ArrowLeftCircleIcon className='size-6' />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md space-y-4 p-8'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold'>
            {t('forgotPassword.title')}
          </h2>
          <p className='mt-2 text-sm text-muted-foreground'>
            {t('forgotPassword.description')}
          </p>
        </div>

        <form className='mt-8 space-y-4' onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor='email' className='block text-sm font-medium'>
              {t('forgotPassword.email')}
            </label>
            <input
              {...register('email')}
              type='email'
              className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              placeholder={t('forgotPassword.emailPlaceholder')}
            />
            {errors.email && (
              <p className='text-sm text-red-500 mt-1'>{errors.email.message}</p>
            )}
          </div>

          {error && (
            <p className='mt-2 text-sm text-red-500'>
              {error}
            </p>
          )}

          <Button type='submit' className='w-full' disabled={isLoading}>
            {t('forgotPassword.resetPassword')}
            {isLoading ?
              <Loader2 className='w-4 h-4 animate-spin' /> :
              <ArrowRightCircleIcon className='w-4 h-4' />
            }
          </Button>
        </form>

        <p className='text-sm text-muted-foreground text-center'>
          <Link to='/login' className='text-primary hover:underline'>
            {t('forgotPassword.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}

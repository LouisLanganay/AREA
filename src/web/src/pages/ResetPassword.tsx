import { Button } from '@/components/ui/button';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { resetPassword } from '@/api/Auth';

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const resetPasswordSchema = z.object({
    password: z.string().min(8, t('register.passwordMinLength')),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('register.passwordsDontMatch'),
    path: ["confirmPassword"],
  });

  type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
    if (!token)
      return;

    setIsLoading(true);
    try {
      await resetPassword({
        token: token,
        password: data.password
      });
      navigate('/login');
    } catch (error: any) {
      const data = error.response.data;
      setError(t('error.' + data.err_code));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='w-full max-w-md space-y-4 p-8'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-red-500'>
              {t('resetPassword.invalidToken')}
            </h2>
            <p className='mt-2 text-sm text-muted-foreground'>
              {t('resetPassword.invalidTokenDescription')}
            </p>
          </div>
          <Button asChild className='w-full'>
            <Link to='/forgot-password'>
              {t('resetPassword.requestNewLink')}
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
            {t('resetPassword.title')}
          </h2>
          <p className='mt-2 text-sm text-muted-foreground'>
            {t('resetPassword.description')}
          </p>
        </div>

        <form className='mt-8 space-y-4' onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4'>
            <div>
              <label htmlFor='password' className='block text-sm font-medium'>
                {t('resetPassword.newPassword')}
              </label>
              <input
                {...register('password')}
                type='password'
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder={t('resetPassword.newPasswordPlaceholder')}
              />
              {errors.password && (
                <p className='text-sm text-red-500 mt-1'>{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium'>
                {t('resetPassword.confirmPassword')}
              </label>
              <input
                {...register('confirmPassword')}
                type='password'
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder={t('resetPassword.confirmPasswordPlaceholder')}
              />
              {errors.confirmPassword && (
                <p className='text-sm text-red-500 mt-1'>{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {error && (
            <p className='mt-2 text-sm text-red-500'>
              {error}
            </p>
          )}

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? (
              <>
                {t('common.loading')}
                <Loader2 className='ml-2 h-4 w-4 animate-spin' />
              </>
            ) : (
              t('resetPassword.resetPassword')
            )}
          </Button>
        </form>

        <p className='text-sm text-muted-foreground text-center'>
          <Link to='/login' className='text-primary hover:underline'>
            {t('resetPassword.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}

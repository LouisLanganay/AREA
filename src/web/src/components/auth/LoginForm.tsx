import { useAuth } from '@/auth/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { login as loginApi } from '@/api/Auth';
import { providers } from '@/utils/authProviders';
import { loginResponse } from '@/interfaces/api/Auth';
import { apiError } from '@/interfaces/api/Errors';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { t } = useTranslation();
  const loginSchema = z.object({
    email: z.string().email(t('login.emailInvalid')),
    password: z.string().min(8, t('login.passwordMinLength')),
  });

  type LoginSchema = z.infer<typeof loginSchema>;

  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema)
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    try {
      const response: loginResponse = await loginApi({
        id: data.email,
        password: data.password,
      });
      login(response.access_token);
      onSuccess?.();
    } catch(error: any) {
      const data = error.response.data as apiError;
      setError(t('error.' + data.err_code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-row items-center justify-center gap-2'>
        {providers.map(provider => (
          <Button
            variant='outline'
            size='icon'
            key={provider.name}
            onClick={() => window.location.href = provider.redirect || ''}
          >
            <img
              src={provider.icon}
              alt={provider.name}
              className='h-full max-h-4'
            />
          </Button>
        ))}
      </div>

      <div className='flex flex-row items-center justify-center gap-2'>
        <hr className='flex-1' />
        <span className='text-sm text-muted-foreground'>
          {t('login.or')}
        </span>
        <hr className='flex-1' />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='space-y-4'>
          <div>
            <label htmlFor='email' className='block text-sm font-medium'>
              {t('login.email')}
            </label>
            <input
              {...register('email')}
              type='email'
              className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              placeholder={t('login.emailPlaceholder')}
            />
            {errors.email && (
              <p className='text-sm text-red-500 mt-1'>{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium'>
              {t('login.password')}
            </label>
            <input
              {...register('password')}
              type='password'
              className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              placeholder={t('login.passwordPlaceholder')}
            />
            {errors.password && (
              <p className='text-sm text-red-500 mt-1'>{errors.password.message}</p>
            )}
          </div>
        </div>

        {error && (
          <p className='mt-2 text-sm text-red-500'>
            {error}
          </p>
        )}

        <Button type='submit' className='w-full mt-4' disabled={isLoading}>
          {isLoading ? t('common.loading') : t('login.signIn')}
        </Button>
      </form>
    </div>
  );
}

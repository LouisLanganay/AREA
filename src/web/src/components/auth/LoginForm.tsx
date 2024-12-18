import { login as loginApi } from '@/api/Auth';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOAuth } from '@/hooks/useOAuth';
import { loginResponse } from '@/interfaces/api/Auth';
import { apiError } from '@/interfaces/api/Errors';
import { providers } from '@/utils/authProviders';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { z } from 'zod';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { t } = useTranslation();
  type LoginSchema = z.infer<typeof loginSchema>;
  const loginSchema = z.object({
    email: z.string().email(t('login.emailInvalid')),
    password: z.string().min(8, t('login.passwordMinLength')),
  });
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema)
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { openOAuthUrl } = useOAuth();

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    try {
      const response: loginResponse = await loginApi({
        id: data.email,
        password: data.password,
      });
      await login(response.access_token);
      if (onSuccess) onSuccess();
    } catch(error: any) {
      const data = error.response.data as apiError;
      setError(t('error.' + data.err_code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md space-y-4'>
      <div className='flex flex-row items-center justify-center gap-2'>
        {providers.map(provider => (
          <Button
            variant='outline'
            size='sm'
            key={provider.name}
            onClick={() => openOAuthUrl(provider.redirect, provider.name)}
          >
            <img
              src={provider.icon}
              alt={provider.name}
              className='h-full max-h-4'
            />
            <span>{provider.name}</span>
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
      <form className='mt-8 space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <div className='space-y-4'>
          <div>
            <label htmlFor='email' className='block text-sm font-medium'>
              {t('login.email')}
            </label>
            <Input
              {...register('email')}
              type='email'
              placeholder={t('login.emailPlaceholder')}
            />
            {errors.email && (
              <p className='text-sm text-red-500 mt-1'>{errors.email.message}</p>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label htmlFor='password' className='block text-sm font-medium'>
                {t('login.password')}
              </label>
              <Link
                to='/forgot-password'
                className='text-sm text-primary hover:underline'
              >
                {t('login.forgotPassword')}
              </Link>
            </div>
            <Input
              {...register('password')}
              type='password'
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
        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? t('common.loading') : t('login.signIn')}
        </Button>
      </form>
      <p className='text-sm text-muted-foreground'>
        {t('login.noAccount')} {' '}
        <Link to='/register' className='text-sm font-medium text-primary'>
          {t('login.signUp')}
        </Link>
      </p>
    </div>
  );
}

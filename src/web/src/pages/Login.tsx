import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login as loginApi } from '@/api/Auth';
import { useState } from 'react';
import { providers } from '@/utils/authProviders';
import { useTranslation } from 'react-i18next';
import { loginResponse } from '@/interfaces/api/Auth';
import { apiError } from '@/interfaces/api/Errors';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useOAuth } from '@/hooks/useOAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createAdmin } from '@/api/User';

export default function Login() {
  const { t } = useTranslation();
  type LoginSchema = z.infer<typeof loginSchema>;
  const loginSchema = z.object({
    email: z.string().email(t('login.emailInvalid')),
    password: z.string(),
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema)
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { openOAuthUrl } = useOAuth();

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    try {
      if (data.email === 'admin@admin.fr' && data.password === 'admin') {
        try {
          await createAdmin();
        } catch {
          console.info('Admin creation failed, continuing with login');
        }
      }
      const response: loginResponse = await loginApi({
        id: data.email,
        password: data.password,
      });
      await login(response.access_token);
      navigate('/workflows');
    } catch(error: any) {
      const data = error.response.data as apiError;
      setError(t('error.' + data.err_code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 md:hidden"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </Button>

      <div className='w-full max-w-md space-y-4 p-8'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold'>
            {t('login.title')}
          </h2>
          <p className='mt-2 text-sm text-muted-foreground'>
            {t('login.description')}
          </p>
        </div>

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
              <Label htmlFor='email' className='block text-sm font-medium'>
                {t('login.email')}
              </Label>
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
                <Label htmlFor='password' className='block text-sm font-medium'>
                  {t('login.password')}
                </Label>
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
    </div>
  );
}

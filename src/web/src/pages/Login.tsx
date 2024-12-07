import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { error } from '../../../shared/error/error';
import { login as loginApi } from '@/api/Auth';
import { useState } from 'react';
import { providers } from '@/utils/authProviders';
import { login_response } from '../../../shared/user/login_register_forgot';
import { useTranslation } from 'react-i18next';


export default function Login() {
  const { t } = useTranslation();
  type LoginSchema = z.infer<typeof loginSchema>;
  const loginSchema = z.object({
    email: z.string().email(t('login.emailInvalid')),
    password: z.string().min(8, t('login.passwordMinLength')),
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema)
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    try {
      const response: login_response = await loginApi({
        id: data.email,
        password: data.password,
      });
      login(response.access_token);
      navigate('/');
    } catch(error: any) {
      const data = error.response.data as error;
      setError(t('error.' + data.err_code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center'>
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

        <form className='mt-8 space-y-4' onSubmit={handleSubmit(onSubmit)}>
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

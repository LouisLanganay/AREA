import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { register as registerApi } from '@/api/Auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { providers } from '@/utils/authProviders';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { registerResponse } from '@/interfaces/api/Auth';
import { apiError } from '@/interfaces/api/Errors';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { checkIfUsernameIsAvailable } from '@/api/User';
import { Loader2 } from 'lucide-react';
import { useOAuth } from '@/hooks/useOAuth';
import { Input } from '@/components/ui/input';

export default function Register() {
  const { t } = useTranslation();
  const registerSchema = z.object({
    username: z.string().min(1, t('register.usernameRequired')),
    email: z.string().email(t('register.emailInvalid')),
    password: z.string().min(8, t('register.passwordMinLength')),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('register.passwordsDontMatch'),
    path: ["confirmPassword"],
  });

  type RegisterSchema = z.infer<typeof registerSchema>;
  const { login } = useAuth();
  const { openOAuthUrl } = useOAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);

  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema)
  });

  const handleUsernameChange = async (username: string) => {
    if (!username) {
      setIsUsernameAvailable(null);
      return;
    }

    try {
      const available = await checkIfUsernameIsAvailable(username);
      setIsUsernameAvailable(!available.used);
    } catch(error) {
      console.error("Failed to check if username is available", error);
      setIsUsernameAvailable(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'username') {
        setIsLoading(true);
        if (value.username) {
          handleUsernameChange(value.username);
        } else {
          setIsUsernameAvailable(null);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: RegisterSchema) => {
    setIsLoading(true);
    try {
      const response: registerResponse = await registerApi({
        email: data.email,
        password: data.password,
        username: data.username,
      });

      await login(response.access_token);
      navigate('/workflows');
    } catch(error: any) {
      const data = error.response.data as apiError;
      setError(data.err_code);
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
        aria-label={t('common.back')}
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </Button>

      <div className='w-full max-w-md space-y-3 p-8'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold'>
            {t('register.createAccount')}
          </h2>
          <p className='mt-2 text-sm text-muted-foreground'>
            {t('register.fillInDetails')}
          </p>
        </div>

        <div className='flex flex-row items-center justify-center gap-2'>
          {providers.map(provider => (
            <Button
              variant='outline'
              size='sm'
              key={provider.name}
              onClick={() => openOAuthUrl(provider.redirect, provider.name)}
              aria-label={`Sign in with ${provider.name}`}
            >
              <img
                src={provider.icon}
                alt={`${provider.name} icon`}
                className='h-full max-h-4'
              />
              <span>{provider.name}</span>
            </Button>
          ))}
        </div>

        <div className='flex flex-row items-center justify-center gap-2'>
          <hr className='flex-1' />
          <span className='text-sm text-muted-foreground'>
            {t('register.or')}
          </span>
          <hr className='flex-1' />
        </div>

        <form className='mt-8 space-y-4' onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4'>
            <div>
              <label htmlFor='username' className='block text-sm font-medium'>
                {t('register.username')}
              </label>
              <Input
                {...register('username')}
                placeholder={t('register.usernamePlaceholder')}
              />
              {errors.username && (
                <p className='text-sm text-red-500 mt-1'>{errors.username.message}</p>
              )}
              {isUsernameAvailable === false && (
                <p className='text-sm text-red-500 mt-1'>{t('register.usernameUnavailable')}</p>
              )}
            </div>

            <div>
              <label htmlFor='email' className='block text-sm font-medium'>
                {t('register.email')}
              </label>
              <Input
                {...register('email')}
                type='email'
                placeholder={t('register.emailPlaceholder')}
              />
              {errors.email && (
                <p className='text-sm text-red-500 mt-1'>{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor='password' className='block text-sm font-medium'>
                {t('register.password')}
              </label>
              <Input
                {...register('password')}
                type='password'
                placeholder={t('register.passwordPlaceholder')}
              />
              {errors.password && (
                <p className='text-sm text-red-500 mt-1'>{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium'>
                {t('register.confirmPassword')}
              </label>
              <Input
                {...register('confirmPassword')}
                type='password'
                placeholder={t('register.confirmPasswordPlaceholder')}
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

          <Button
            type='submit'
            className='w-full py-2'
            disabled={isLoading || isUsernameAvailable === false}
          >
            {t('register.createAccount')}
            {isLoading && <Loader2 className='size-4 animate-spin' />}
          </Button>
        </form>
        <p className='text-sm text-muted-foreground'>
          {t('register.alreadyHaveAccount')}{' '}
          <Link to='/login' className='text-sm font-medium text-primary px-2 py-1 hover:underline'>
            {t('register.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}

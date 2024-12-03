import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import GoogleIcon from '@/assets/google-icon.svg';
import GitHubIcon from '@/assets/github-icon.svg';
import DiscordIcon from '@/assets/discord-icon.svg';
import AppleIcon from '@/assets/apple-icon.svg';
import { useAuth } from '@/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login_response } from '../../../shared/user/login_register_forgot';
import { login as loginApi } from '@/api/Auth';
import { useState } from 'react';

const providers = [
  {
    name: 'Google',
    icon: GoogleIcon
  },
  {
    name: 'GitHub',
    icon: GitHubIcon
  },
  {
    name: 'Discord',
    icon: DiscordIcon
  },
  {
    name: 'Apple',
    icon: AppleIcon
  }
];

// Define the login schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema)
  });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LoginSchema) => {
    try {
      const response: login_response = await loginApi({
        id: data.email,
        password: data.password,
      });
      login(response.access_token);
      navigate('/');
    } catch {
      setError('Failed to login');
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md space-y-4 p-8'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold'>Sign in to your account</h2>
          <p className='mt-2 text-sm text-muted-foreground'>
            Enter your credentials below to login
          </p>
        </div>

        <div className='flex flex-row items-center justify-center gap-2'>
          {providers.map(provider => (
            <Button variant='outline' size='icon'>
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
          <span className='text-sm text-muted-foreground'>OR</span>
          <hr className='flex-1' />
        </div>

        <form className='mt-8 space-y-4' onSubmit={handleSubmit(onSubmit)}>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className='space-y-4'>
            <div>
              <label htmlFor='email' className='block text-sm font-medium'>
                Email address
              </label>
              <input
                {...register('email')}
                type='email'
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder='Enter your email'
              />
              {errors.email && (
                <p className='text-sm text-red-500 mt-1'>{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor='password' className='block text-sm font-medium'>
                Password
              </label>
              <input
                {...register('password')}
                type='password'
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder='Enter your password'
              />
              {errors.password && (
                <p className='text-sm text-red-500 mt-1'>{errors.password.message}</p>
              )}
            </div>
          </div>

          <Button type='submit' className='w-full'>
            Sign in
          </Button>
        </form>
        <p className='text-sm text-muted-foreground'>
          Don't have an account?{' '}
          <Link to='/register' className='text-sm font-medium text-primary'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

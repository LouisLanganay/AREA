import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import GoogleIcon from '@/assets/google-icon.svg';
import GitHubIcon from '@/assets/github-icon.svg';
import DiscordIcon from '@/assets/discord-icon.svg';
import AppleIcon from '@/assets/apple-icon.svg';
import { register } from '@/api/Auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { register_response } from '../../../shared/user/login_register_forgot';
import { useAuth } from '@/auth/AuthContext';

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

// Add schema definition at the top level
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      const data: register_response = await register({
        email: values.email,
        password: values.password,
        username: values.username
      });
      login(data.access_token);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md space-y-3 p-8'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold'>Create an account</h2>
          <p className='mt-2 text-sm text-muted-foreground'>
            Fill in your details to create your account
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

        <form className='mt-8 space-y-4' onSubmit={form.handleSubmit(handleSubmit)}>
          <div className='space-y-4'>
            <div>
              <label htmlFor='username' className='block text-sm font-medium'>
                Username
              </label>
              <input
                {...form.register('username')}
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder='Enter your username'
              />
              {form.formState.errors.username && (
                <p className='text-sm text-red-500 mt-1'>{form.formState.errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor='email' className='block text-sm font-medium'>
                Email address
              </label>
              <input
                {...form.register('email')}
                type='email'
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder='Enter your email'
              />
              {form.formState.errors.email && (
                <p className='text-sm text-red-500 mt-1'>{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor='password' className='block text-sm font-medium'>
                Password
              </label>
              <input
                {...form.register('password')}
                type='password'
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder='Enter your password'
              />
              {form.formState.errors.password && (
                <p className='text-sm text-red-500 mt-1'>{form.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium'>
                Confirm Password
              </label>
              <input
                {...form.register('confirmPassword')}
                type='password'
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder='Confirm your password'
              />
              {form.formState.errors.confirmPassword && (
                <p className='text-sm text-red-500 mt-1'>{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Button type='submit' className='w-full'>
            Create account
          </Button>
        </form>
        <p className='text-sm text-muted-foreground'>
          Already have an account?{' '}
          <Link to='/login' className='text-sm font-medium text-primary'>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

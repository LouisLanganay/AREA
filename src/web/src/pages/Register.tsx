import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import GoogleIcon from '@/assets/google-icon.svg';
import GitHubIcon from '@/assets/github-icon.svg';
import DiscordIcon from '@/assets/discord-icon.svg';
import AppleIcon from '@/assets/apple-icon.svg';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { register as registerApi } from '@/api/Auth';
import { useNavigate } from 'react-router-dom';
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

const registerSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterSchema = z.infer<typeof registerSchema>;

export default function Register() {
  const { login } = useAuth();

  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      const response: register_response = await registerApi({
        email: data.email,
        password: data.password,
        username: data.username,
      });

      login(response.access_token);

      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
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

        <form className='mt-8 space-y-4' onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4'>
            <div>
              <label htmlFor='username' className='block text-sm font-medium'>
                Username
              </label>
              <input
                {...register('username')}
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder='Enter your username'
              />
              {errors.username && (
                <p className='text-sm text-red-500 mt-1'>{errors.username.message}</p>
              )}
            </div>

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

            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium'>
                Confirm Password
              </label>
              <input
                {...register('confirmPassword')}
                type='password'
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder='Confirm your password'
              />
              {errors.confirmPassword && (
                <p className='text-sm text-red-500 mt-1'>{errors.confirmPassword.message}</p>
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

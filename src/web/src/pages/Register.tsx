import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import GoogleIcon from '@/assets/google-icon.svg'
import GitHubIcon from '@/assets/github-icon.svg'
import DiscordIcon from '@/assets/discord-icon.svg'
import AppleIcon from '@/assets/apple-icon.svg'

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
]

export default function Register() {
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

        <form className='mt-8 space-y-4'>
          <div className='space-y-4'>
            <div>
              <label htmlFor='username' className='block text-sm font-medium'>
                Username
              </label>
              <input
                id='username'
                name='username'
                type='text'
                required
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder='Enter your username'
              />
            </div>

            <div>
              <label htmlFor='email' className='block text-sm font-medium'>
                Email address
              </label>
              <input
                id='email'
                name='email'
                type='email'
                required
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder='Enter your email'
              />
            </div>

            <div>
              <label htmlFor='password' className='block text-sm font-medium'>
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                required
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder='Enter your password'
              />
            </div>

            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium'>
                Confirm Password
              </label>
              <input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                required
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder='Confirm your password'
              />
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
  )
}
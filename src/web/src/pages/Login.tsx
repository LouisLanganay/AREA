import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import GoogleIcon from '@/assets/google-icon.svg'
import GitHubIcon from '@/assets/github-icon.svg'
import DiscordIcon from '@/assets/discord-icon.svg'
import AppleIcon from '@/assets/apple-icon.svg'
import { useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { loginUser } from '@/auth/authService'
import { useNavigate } from 'react-router-dom'

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

export default function Login() {
  const [email, setEmail] = useState('test@test.com')
  const [password, setPassword] = useState('test')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await loginUser()
      login(token)
      navigate('/')
    } catch (err) {
      setError('Failed to login')
    }
  }

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

        <form className='mt-8 space-y-4' onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className='space-y-4'>
            <div>
              <label htmlFor='email' className='block text-sm font-medium'>
                Email address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id='password'
                name='password'
                type='password'
                required
                className='mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder='Enter your password'
              />
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
  )
}
import GoogleIcon from '@/assets/google-icon.svg';
import DiscordIcon from '@/assets/discord-icon.svg';

export const providers = [
  {
    name: 'Google',
    icon: GoogleIcon,
    redirect: `${import.meta.env.VITE_API_URL}/auth/google`
  },
  {
    name: 'Discord',
    icon: DiscordIcon,
    redirect: `${import.meta.env.VITE_API_URL}/auth/discord`
  }
];

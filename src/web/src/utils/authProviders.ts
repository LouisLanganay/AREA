import GoogleIcon from '@/assets/google-icon.svg';
import DiscordIcon from '@/assets/discord-icon.svg';
import { isPlatform } from '@ionic/react';

const getRedirectUri = (provider: string) => {
  if (isPlatform('capacitor')) {
    return `com.your.app://${provider}/callback`;
  }
  return `${window.location.origin}/${provider}/callback`;
};

export const providers = [
  {
    name: 'Google',
    icon: GoogleIcon,
    redirect: `${import.meta.env.VITE_API_URL}/auth/google?redirect_uri=${getRedirectUri('google')}`
  },
  {
    name: 'Discord',
    icon: DiscordIcon,
    redirect: `${import.meta.env.VITE_API_URL}/auth/discord?redirect_uri=${getRedirectUri('discord')}`
  }
];

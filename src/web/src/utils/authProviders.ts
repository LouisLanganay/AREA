import GoogleIcon from '@/assets/google-icon.svg';
import DiscordIcon from '@/assets/discord-icon.svg';
import { isPlatform } from '@ionic/react';

const isMobile = () => {
  if (isPlatform('capacitor')) {
    return true;
  }
  return false;
};

export const providers = [
  {
    name: 'Google',
    icon: GoogleIcon,
    redirect: `${import.meta.env.VITE_API_URL}/auth/google?isMobile=${isMobile()}`
  },
  {
    name: 'Discord',
    icon: DiscordIcon,
    redirect: `${import.meta.env.VITE_API_URL}/auth/discord?isMobile=${isMobile()}`
  }
];

import GoogleIcon from '@/assets/google-icon.svg';
import DiscordIcon from '@/assets/discord-icon.svg';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;

export const getGoogleOAuthUrl = () => {
  const redirectUri = `${window.location.origin}/login-success`;

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.append('client_id', GOOGLE_CLIENT_ID);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', 'email profile');
  url.searchParams.append('prompt', 'select_account');

  return url.toString();
};

export const getDiscordOAuthUrl = () => {
  const redirectUri = `${window.location.origin}/login-success`;

  const url = new URL('https://discord.com/oauth2/authorize');
  url.searchParams.append('client_id', DISCORD_CLIENT_ID);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', 'identify email');

  return url.toString();
};

export const providers: { name: string; icon: string; redirect: string }[] = [
  {
    name: 'Google',
    icon: GoogleIcon,
    redirect: getGoogleOAuthUrl()
  },
  {
    name: 'Discord',
    icon: DiscordIcon,
    redirect: getDiscordOAuthUrl()
  }
];

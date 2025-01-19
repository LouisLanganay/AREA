import GoogleIcon from '@/assets/google-icon.svg';
import DiscordIcon from '@/assets/discord-icon.svg';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;

/**
 * Generates the OAuth URL for Google authentication
 * @returns {string} The complete Google OAuth URL
 */
export const getGoogleOAuthUrl = () => {
  // Get the current origin for the redirect URI
  const redirectUri = `${window.location.origin}/login-success`;

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.append('client_id', GOOGLE_CLIENT_ID);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', 'email profile'); // Request access to user's email and profile
  url.searchParams.append('prompt', 'select_account'); // Force account selection

  return url.toString();
};

/**
 * Generates the OAuth URL for Discord authentication
 * @returns {string} The complete Discord OAuth URL
 */
export const getDiscordOAuthUrl = () => {
  // Get the current origin for the redirect URI
  const redirectUri = `${window.location.origin}/login-success`;

  const url = new URL('https://discord.com/oauth2/authorize');
  url.searchParams.append('client_id', DISCORD_CLIENT_ID);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', 'identify email'); // Request access to user's identity and email

  return url.toString();
};

/**
 * Array of available authentication providers with their configurations
 * @type {Array<{name: string, icon: string, redirect: string}>}
 */
export const providers = [
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

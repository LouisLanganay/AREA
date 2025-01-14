// Discord client ID from environment variables
const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;

/**
 * Generates the OAuth URL for Discord bot integration
 * @returns {string} The complete Discord OAuth URL for bot installation
 */
export const getDiscordOAuthUrl = () => {
  // Get the current origin for the redirect URI
  const redirectUri = `${window.location.origin}/services`;

  const url = new URL('https://discord.com/oauth2/authorize');
  url.searchParams.append('client_id', DISCORD_CLIENT_ID);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('permissions', '8');              // Administrator permissions
  url.searchParams.append('integration_type', '0');         // Server installation
  url.searchParams.append('scope', 'bot applications.commands identify email'); // Required bot permissions

  return url.toString();
};

/**
 * Array of available service providers with their configurations
 * @type {Array<{id: string, redirect: string}>}
 */
export const servicesProviders = [
  {
    id: 'discord',
    redirect: getDiscordOAuthUrl()
  }
];

/**
 * Finds a service provider by its ID
 * @param {string} id - The ID of the service provider to find
 * @returns {Object|undefined} The service provider object if found, undefined otherwise
 */
export const getServiceProvider = (id: string) => {
  return servicesProviders.find(provider => provider.id === id);
};

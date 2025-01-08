const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;

export const getDiscordOAuthUrl = () => {
  const redirectUri = `${window.location.origin}/services`;

  const url = new URL('https://discord.com/oauth2/authorize');
  url.searchParams.append('client_id', DISCORD_CLIENT_ID);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('permissions', '8');
  url.searchParams.append('integration_type', '0');
  url.searchParams.append('scope', 'bot applications.commands identify email');

  return url.toString();
};

export const servicesProviders: { id: string; redirect: string }[] = [
  {
    id: 'discord',
    redirect: getDiscordOAuthUrl()
  }
];

export const getServiceProvider = (id: string) => {
  return servicesProviders.find(provider => provider.id === id);
};

import { Browser } from '@capacitor/browser';
import { isPlatform } from '@ionic/react';
import { useAuth } from '@/context/AuthContext';
import { App } from '@capacitor/app';
import Cookies from 'js-cookie';

export const useOAuth = () => {
  const { login } = useAuth();

  const openOAuthUrl = async (url: string, provider: string) => {
    Cookies.set('oauth_provider', provider, { expires: 1/288 });

    if (isPlatform('capacitor')) {
      App.addListener('appUrlOpen', async ({ url: redirectUrl }) => {
        if (redirectUrl.includes('login-success')) {
          await Browser.close();

          const urlObj = new URL(redirectUrl);
          const token = urlObj.searchParams.get('token');

          if (token) {
            await login(token);
          }

          Cookies.remove('oauth_provider');
          window.location.href = '/workflows';
        }
      });

      await Browser.open({
        url,
        windowName: '_self',
        presentationStyle: 'popover'
      });
    } else {
      window.location.href = url;
    }
  };

  const openServiceOAuthUrl = async (url: string, serviceId: string) => {
    Cookies.set('service_oauth_provider', serviceId, { expires: 1/288 });

    if (isPlatform('capacitor')) {
      App.addListener('appUrlOpen', async ({ url: redirectUrl }) => {
        if (redirectUrl.includes('services')) {
          await Browser.close();

          //const urlObj = new URL(redirectUrl);
          //const token = urlObj.searchParams.get('code');

          // TODO: Call the API to get the token

          Cookies.remove('service_oauth_provider');
        }
      });

      await Browser.open({
        url,
        windowName: '_self',
        presentationStyle: 'popover'
      });
    } else {
      window.location.href = url;
    }
  };

  return { openOAuthUrl, openServiceOAuthUrl };
};

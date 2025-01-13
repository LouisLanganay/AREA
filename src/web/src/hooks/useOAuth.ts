import { Browser } from '@capacitor/browser';
import { isPlatform } from '@ionic/react';
import { App } from '@capacitor/app';
import Cookies from 'js-cookie';

export const useOAuth = () => {
  const openOAuthUrl = async (url: string, provider: string) => {
    Cookies.set('oauth_provider', provider, { expires: 1/288 });

    if (isPlatform('capacitor')) {
      App.addListener('appUrlOpen', async ({ url: redirectUrl }) => {
        if (redirectUrl.includes('login-success')) {
          await Browser.close();
          window.location.href = redirectUrl;
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

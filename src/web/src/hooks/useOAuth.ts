import { Browser } from '@capacitor/browser';
import { isPlatform } from '@ionic/react';
import { useAuth } from '@/auth/AuthContext';
import { App } from '@capacitor/app';

export const useOAuth = () => {
  const { login } = useAuth();

  const openOAuthUrl = async (url: string) => {
    if (isPlatform('capacitor')) {
      App.addListener('appUrlOpen', async ({ url: redirectUrl }) => {
        if (redirectUrl.includes('login-success')) {
          await Browser.close();

          const urlObj = new URL(redirectUrl);
          const token = urlObj.searchParams.get('token');

          if (token) {
            login(token);
          }
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

  return { openOAuthUrl };
};

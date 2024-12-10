import { Browser } from '@capacitor/browser';
import { isPlatform } from '@ionic/react';

export const useOAuth = () => {
  const openOAuthUrl = async (url: string) => {
    if (isPlatform('capacitor')) {
      await Browser.open({
        url,
        windowName: '_self',
        presentationStyle: 'popover'
      });

      Browser.addListener('browserFinished', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('access_token');
        if (token) {
          window.location.href = '/';
        }
      });
    } else {
      window.location.href = url;
    }
  };

  return { openOAuthUrl };
};

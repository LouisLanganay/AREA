import { Browser } from '@capacitor/browser';
import { isPlatform } from '@ionic/react';
import { App } from '@capacitor/app';
import Cookies from 'js-cookie';

/**
 * Hook for handling OAuth authentication flows
 * Supports both web and mobile (Capacitor) platforms
 */
export const useOAuth = () => {
  /**
   * Opens OAuth authentication URL and handles the redirect flow
   * @param url - OAuth provider's authorization URL
   * @param provider - Name of the OAuth provider (e.g., 'google', 'discord')
   */
  const openOAuthUrl = async (url: string, provider: string) => {
    // Store provider in cookie for 5 minutes (1/288 of a day)
    Cookies.set('oauth_provider', provider, { expires: 1/288 });

    if (isPlatform('capacitor')) {
      // Mobile platform handling
      App.addListener('appUrlOpen', async ({ url: redirectUrl }) => {
        if (redirectUrl.includes('login-success')) {
          // Close in-app browser and redirect to success page
          await Browser.close();
          window.location.href = redirectUrl;
        }
      });

      // Open OAuth URL in in-app browser
      await Browser.open({
        url,
        windowName: '_self',
        presentationStyle: 'popover'
      });
    } else {
      // Web platform handling - direct redirect
      window.location.href = url;
    }
  };

  /**
   * Opens OAuth URL for service integration (e.g., Discord bot)
   * @param url - Service OAuth URL
   * @param serviceId - Identifier for the service
   */
  const openServiceOAuthUrl = async (url: string, serviceId: string) => {
    // Store service ID in cookie for 5 minutes
    Cookies.set('service_oauth_provider', serviceId, { expires: 1/288 });

    if (isPlatform('capacitor')) {
      // Mobile platform handling
      App.addListener('appUrlOpen', async ({ url: redirectUrl }) => {
        if (redirectUrl.includes('services')) {
          // Close browser and clean up cookie on completion
          await Browser.close();
          Cookies.remove('service_oauth_provider');
        }
      });

      // Open service OAuth URL in in-app browser
      await Browser.open({
        url,
        windowName: '_self',
        presentationStyle: 'popover'
      });
    } else {
      // Web platform handling - direct redirect
      window.location.href = url;
    }
  };

  return { openOAuthUrl, openServiceOAuthUrl };
};

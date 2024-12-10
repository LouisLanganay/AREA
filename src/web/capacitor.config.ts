import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.your.app',
  appName: 'Your App',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'http://localhost:8080',
      'accounts.google.com',
      'discord.com'
    ]
  },
  plugins: {
    Browser: {
      presentationStyle: 'popover'
    }
  }
};

export default config;

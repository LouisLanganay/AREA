import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.your.app',
  appName: 'LinkIt',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    hostname: 'localhost:8081',
    iosScheme: 'http',
    cleartext: true
  },
  plugins: {
    App: {
      appUrlOpen: {
        domain: 'localhost:8081',
        paths: ['/login-success']
      }
    }
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile'
  },
  android: {
    backgroundColor: '#FFFFFF'
  }
};

export default config;

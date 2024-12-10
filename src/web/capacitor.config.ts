import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.votreapp.id',
  appName: 'Votre App',
  webDir: 'dist',
  server: {
    androidScheme: 'myapp'
  },
  plugins: {
    App: {
      // Définir les URL schemes que votre app peut gérer
      appUrlScheme: 'myapp'
    }
  }
};

export default config;

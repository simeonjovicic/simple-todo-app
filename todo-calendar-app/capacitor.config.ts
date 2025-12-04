import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.todocalendar.app',
  appName: 'Todo Calendar',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

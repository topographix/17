import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.redvelvet.aicompanion',
  appName: 'RedVelvet',
  webDir: 'dist',
  // Remove server config to use local files
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#E91E63"
    }
  }
};

export default config;

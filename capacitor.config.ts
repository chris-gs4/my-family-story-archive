import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mabel.app',
  appName: 'Mabel',
  webDir: 'out',
  server: {
    // In production, point to your deployed Vercel URL:
    // url: 'https://your-app.vercel.app',
    //
    // For local development, use your machine's local IP:
    url: 'http://192.168.0.139:3000',
    //
    // When server.url is set, the app loads from the remote server
    // instead of the local webDir. This preserves SSR, API routes,
    // and server actions.
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#FFFBF0',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#FFFBF0',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
};

export default config;

import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Configuração do Capacitor
 * Define as configurações da aplicação nativa
 * 
 * Configurações incluídas:
 * - ScreenOrientation: Bloqueia orientação para portrait
 * - StatusBar: Configurada para tema dark
 * - Keyboard: Configurado para melhor UX
 */
const config: CapacitorConfig = {
  appId: 'io.ionic.gestao-tarefas',
  appName: 'Gestão de Tarefas',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    ScreenOrientation: {
      orientation: 'portrait'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#222428'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#222428',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  }
};

export default config;

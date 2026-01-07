import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Configuração do Capacitor
 * Define as configurações da aplicação nativa
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
    }
  }
};

export default config;

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ScreenOrientation, OrientationLockOptions } from '@capacitor/screen-orientation';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { DataInitService } from './services/data-init.service';
import { DatabaseService } from './services/database.service';
import { StringService } from './services/string.service';
import { NotificacaoService } from './services/notificacao.service';
import { TarefaService } from './services/tarefa.service';
import { ConfigService } from './services/config.service';

/**
 * Componente principal da aplicação
 * Responsável pela inicialização e configuração global
 * Gerencia controlos do dispositivo através do Capacitor
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  private orientationListener: any;

  constructor(
    private platform: Platform,
    private storage: Storage,
    private databaseService: DatabaseService,
    private dataInitService: DataInitService,
    private stringService: StringService,
    private notificacaoService: NotificacaoService,
    private tarefaService: TarefaService,
    private configService: ConfigService
  ) {}

  /**
   * Inicializa a aplicação
   * Configura Storage, controla orientação do dispositivo e inicializa dados
   */
  async ngOnInit() {
    // Aguarda a plataforma estar pronta
    await this.platform.ready();

    // Inicializa o Ionic Storage
    await this.storage.create();

    // Inicializa DatabaseService (SQLite em nativo, Storage no browser)
    await this.databaseService.initialize();

    // Carrega strings da aplicação
    await this.stringService.loadStrings();

    // Inicializa configurações
    await this.configService.initialize();

    // Inicializa dados (carrega dados iniciais do JSON se necessário)
    await this.dataInitService.initialize();

    // Configura controlos do dispositivo apenas em plataformas nativas
    if (Capacitor.isNativePlatform()) {
      await this.configurarControlosDispositivo();
      
      // Inicializa notificações para todas as tarefas pendentes
      await this.inicializarNotificacoes();
    }
  }

  /**
   * Configura todos os controlos do dispositivo
   * Inclui: orientação, status bar, keyboard
   */
  private async configurarControlosDispositivo() {
    try {
      // 1. Configura Status Bar
      await this.configurarStatusBar();

      // 2. Bloqueia orientação para portrait
      await this.configurarOrientacao();

      // 3. Configura Keyboard
      await this.configurarKeyboard();

      // 4. Listener para mudanças de orientação
      this.configurarListenerOrientacao();

      // 5. Listener para quando a app volta ao foreground
      this.configurarListenerAppState();

      console.log('Controlos do dispositivo configurados com sucesso');
    } catch (error) {
      console.warn('Erro ao configurar controlos do dispositivo:', error);
    }
  }

  /**
   * Configura a Status Bar
   * Define estilo escuro para combinar com o tema dark
   */
  private async configurarStatusBar() {
    try {
      if (Capacitor.isPluginAvailable('StatusBar')) {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#222428' }); // Cor dark
        console.log('Status Bar configurada');
      }
    } catch (error) {
      console.warn('Erro ao configurar Status Bar:', error);
    }
  }

  /**
   * Configura e bloqueia a orientação para portrait
   * Impede que a aplicação seja visualizada em landscape
   */
  private async configurarOrientacao() {
    try {
      if (Capacitor.isPluginAvailable('ScreenOrientation')) {
        const options: OrientationLockOptions = { orientation: 'portrait' };
        await ScreenOrientation.lock(options);
        console.log('Orientação bloqueada para portrait');
      }
    } catch (error) {
      console.warn('Erro ao bloquear orientação:', error);
    }
  }

  /**
   * Configura listener para mudanças de orientação
   * Garante que a orientação sempre volte para portrait se mudar
   */
  private configurarListenerOrientacao() {
    try {
      if (Capacitor.isPluginAvailable('ScreenOrientation')) {
        this.orientationListener = ScreenOrientation.addListener('screenOrientationChange', async (orientation) => {
          console.log('Orientação mudou para:', orientation.type);
          
          // Se a orientação mudou para landscape, força portrait novamente
          if (orientation.type.includes('landscape')) {
            try {
              await ScreenOrientation.lock({ orientation: 'portrait' });
              console.log('Orientação forçada de volta para portrait');
            } catch (error) {
              console.warn('Erro ao forçar orientação portrait:', error);
            }
          }
        });
      }
    } catch (error) {
      console.warn('Erro ao configurar listener de orientação:', error);
    }
  }

  /**
   * Configura o Keyboard
   * Define comportamento do teclado virtual
   */
  private async configurarKeyboard() {
    try {
      if (Capacitor.isPluginAvailable('Keyboard')) {
        // O teclado fecha automaticamente ao fazer scroll (comportamento padrão)
        // Pode adicionar mais configurações aqui se necessário
        Keyboard.setAccessoryBarVisible({ isVisible: false });
        console.log('Keyboard configurado');
      }
    } catch (error) {
      console.warn('Erro ao configurar Keyboard:', error);
    }
  }

  /**
   * Configura listener para mudanças de estado da aplicação
   * Quando a app volta ao foreground, verifica e força orientação portrait
   */
  private configurarListenerAppState() {
    try {
      if (Capacitor.isPluginAvailable('App')) {
        App.addListener('appStateChange', async ({ isActive }) => {
          if (isActive) {
            // Quando a app volta ao foreground, garante orientação portrait
            try {
              await this.configurarOrientacao();
            } catch (error) {
              console.warn('Erro ao reconfigurar orientação:', error);
            }
          }
        });
      }
    } catch (error) {
      console.warn('Erro ao configurar listener de app state:', error);
    }
  }

  /**
   * Inicializa notificações para todas as tarefas pendentes
   */
  private async inicializarNotificacoes() {
    try {
      // Verifica permissão
      const temPermissao = await this.notificacaoService.verificarPermissao();
      if (!temPermissao) {
        console.log('Permissão de notificações não concedida');
        return;
      }

      // Obtém todas as tarefas e agenda notificações
      const tarefas = await this.tarefaService.getAll();
      await this.notificacaoService.agendarNotificacoesTodasTarefas(tarefas);
      console.log('Notificações inicializadas');
    } catch (error) {
      console.warn('Erro ao inicializar notificações:', error);
    }
  }

  /**
   * Limpa listeners ao destruir o componente
   */
  ngOnDestroy() {
    if (this.orientationListener) {
      this.orientationListener.remove();
    }
  }
}

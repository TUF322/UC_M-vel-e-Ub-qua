import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';
import { DataInitService } from './services/data-init.service';
import { DatabaseService } from './services/database.service';
import { StringService } from './services/string.service';

/**
 * Componente principal da aplicação
 * Responsável pela inicialização e configuração global
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private storage: Storage,
    private databaseService: DatabaseService,
    private dataInitService: DataInitService,
    private stringService: StringService
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

    // Inicializa dados (carrega dados iniciais do JSON se necessário)
    await this.dataInitService.initialize();

    // Bloqueia orientação landscape apenas em dispositivos nativos
    if (Capacitor.isNativePlatform()) {
      try {
        await ScreenOrientation.lock({ orientation: 'portrait' });
        console.log('Orientação bloqueada para portrait');
      } catch (error) {
        console.warn('Erro ao bloquear orientação:', error);
      }
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { ConfigService, AppConfig } from '../../../services/config.service';
import { StringService } from '../../../services/string.service';

/**
 * Página de Configurações
 * Permite configurar cidade/país para APIs e outras opções
 */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false
})
export class SettingsPage implements OnInit {
  config: AppConfig = {
    weatherCity: 'Lisbon',
    weatherCountry: 'PT',
    holidayCountry: 'PT'
  };
  
  loading = false;
  saving = false;

  // Lista de países comuns (códigos ISO 3166-1 alpha-2)
  paises = [
    { code: 'PT', nome: 'Portugal' },
    { code: 'BR', nome: 'Brasil' },
    { code: 'ES', nome: 'Espanha' },
    { code: 'FR', nome: 'França' },
    { code: 'IT', nome: 'Itália' },
    { code: 'DE', nome: 'Alemanha' },
    { code: 'GB', nome: 'Reino Unido' },
    { code: 'US', nome: 'Estados Unidos' }
  ];

  constructor(
    private configService: ConfigService,
    private stringService: StringService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.carregarConfig();
  }

  /**
   * Recarrega configurações quando a página é exibida
   */
  async ionViewWillEnter() {
    await this.carregarConfig();
  }

  /**
   * Carrega configurações salvas
   */
  async carregarConfig() {
    try {
      this.loading = true;
      this.config = await this.configService.getConfig();
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      await this.mostrarToast('Erro ao carregar configurações', 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Salva as configurações
   */
  async salvar() {
    try {
      this.saving = true;
      
      // Validações
      if (!this.config.weatherCity || this.config.weatherCity.trim() === '') {
        await this.mostrarAlert('Cidade inválida', 'Por favor, insira uma cidade válida.');
        return;
      }

      if (!this.config.weatherCountry || this.config.weatherCountry.length !== 2) {
        await this.mostrarAlert('País inválido', 'Por favor, selecione um país válido.');
        return;
      }

      if (!this.config.holidayCountry || this.config.holidayCountry.length !== 2) {
        await this.mostrarAlert('País inválido', 'Por favor, selecione um país válido para feriados.');
        return;
      }

      // Normaliza valores
      this.config.weatherCity = this.config.weatherCity.trim();
      this.config.weatherCountry = this.config.weatherCountry.toUpperCase();
      this.config.holidayCountry = this.config.holidayCountry.toUpperCase();

      // Salva
      await this.configService.updateConfig(this.config);
      
      await this.mostrarToast('Configurações salvas com sucesso!', 'success');
      
      // Recarrega dados após salvar (para aplicar mudanças)
      await this.carregarConfig();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      await this.mostrarToast('Erro ao salvar configurações', 'danger');
    } finally {
      this.saving = false;
    }
  }

  /**
   * Reseta configurações para valores padrão
   */
  async resetar() {
    const alert = await this.alertController.create({
      header: 'Resetar Configurações',
      message: 'Tem certeza que deseja resetar todas as configurações para os valores padrão?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Resetar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.configService.resetConfig();
              await this.carregarConfig();
              await this.mostrarToast('Configurações resetadas', 'success');
            } catch (error) {
              console.error('Erro ao resetar configurações:', error);
              await this.mostrarToast('Erro ao resetar configurações', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Obtém nome do país pelo código
   */
  getNomePais(codigo: string): string {
    const pais = this.paises.find(p => p.code === codigo);
    return pais ? pais.nome : codigo;
  }

  /**
   * Obtém uma string do StringService
   */
  getString(path: string): string {
    return this.stringService.get(path);
  }

  /**
   * Mostra um toast
   */
  private async mostrarToast(mensagem: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  /**
   * Mostra um alert
   */
  private async mostrarAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}


import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { NotaService } from '../../../services/nota.service';
import { StringService } from '../../../services/string.service';
import { Nota } from '../../../models/nota.model';

/**
 * Página de listagem de notas
 * Permite visualizar, editar e eliminar notas
 */
@Component({
  selector: 'app-nota-list',
  templateUrl: './nota-list.page.html',
  styleUrls: ['./nota-list.page.scss'],
  standalone: false
})
export class NotaListPage implements OnInit {
  notas: Nota[] = [];
  loading = true;

  constructor(
    private notaService: NotaService,
    private stringService: StringService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.carregarNotas();
  }

  /**
   * Recarrega dados quando a página é exibida
   */
  async ionViewWillEnter() {
    await this.carregarNotas();
  }

  /**
   * Carrega todas as notas
   */
  async carregarNotas() {
    try {
      this.loading = true;
      this.notas = await this.notaService.getAll();
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
      await this.mostrarToast('Erro ao carregar notas', 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Navega para a página de adicionar nota
   */
  adicionarNota() {
    this.router.navigate(['/notas/nova']);
  }

  /**
   * Navega para a página de detalhes da nota
   */
  verNota(nota: Nota) {
    this.router.navigate(['/notas/detalhes', nota.id]);
  }

  /**
   * Navega para a página de editar nota
   */
  editarNota(nota: Nota) {
    this.router.navigate(['/notas/editar', nota.id]);
  }

  /**
   * Elimina uma nota após confirmação
   */
  async eliminarNota(nota: Nota) {
    const alert = await this.alertController.create({
      header: 'Eliminar Nota',
      message: `Tem certeza que deseja eliminar "${nota.titulo}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.notaService.delete(nota.id);
              await this.mostrarToast('Nota eliminada com sucesso', 'success');
              await this.carregarNotas();
            } catch (error: any) {
              console.error('Erro ao eliminar nota:', error);
              const mensagem = error.message || 'Erro ao eliminar nota';
              await this.mostrarToast(mensagem, 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Recarrega as notas (pull-to-refresh)
   */
  async refresh(event: any) {
    await this.carregarNotas();
    event.target.complete();
  }

  /**
   * Obtém uma string do StringService
   */
  getString(path: string): string {
    return this.stringService.get(path);
  }

  /**
   * Mostra um toast com mensagem
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
   * Obtém preview do conteúdo (primeiras linhas)
   */
  getPreview(nota: Nota): string {
    if (nota.protegida) {
      return '*** Protegida por senha ***';
    }
    const preview = nota.conteudo.substring(0, 100);
    return preview.length < nota.conteudo.length ? preview + '...' : preview;
  }
}


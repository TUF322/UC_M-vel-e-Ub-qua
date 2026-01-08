import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { NotaService } from '../../../services/nota.service';
import { StringService } from '../../../services/string.service';
import { Nota } from '../../../models/nota.model';

/**
 * Página de detalhes da nota
 * Permite visualizar, editar e eliminar notas
 * Suporta desbloqueio por senha
 */
@Component({
  selector: 'app-nota-detail',
  templateUrl: './nota-detail.page.html',
  styleUrls: ['./nota-detail.page.scss'],
  standalone: false
})
export class NotaDetailPage implements OnInit {
  nota: Nota | null = null;
  notaId: string | null = null;
  loading = true;
  desbloqueada = false;
  senhaIncorreta = false;

  constructor(
    private notaService: NotaService,
    private stringService: StringService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.notaId = this.activatedRoute.snapshot.paramMap.get('id');
    
    if (this.notaId) {
      await this.carregarNota();
    } else {
      await this.mostrarToast('ID da nota não fornecido', 'danger');
      this.router.navigate(['/notas']);
    }
  }

  /**
   * Carrega a nota
   */
  async carregarNota() {
    try {
      this.loading = true;
      this.nota = await this.notaService.getById(this.notaId!);
      
      if (!this.nota) {
        await this.mostrarToast('Nota não encontrada', 'danger');
        this.router.navigate(['/notas']);
        return;
      }

      // Se a nota não está protegida, já está desbloqueada
      if (!this.nota.protegida) {
        this.desbloqueada = true;
      } else {
        // Se está protegida, solicita senha automaticamente
        this.loading = false;
        await this.solicitarSenha();
      }
    } catch (error) {
      console.error('Erro ao carregar nota:', error);
      await this.mostrarToast('Erro ao carregar nota', 'danger');
      this.router.navigate(['/notas']);
    } finally {
      if (!this.nota?.protegida) {
        this.loading = false;
      }
    }
  }

  /**
   * Solicita senha para desbloquear nota protegida
   */
  async solicitarSenha() {
    const alert = await this.alertController.create({
      header: 'Nota Protegida',
      message: 'Esta nota está protegida por senha. Digite a senha para visualizar:',
      inputs: [
        {
          name: 'senha',
          type: 'password',
          placeholder: 'Senha',
          attributes: {
            required: true
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            // Se cancelar, volta para a lista
            this.router.navigate(['/notas']);
          }
        },
        {
          text: 'Desbloquear',
          handler: async (data) => {
            if (!data.senha || data.senha.trim().length === 0) {
              await this.mostrarToast('A senha é obrigatória', 'warning');
              return false;
            }
            await this.desbloquearNota(data.senha);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Desbloqueia a nota com a senha fornecida
   */
  async desbloquearNota(senha: string) {
    if (!this.nota || !this.nota.protegida || !this.nota.senhaHash) {
      return;
    }

    try {
      this.loading = true;
      const notaDesbloqueada = await this.notaService.desbloquearNota(this.nota.id, senha);
      
      if (notaDesbloqueada) {
        this.nota = notaDesbloqueada;
        this.desbloqueada = true;
        this.senhaIncorreta = false;
        this.loading = false;
        await this.mostrarToast('Nota desbloqueada', 'success');
      } else {
        this.senhaIncorreta = true;
        this.loading = false;
        await this.mostrarToast('Senha incorreta', 'danger');
        // Solicita senha novamente
        await this.solicitarSenha();
      }
    } catch (error) {
      console.error('Erro ao desbloquear nota:', error);
      this.loading = false;
      await this.mostrarToast('Erro ao desbloquear nota', 'danger');
    }
  }

  /**
   * Navega para a página de editar nota
   */
  editarNota() {
    if (this.notaId) {
      this.router.navigate(['/notas/editar', this.notaId]);
    }
  }

  /**
   * Elimina a nota após confirmação
   */
  async eliminarNota() {
    const alert = await this.alertController.create({
      header: 'Eliminar Nota',
      message: `Tem certeza que deseja eliminar "${this.nota?.titulo}"? Esta ação não pode ser desfeita.`,
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
              await this.notaService.delete(this.notaId!);
              await this.mostrarToast('Nota eliminada com sucesso', 'success');
              this.router.navigate(['/notas']);
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
}


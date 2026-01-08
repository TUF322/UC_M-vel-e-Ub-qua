import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { NotaService } from '../../../services/nota.service';
import { StringService } from '../../../services/string.service';
import { Nota, NotaCreate } from '../../../models/nota.model';

/**
 * Página de formulário para adicionar/editar nota
 */
@Component({
  selector: 'app-nota-form',
  templateUrl: './nota-form.page.html',
  styleUrls: ['./nota-form.page.scss'],
  standalone: false
})
export class NotaFormPage implements OnInit {
  nota: NotaCreate = {
    titulo: '',
    conteudo: '',
    protegida: false
  };
  
  notaId: string | null = null;
  isEditMode = false;
  loading = false;
  senha: string = '';
  confirmarSenha: string = '';
  mostrarSenha = false;

  constructor(
    private notaService: NotaService,
    private stringService: StringService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    this.notaId = this.activatedRoute.snapshot.paramMap.get('id');
    
    if (this.notaId) {
      this.isEditMode = true;
      await this.carregarNota();
    }
  }

  /**
   * Carrega a nota para edição
   */
  async carregarNota() {
    try {
      this.loading = true;
      const nota = await this.notaService.getById(this.notaId!);
      
      if (nota) {
        this.nota = {
          titulo: nota.titulo,
          conteudo: nota.conteudo,
          protegida: nota.protegida
        };
        this.mostrarSenha = nota.protegida;
      } else {
        await this.mostrarToast('Nota não encontrada', 'danger');
        this.router.navigate(['/notas']);
      }
    } catch (error) {
      console.error('Erro ao carregar nota:', error);
      await this.mostrarToast('Erro ao carregar nota', 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Valida o formulário
   */
  validarFormulario(): boolean {
    if (!this.nota.titulo || this.nota.titulo.trim() === '') {
      this.mostrarToast('O título é obrigatório', 'warning');
      return false;
    }

    if (!this.nota.conteudo || this.nota.conteudo.trim() === '') {
      this.mostrarToast('O conteúdo é obrigatório', 'warning');
      return false;
    }

    if (this.mostrarSenha) {
      if (this.senha && this.senha.trim().length > 0) {
        if (this.senha !== this.confirmarSenha) {
          this.mostrarToast('As senhas não coincidem', 'warning');
          return false;
        }
        if (this.senha.length < 4) {
          this.mostrarToast('A senha deve ter pelo menos 4 caracteres', 'warning');
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Salva a nota
   */
  async salvar() {
    if (!this.validarFormulario()) {
      return;
    }

    try {
      this.loading = true;

      if (this.isEditMode) {
        // Atualiza nota existente
        const senhaParaSalvar = this.mostrarSenha && this.senha.trim().length > 0 ? this.senha : undefined;
        await this.notaService.update(this.notaId!, this.nota, senhaParaSalvar);
        await this.mostrarToast('Nota atualizada com sucesso', 'success');
      } else {
        // Cria nova nota
        const senhaParaSalvar = this.mostrarSenha && this.senha.trim().length > 0 ? this.senha : undefined;
        await this.notaService.create(this.nota, senhaParaSalvar);
        await this.mostrarToast('Nota criada com sucesso', 'success');
      }

      this.router.navigate(['/notas']);
    } catch (error: any) {
      console.error('Erro ao salvar nota:', error);
      const mensagem = error.message || 'Erro ao salvar nota';
      await this.mostrarToast(mensagem, 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Cancela e volta para a lista
   */
  cancelar() {
    this.router.navigate(['/notas']);
  }

  /**
   * Alterna a proteção por senha
   */
  async toggleProtecao(event: any) {
    const novoEstado = event.detail.checked;
    
    // Se está ativando a proteção, mostra popup para pedir senha
    if (novoEstado && !this.mostrarSenha) {
      // Reverte o toggle temporariamente
      this.mostrarSenha = false;
      
      // Mostra popup
      const confirmado = await this.solicitarSenhaProtecao();
      
      // Se não confirmou, o toggle já está revertido
      if (!confirmado) {
        // Força atualização do toggle
        setTimeout(() => {
          const toggle = event.target;
          if (toggle) {
            toggle.checked = false;
          }
        }, 0);
      }
    } else if (!novoEstado && this.mostrarSenha) {
      // Se está desativando, limpa as senhas
      this.mostrarSenha = false;
      this.senha = '';
      this.confirmarSenha = '';
      this.nota.protegida = false;
    }
  }

  /**
   * Solicita senha duas vezes para proteger a nota
   * @returns Promise<boolean> - true se confirmou, false se cancelou
   */
  async solicitarSenhaProtecao(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Proteger Nota',
        message: 'Digite a senha duas vezes para proteger esta nota:',
        inputs: [
          {
            name: 'senha',
            type: 'password',
            placeholder: 'Senha',
            attributes: {
              required: true
            }
          },
          {
            name: 'confirmarSenha',
            type: 'password',
            placeholder: 'Confirmar Senha',
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
              resolve(false);
            }
          },
          {
            text: 'Confirmar',
            handler: async (data) => {
              if (!data.senha || data.senha.trim().length === 0) {
                await this.mostrarToast('A senha é obrigatória', 'warning');
                resolve(false);
                return false;
              }

              if (data.senha.length < 4) {
                await this.mostrarToast('A senha deve ter pelo menos 4 caracteres', 'warning');
                resolve(false);
                return false;
              }

              if (data.senha !== data.confirmarSenha) {
                await this.mostrarToast('As senhas não coincidem', 'warning');
                resolve(false);
                return false;
              }

              // Se tudo estiver correto, ativa a proteção
              this.senha = data.senha;
              this.confirmarSenha = data.confirmarSenha;
              this.mostrarSenha = true;
              this.nota.protegida = true;
              resolve(true);
              return true;
            }
          }
        ]
      });

      await alert.present();
    });
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


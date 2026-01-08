import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController, ActionSheetController } from '@ionic/angular';
import { TarefaService } from '../../../services/tarefa.service';
import { ProjetoService } from '../../../services/projeto.service';
import { StringService } from '../../../services/string.service';
import { Tarefa } from '../../../models/tarefa.model';
import { Projeto } from '../../../models/projeto.model';

/**
 * Página de detalhes da tarefa
 * Exibe todas as informações da tarefa e permite editar/eliminar
 */
@Component({
  selector: 'app-tarefa-detail',
  templateUrl: './tarefa-detail.page.html',
  styleUrls: ['./tarefa-detail.page.scss'],
  standalone: false
})
export class TarefaDetailPage implements OnInit {
  tarefa: Tarefa | null = null;
  projeto: Projeto | null = null;
  loading = true;

  constructor(
    private tarefaService: TarefaService,
    private projetoService: ProjetoService,
    private stringService: StringService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {}

  async ngOnInit() {
    const tarefaId = this.activatedRoute.snapshot.paramMap.get('id');
    if (tarefaId) {
      await this.carregarTarefa(tarefaId);
    }
  }

  /**
   * Carrega a tarefa e o projeto associado
   */
  async carregarTarefa(tarefaId: string) {
    try {
      this.loading = true;
      
      this.tarefa = await this.tarefaService.getById(tarefaId);
      if (!this.tarefa) {
        await this.mostrarToast('Tarefa não encontrada', 'danger');
        this.router.navigate(['/projetos']);
        return;
      }

      // Carrega projeto
      this.projeto = await this.projetoService.getById(this.tarefa.projetoId);
    } catch (error) {
      console.error('Erro ao carregar tarefa:', error);
      await this.mostrarToast(this.getString('mensagens.erro.geral'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Navega para editar tarefa
   */
  editarTarefa() {
    if (this.tarefa) {
      this.router.navigate(['/tarefas/editar', this.tarefa.id]);
    }
  }

  /**
   * Elimina a tarefa após confirmação
   */
  async eliminarTarefa() {
    if (!this.tarefa) return;

    const alert = await this.alertController.create({
      header: this.getString('labels.eliminar'),
      message: this.getString('mensagens.confirmacao.eliminarTarefa'),
      buttons: [
        {
          text: this.getString('labels.cancelar'),
          role: 'cancel'
        },
        {
          text: this.getString('labels.eliminar'),
          role: 'destructive',
          handler: async () => {
            try {
              const projetoId = this.tarefa!.projetoId;
              await this.tarefaService.delete(this.tarefa!.id);
              await this.mostrarToast(this.getString('mensagens.sucesso.eliminado'), 'success');
              this.router.navigate(['/projetos/detalhes', projetoId]);
            } catch (error: any) {
              console.error('Erro ao eliminar tarefa:', error);
              await this.mostrarToast(error.message || this.getString('mensagens.erro.geral'), 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Alterna o estado de conclusão
   */
  async toggleConcluida() {
    if (!this.tarefa) return;

    try {
      await this.tarefaService.toggleConcluida(this.tarefa.id, !this.tarefa.concluida);
      await this.carregarTarefa(this.tarefa.id);
      await this.mostrarToast(
        this.tarefa.concluida ? 'Tarefa marcada como concluída' : 'Tarefa marcada como pendente',
        'success'
      );
    } catch (error) {
      console.error('Erro ao alterar estado:', error);
      await this.mostrarToast(this.getString('mensagens.erro.geral'), 'danger');
    }
  }

  /**
   * Move tarefa para outro projeto
   */
  async moverTarefa() {
    if (!this.tarefa) return;

    const projetos = await this.projetoService.getAll();
    const projetosDisponiveis = projetos.filter(p => p.id !== this.tarefa!.projetoId);

    if (projetosDisponiveis.length === 0) {
      await this.mostrarToast('Não há outros projetos disponíveis', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Mover Tarefa',
      message: 'Selecione o projeto de destino:',
      inputs: projetosDisponiveis.map(proj => ({
        type: 'radio',
        label: proj.nome,
        value: proj.id
      })),
      buttons: [
        {
          text: this.getString('labels.cancelar'),
          role: 'cancel'
        },
        {
          text: 'Mover',
          handler: async (projetoId) => {
            try {
              await this.tarefaService.moverTarefa(this.tarefa!.id, projetoId);
              await this.mostrarToast('Tarefa movida com sucesso', 'success');
              await this.carregarTarefa(this.tarefa!.id);
            } catch (error: any) {
              console.error('Erro ao mover tarefa:', error);
              await this.mostrarToast(error.message || this.getString('mensagens.erro.geral'), 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Verifica se a tarefa está em atraso
   */
  isTarefaAtrasada(): boolean {
    return this.tarefa ? this.tarefaService.isTarefaAtrasada(this.tarefa) : false;
  }

  /**
   * Recarrega os dados
   */
  async refresh(event: any) {
    if (this.tarefa) {
      await this.carregarTarefa(this.tarefa.id);
    }
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
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController, ActionSheetController } from '@ionic/angular';
import { TarefaService } from '../../../services/tarefa.service';
import { ProjetoService } from '../../../services/projeto.service';
import { StringService } from '../../../services/string.service';
import { Tarefa } from '../../../models/tarefa.model';
import { Projeto } from '../../../models/projeto.model';

/**
 * Filtros disponíveis para tarefas
 */
type FiltroTarefa = 'todas' | 'pendentes' | 'concluidas' | 'atrasadas';

/**
 * Página de listagem de tarefas
 * Permite visualizar, filtrar, ordenar e gerenciar tarefas
 */
@Component({
  selector: 'app-tarefa-list',
  templateUrl: './tarefa-list.page.html',
  styleUrls: ['./tarefa-list.page.scss'],
  standalone: false
})
export class TarefaListPage implements OnInit {
  tarefas: Tarefa[] = [];
  tarefasFiltradas: Tarefa[] = [];
  projeto: Projeto | null = null;
  projetoId: string | null = null;
  filtroSelecionado: FiltroTarefa = 'todas';
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
    // Obtém projetoId da rota (se houver)
    this.projetoId = this.activatedRoute.snapshot.paramMap.get('projetoId');
    
    if (this.projetoId) {
      await this.carregarProjeto();
    }
    
    await this.carregarTarefas();
  }

  /**
   * Recarrega dados quando a página é exibida
   */
  async ionViewWillEnter() {
    if (this.projetoId) {
      await this.carregarProjeto();
    }
    await this.carregarTarefas();
  }

  /**
   * Carrega o projeto
   */
  async carregarProjeto() {
    if (this.projetoId) {
      this.projeto = await this.projetoService.getById(this.projetoId);
    }
  }

  /**
   * Carrega todas as tarefas
   */
  async carregarTarefas() {
    try {
      this.loading = true;
      
      if (this.projetoId) {
        // Carrega tarefas do projeto específico
        this.tarefas = await this.tarefaService.getByProjetoId(this.projetoId);
      } else {
        // Carrega todas as tarefas
        this.tarefas = await this.tarefaService.getAll();
      }
      
      this.aplicarFiltro();
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      await this.mostrarToast(this.getString('mensagens.erro.geral'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Aplica o filtro selecionado
   */
  aplicarFiltro() {
    switch (this.filtroSelecionado) {
      case 'pendentes':
        this.tarefasFiltradas = this.tarefas.filter(t => !t.concluida);
        break;
      case 'concluidas':
        this.tarefasFiltradas = this.tarefas.filter(t => t.concluida);
        break;
      case 'atrasadas':
        this.tarefasFiltradas = this.tarefas.filter(t => 
          !t.concluida && this.tarefaService.isTarefaAtrasada(t)
        );
        break;
      default:
        this.tarefasFiltradas = [...this.tarefas];
    }
    
    // Mantém ordenação
    this.tarefasFiltradas.sort((a, b) => a.ordem - b.ordem);
  }

  /**
   * Filtra tarefas
   */
  filtrarTarefas(event: any) {
    this.filtroSelecionado = event.detail.value as FiltroTarefa;
    this.aplicarFiltro();
  }

  /**
   * Navega para adicionar tarefa
   */
  adicionarTarefa() {
    if (this.projetoId) {
      this.router.navigate(['/tarefas/nova', this.projetoId]);
    } else {
      this.router.navigate(['/tarefas/nova']);
    }
  }

  /**
   * Navega para detalhes da tarefa
   */
  verDetalhes(tarefa: Tarefa) {
    this.router.navigate(['/tarefas/detalhes', tarefa.id]);
  }

  /**
   * Navega para editar tarefa
   */
  editarTarefa(tarefa: Tarefa) {
    this.router.navigate(['/tarefas/editar', tarefa.id]);
  }

  /**
   * Elimina uma tarefa após confirmação
   */
  async eliminarTarefa(tarefa: Tarefa) {
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
              await this.tarefaService.delete(tarefa.id);
              await this.mostrarToast(this.getString('mensagens.sucesso.eliminado'), 'success');
              await this.carregarTarefas();
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
   * Mostra menu de ações para a tarefa
   */
  async mostrarAcoes(tarefa: Tarefa) {
    const actionSheet = await this.actionSheetController.create({
      header: tarefa.titulo,
      buttons: [
        {
          text: tarefa.concluida ? 'Marcar como Pendente' : 'Marcar como Concluída',
          icon: tarefa.concluida ? 'refresh' : 'checkmark-circle',
          handler: async () => {
            await this.tarefaService.toggleConcluida(tarefa.id, !tarefa.concluida);
            await this.carregarTarefas();
          }
        },
        {
          text: this.getString('labels.editar'),
          icon: 'create',
          handler: () => {
            this.editarTarefa(tarefa);
          }
        },
        {
          text: 'Mover para Outro Projeto',
          icon: 'swap-horizontal',
          handler: () => {
            this.moverTarefa(tarefa);
          }
        },
        {
          text: this.getString('labels.eliminar'),
          icon: 'trash',
          role: 'destructive',
          handler: () => {
            this.eliminarTarefa(tarefa);
          }
        },
        {
          text: this.getString('labels.cancelar'),
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  /**
   * Move tarefa para outro projeto
   */
  async moverTarefa(tarefa: Tarefa) {
    const projetos = await this.projetoService.getAll();
    const projetosDisponiveis = projetos.filter(p => p.id !== tarefa.projetoId);

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
              await this.tarefaService.moverTarefa(tarefa.id, projetoId);
              await this.mostrarToast('Tarefa movida com sucesso', 'success');
              await this.carregarTarefas();
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
   * Alterna o estado de conclusão da tarefa
   */
  async toggleConcluida(tarefa: Tarefa) {
    try {
      await this.tarefaService.toggleConcluida(tarefa.id, !tarefa.concluida);
      await this.carregarTarefas();
    } catch (error) {
      console.error('Erro ao alterar estado da tarefa:', error);
    }
  }

  /**
   * Verifica se uma tarefa está em atraso
   */
  isTarefaAtrasada(tarefa: Tarefa): boolean {
    return this.tarefaService.isTarefaAtrasada(tarefa);
  }

  /**
   * Recarrega os dados (pull-to-refresh)
   */
  async refresh(event: any) {
    await this.carregarTarefas();
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

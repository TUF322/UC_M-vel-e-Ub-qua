import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { ProjetoService } from '../../../services/projeto.service';
import { CategoriaService } from '../../../services/categoria.service';
import { TarefaService } from '../../../services/tarefa.service';
import { StringService } from '../../../services/string.service';
import { Projeto } from '../../../models/projeto.model';
import { Categoria } from '../../../models/categoria.model';
import { Tarefa } from '../../../models/tarefa.model';

/**
 * Página de detalhes do projeto
 * Exibe informações do projeto e lista de tarefas
 */
@Component({
  selector: 'app-projeto-detail',
  templateUrl: './projeto-detail.page.html',
  styleUrls: ['./projeto-detail.page.scss'],
  standalone: false
})
export class ProjetoDetailPage implements OnInit {
  projeto: Projeto | null = null;
  categoria: Categoria | null = null;
  tarefas: Tarefa[] = [];
  loading = true;
  stats = {
    total: 0,
    concluidas: 0,
    pendentes: 0,
    atrasadas: 0
  };

  constructor(
    private projetoService: ProjetoService,
    private categoriaService: CategoriaService,
    private tarefaService: TarefaService,
    private stringService: StringService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    const projetoId = this.activatedRoute.snapshot.paramMap.get('id');
    if (projetoId) {
      await this.carregarProjeto(projetoId);
    }
  }

  /**
   * Carrega o projeto e seus dados
   */
  async carregarProjeto(projetoId: string) {
    try {
      this.loading = true;
      
      this.projeto = await this.projetoService.getById(projetoId);
      if (!this.projeto) {
        await this.mostrarToast('Projeto não encontrado', 'danger');
        this.router.navigate(['/projetos']);
        return;
      }

      // Carrega categoria
      this.categoria = await this.categoriaService.getById(this.projeto.categoriaId);
      
      // Carrega tarefas
      this.tarefas = await this.tarefaService.getByProjetoId(projetoId);
      
      // Calcula estatísticas
      this.calcularEstatisticas();
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      await this.mostrarToast(this.getString('mensagens.erro.geral'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Calcula estatísticas das tarefas
   */
  calcularEstatisticas() {
    this.stats.total = this.tarefas.length;
    this.stats.concluidas = this.tarefas.filter(t => t.concluida).length;
    this.stats.pendentes = this.tarefas.filter(t => !t.concluida).length;
    this.stats.atrasadas = this.tarefas.filter(t => 
      !t.concluida && this.tarefaService.isTarefaAtrasada(t)
    ).length;
  }

  /**
   * Navega para adicionar tarefa
   */
  adicionarTarefa() {
    if (this.projeto) {
      this.router.navigate(['/tarefas/nova', this.projeto.id]);
    } else {
      this.router.navigate(['/tarefas/nova']);
    }
  }

  /**
   * Navega para editar projeto
   */
  editarProjeto() {
    if (this.projeto) {
      this.router.navigate(['/projetos/editar', this.projeto.id]);
    }
  }

  /**
   * Elimina o projeto após confirmação
   */
  async eliminarProjeto() {
    if (!this.projeto) return;

    const alert = await this.alertController.create({
      header: this.getString('labels.eliminar'),
      message: this.getString('mensagens.confirmacao.eliminarProjeto'),
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
              await this.projetoService.delete(this.projeto!.id);
              await this.mostrarToast(this.getString('mensagens.sucesso.eliminado'), 'success');
              this.router.navigate(['/projetos']);
            } catch (error: any) {
              console.error('Erro ao eliminar projeto:', error);
              await this.mostrarToast(error.message || this.getString('mensagens.erro.geral'), 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Navega para detalhes da tarefa
   */
  verTarefa(tarefa: Tarefa) {
    this.router.navigate(['/tarefas/detalhes', tarefa.id]);
  }

  /**
   * Alterna o estado de conclusão da tarefa
   */
  async toggleTarefaConcluida(tarefa: Tarefa) {
    try {
      await this.tarefaService.toggleConcluida(tarefa.id, !tarefa.concluida);
      await this.carregarProjeto(this.projeto!.id);
    } catch (error) {
      console.error('Erro ao alterar estado:', error);
    }
  }

  /**
   * Verifica se uma tarefa está em atraso
   */
  isTarefaAtrasada(tarefa: Tarefa): boolean {
    return this.tarefaService.isTarefaAtrasada(tarefa);
  }

  /**
   * Recarrega os dados
   */
  async refresh(event: any) {
    if (this.projeto) {
      await this.carregarProjeto(this.projeto.id);
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

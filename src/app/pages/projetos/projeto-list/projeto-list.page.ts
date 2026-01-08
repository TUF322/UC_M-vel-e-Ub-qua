import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { ProjetoService } from '../../../services/projeto.service';
import { CategoriaService } from '../../../services/categoria.service';
import { TarefaService } from '../../../services/tarefa.service';
import { StringService } from '../../../services/string.service';
import { Projeto } from '../../../models/projeto.model';
import { Categoria } from '../../../models/categoria.model';

/**
 * Página de listagem de projetos
 * Permite visualizar, filtrar, editar e eliminar projetos
 */
@Component({
  selector: 'app-projeto-list',
  templateUrl: './projeto-list.page.html',
  styleUrls: ['./projeto-list.page.scss'],
  standalone: false
})
export class ProjetoListPage implements OnInit {
  projetos: Projeto[] = [];
  projetosFiltrados: Projeto[] = [];
  categorias: Categoria[] = [];
  categoriaSelecionada: string | null = null;
  loading = true;
  stats: { [key: string]: { total: number; atrasadas: number } } = {};

  constructor(
    private projetoService: ProjetoService,
    private categoriaService: CategoriaService,
    private tarefaService: TarefaService,
    private stringService: StringService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.carregarDados();
  }

  /**
   * Recarrega dados quando a página é exibida
   */
  async ionViewWillEnter() {
    await this.carregarDados();
  }

  /**
   * Carrega todos os dados necessários
   */
  async carregarDados() {
    try {
      this.loading = true;
      const todasCategorias = await this.categoriaService.getAll();
      // Filtra apenas categorias válidas
      this.categorias = todasCategorias.filter(cat => cat && cat.id && cat.nome && cat.cor && cat.icone);
      
      const todosProjetos = await this.projetoService.getAll();
      // Filtra apenas projetos válidos
      this.projetos = todosProjetos.filter(proj => proj && proj.id && proj.nome);
      
      // Carrega estatísticas de tarefas por projeto
      await this.carregarEstatisticas();
      
      // Aplica filtro inicial
      this.aplicarFiltro();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      await this.mostrarToast(this.getString('mensagens.erro.geral'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Carrega estatísticas de tarefas por projeto
   */
  async carregarEstatisticas() {
    for (const projeto of this.projetos) {
      const tarefas = await this.tarefaService.getByProjetoId(projeto.id);
      const tarefasAtrasadas = tarefas.filter(t => this.tarefaService.isTarefaAtrasada(t));
      
      this.stats[projeto.id] = {
        total: tarefas.length,
        atrasadas: tarefasAtrasadas.length
      };
    }
  }

  /**
   * Aplica filtro por categoria
   */
  aplicarFiltro() {
    if (this.categoriaSelecionada === null || this.categoriaSelecionada === 'todas') {
      this.projetosFiltrados = [...this.projetos];
    } else {
      this.projetosFiltrados = this.projetos.filter(
        proj => proj.categoriaId === this.categoriaSelecionada
      );
    }
  }

  /**
   * Filtra projetos por categoria
   */
  filtrarPorCategoria(event: any) {
    const categoriaId = event.detail.value;
    this.categoriaSelecionada = categoriaId === 'todas' ? null : (categoriaId || null);
    this.aplicarFiltro();
  }

  /**
   * Obtém o ícone da categoria
   */
  getIconeCategoria(categoriaId: string | null | undefined): string {
    if (!categoriaId) return 'folder';
    const categoria = this.categorias.find(c => c && c.id === categoriaId);
    return categoria && categoria.icone ? categoria.icone : 'folder';
  }

  /**
   * Obtém o nome da categoria
   */
  getNomeCategoria(categoriaId: string | null | undefined): string {
    if (!categoriaId) return 'Sem categoria';
    const categoria = this.categorias.find(cat => cat && cat.id === categoriaId);
    return categoria && categoria.nome ? categoria.nome : 'Sem categoria';
  }

  /**
   * Obtém a cor da categoria
   */
  getCorCategoria(categoriaId: string | null | undefined): string {
    if (!categoriaId) return '#92949c';
    const categoria = this.categorias.find(cat => cat && cat.id === categoriaId);
    return categoria && categoria.cor ? categoria.cor : '#92949c';
  }

  /**
   * Navega para adicionar projeto
   */
  adicionarProjeto() {
    this.router.navigate(['/projetos/novo']);
  }

  /**
   * Navega para detalhes do projeto
   */
  verDetalhes(projeto: Projeto) {
    this.router.navigate(['/projetos/detalhes', projeto.id]);
  }

  /**
   * Navega para editar projeto
   */
  editarProjeto(projeto: Projeto) {
    this.router.navigate(['/projetos/editar', projeto.id]);
  }

  /**
   * Elimina um projeto após confirmação
   */
  async eliminarProjeto(projeto: Projeto) {
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
              await this.projetoService.delete(projeto.id);
              await this.mostrarToast(this.getString('mensagens.sucesso.eliminado'), 'success');
              await this.carregarDados();
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
   * Recarrega os dados (pull-to-refresh)
   */
  async refresh(event: any) {
    await this.carregarDados();
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

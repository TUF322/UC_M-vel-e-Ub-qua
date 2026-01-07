import { Component, OnInit } from '@angular/core';
import { CategoriaService } from '../services/categoria.service';
import { ProjetoService } from '../services/projeto.service';
import { TarefaService } from '../services/tarefa.service';
import { StringService } from '../services/string.service';
import { Categoria } from '../models/categoria.model';
import { Projeto } from '../models/projeto.model';
import { Tarefa } from '../models/tarefa.model';

/**
 * Página inicial da aplicação
 * Demonstra os dados carregados e serviços funcionando
 */
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  categorias: Categoria[] = [];
  projetos: Projeto[] = [];
  tarefas: Tarefa[] = [];
  tarefasAtrasadas: Tarefa[] = [];
  loading = true;
  stats = {
    totalCategorias: 0,
    totalProjetos: 0,
    totalTarefas: 0,
    tarefasAtrasadas: 0
  };

  constructor(
    private categoriaService: CategoriaService,
    private projetoService: ProjetoService,
    private tarefaService: TarefaService,
    private stringService: StringService
  ) {}

  async ngOnInit() {
    await this.carregarDados();
  }

  /**
   * Carrega todos os dados para exibição
   */
  async carregarDados() {
    try {
      this.loading = true;

      // Carrega categorias
      this.categorias = await this.categoriaService.getAll();
      
      // Carrega projetos
      this.projetos = await this.projetoService.getAll();
      
      // Carrega tarefas
      this.tarefas = await this.tarefaService.getAll();
      
      // Carrega tarefas em atraso
      this.tarefasAtrasadas = await this.tarefaService.getTarefasAtrasadas();

      // Atualiza estatísticas
      this.stats = {
        totalCategorias: this.categorias.length,
        totalProjetos: this.projetos.length,
        totalTarefas: this.tarefas.length,
        tarefasAtrasadas: this.tarefasAtrasadas.length
      };
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Obtém uma string do StringService
   */
  getString(path: string): string {
    return this.stringService.get(path);
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
  async refresh(event?: any) {
    await this.carregarDados();
    if (event) {
      event.target.complete();
    }
  }
}

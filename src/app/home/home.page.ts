import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriaService } from '../services/categoria.service';
import { ProjetoService } from '../services/projeto.service';
import { TarefaService } from '../services/tarefa.service';
import { NotaService } from '../services/nota.service';
import { StringService } from '../services/string.service';
import { Categoria } from '../models/categoria.model';
import { Projeto } from '../models/projeto.model';
import { Tarefa } from '../models/tarefa.model';
import { Nota } from '../models/nota.model';

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
  ultimasCategorias: Categoria[] = [];
  projetos: Projeto[] = [];
  ultimosProjetos: Projeto[] = [];
  tarefas: Tarefa[] = [];
  tarefasAtrasadas: Tarefa[] = [];
  tarefaMaisProxima: Tarefa | null = null;
  notas: Nota[] = [];
  ultimasNotas: Nota[] = [];
  dataAtual: Date = new Date();
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
    private notaService: NotaService,
    private stringService: StringService,
    private router: Router
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
   * Carrega todos os dados para exibição
   */
  async carregarDados() {
    try {
      this.loading = true;

      // Carrega categorias
      const todasCategorias = await this.categoriaService.getAll();
      // Remove duplicados por ID
      this.categorias = todasCategorias.filter((cat, index, self) =>
        index === self.findIndex(c => c.id === cat.id)
      );
      // Pega as 4 primeiras categorias para exibir na home
      this.ultimasCategorias = this.categorias.slice(0, 4);
      
      // Carrega projetos
      this.projetos = await this.projetoService.getAll();
      // Pega os 4 primeiros projetos para exibir na home
      this.ultimosProjetos = this.projetos.slice(0, 4);
      
      // Carrega tarefas
      this.tarefas = await this.tarefaService.getAll();
      
      // Carrega tarefas em atraso
      this.tarefasAtrasadas = await this.tarefaService.getTarefasAtrasadas();

      // Carrega notas
      this.notas = await this.notaService.getAll();
      
      // Ordena notas por data de modificação (mais recente primeiro) e pega as 4 primeiras
      this.ultimasNotas = this.notas
        .sort((a, b) => b.dataModificacao.getTime() - a.dataModificacao.getTime())
        .slice(0, 4);

      // Encontra a tarefa mais próxima da data atual
      this.tarefaMaisProxima = this.encontrarTarefaMaisProxima();

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

  /**
   * Navega para uma rota específica
   * @param rota - Rota para navegar
   */
  navegarPara(rota: string) {
    this.router.navigate([rota]);
  }

  /**
   * Navega para detalhes da tarefa
   * @param tarefa - Tarefa para visualizar
   */
  verTarefa(tarefa: Tarefa) {
    this.router.navigate(['/tarefas/detalhes', tarefa.id]);
  }

  /**
   * Encontra a tarefa mais próxima da data atual
   * Considera apenas tarefas não concluídas
   * @returns Tarefa mais próxima ou null
   */
  encontrarTarefaMaisProxima(): Tarefa | null {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Filtra tarefas não concluídas
    const tarefasPendentes = this.tarefas.filter(t => !t.concluida);

    if (tarefasPendentes.length === 0) {
      return null;
    }

    // Encontra a tarefa com data limite mais próxima (futura ou passada)
    let tarefaMaisProxima: Tarefa | null = null;
    let menorDiferenca: number = Infinity;

    tarefasPendentes.forEach(tarefa => {
      const dataLimite = new Date(tarefa.dataLimite);
      dataLimite.setHours(0, 0, 0, 0);
      
      const diferenca = Math.abs(dataLimite.getTime() - hoje.getTime());

      if (diferenca < menorDiferenca) {
        menorDiferenca = diferenca;
        tarefaMaisProxima = tarefa;
      }
    });

    return tarefaMaisProxima;
  }

  /**
   * Verifica se a data do próximo evento é hoje
   * @returns true se a data atual é igual à data do próximo evento
   */
  isDataHoje(): boolean {
    if (!this.tarefaMaisProxima) {
      return false;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataProxima = new Date(this.tarefaMaisProxima.dataLimite);
    dataProxima.setHours(0, 0, 0, 0);

    return hoje.getTime() === dataProxima.getTime();
  }

  /**
   * Navega para detalhes da nota
   * @param nota - Nota para visualizar
   */
  verNota(nota: Nota) {
    this.router.navigate(['/notas/detalhes', nota.id]);
  }

  /**
   * Obtém preview do conteúdo da nota
   */
  getPreviewNota(nota: Nota): string {
    if (nota.protegida) {
      return '*** Protegida ***';
    }
    const preview = nota.conteudo.substring(0, 50);
    return preview.length < nota.conteudo.length ? preview + '...' : preview;
  }
}

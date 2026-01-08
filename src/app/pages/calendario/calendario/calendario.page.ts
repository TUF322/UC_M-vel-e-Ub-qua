import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TarefaService } from '../../../services/tarefa.service';
import { ProjetoService } from '../../../services/projeto.service';
import { StringService } from '../../../services/string.service';
import { Tarefa } from '../../../models/tarefa.model';
import { Projeto } from '../../../models/projeto.model';

/**
 * Interface para agrupar tarefas por data
 */
interface TarefasPorData {
  data: Date;
  tarefas: Tarefa[];
  temAtrasadas: boolean;
}

/**
 * Interface para dia do calendário
 */
interface DiaCalendario {
  data: Date;
  numero: number;
  temTarefas: boolean;
  temAtrasadas: boolean;
  quantidade: number;
  isMesAtual: boolean;
  isHoje: boolean;
}

/**
 * Página de Calendário
 * Exibe as datas limite das tarefas em um calendário
 */
@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
  standalone: false
})
export class CalendarioPage implements OnInit {
  tarefas: Tarefa[] = [];
  tarefasPorData: Map<string, TarefasPorData> = new Map();
  dataSelecionada: Date = new Date();
  dataAtual: Date = new Date();
  mesAtual: number = new Date().getMonth();
  anoAtual: number = new Date().getFullYear();
  diasCalendario: DiaCalendario[] = [];
  tarefasDataSelecionada: Tarefa[] = [];
  projetos: Map<string, Projeto> = new Map();
  loading = true;

  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  constructor(
    private tarefaService: TarefaService,
    private projetoService: ProjetoService,
    private stringService: StringService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.carregarProjetos();
    await this.carregarTarefas();
    this.gerarCalendario();
  }

  /**
   * Carrega todos os projetos para exibir nomes
   */
  async carregarProjetos() {
    const projetos = await this.projetoService.getAll();
    projetos.forEach(proj => {
      this.projetos.set(proj.id, proj);
    });
  }

  /**
   * Carrega todas as tarefas
   */
  async carregarTarefas() {
    try {
      this.loading = true;
      this.tarefas = await this.tarefaService.getAll();
      this.agruparTarefasPorData();
      this.filtrarTarefasDataSelecionada();
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      await this.mostrarToast(this.getString('mensagens.erro.geral'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Agrupa tarefas por data limite
   */
  agruparTarefasPorData() {
    this.tarefasPorData.clear();
    
    this.tarefas.forEach(tarefa => {
      const dataLimite = new Date(tarefa.dataLimite);
      dataLimite.setHours(0, 0, 0, 0);
      const chave = this.formatarDataChave(dataLimite);
      
      if (!this.tarefasPorData.has(chave)) {
        this.tarefasPorData.set(chave, {
          data: dataLimite,
          tarefas: [],
          temAtrasadas: false
        });
      }
      
      const grupo = this.tarefasPorData.get(chave)!;
      grupo.tarefas.push(tarefa);
      
      if (!tarefa.concluida && this.tarefaService.isTarefaAtrasada(tarefa)) {
        grupo.temAtrasadas = true;
      }
    });
  }

  /**
   * Gera o calendário do mês atual
   */
  gerarCalendario() {
    this.diasCalendario = [];
    
    // Primeiro dia do mês
    const primeiroDia = new Date(this.anoAtual, this.mesAtual, 1);
    const ultimoDia = new Date(this.anoAtual, this.mesAtual + 1, 0);
    
    // Dia da semana do primeiro dia (0 = domingo, 6 = sábado)
    const diaSemanaInicio = primeiroDia.getDay();
    
    // Adiciona dias do mês anterior para completar a primeira semana
    const diasMesAnterior = new Date(this.anoAtual, this.mesAtual, 0).getDate();
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const data = new Date(this.anoAtual, this.mesAtual - 1, diasMesAnterior - i);
      this.diasCalendario.push(this.criarDiaCalendario(data, false));
    }
    
    // Adiciona dias do mês atual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const data = new Date(this.anoAtual, this.mesAtual, dia);
      this.diasCalendario.push(this.criarDiaCalendario(data, true));
    }
    
    // Adiciona dias do próximo mês para completar a última semana
    const diasRestantes = 42 - this.diasCalendario.length; // 6 semanas * 7 dias
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const data = new Date(this.anoAtual, this.mesAtual + 1, dia);
      this.diasCalendario.push(this.criarDiaCalendario(data, false));
    }
  }

  /**
   * Cria um objeto DiaCalendario
   */
  criarDiaCalendario(data: Date, isMesAtual: boolean): DiaCalendario {
    const chave = this.formatarDataChave(data);
    const grupo = this.tarefasPorData.get(chave);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataComparar = new Date(data);
    dataComparar.setHours(0, 0, 0, 0);
    
    return {
      data: new Date(data),
      numero: data.getDate(),
      temTarefas: !!grupo && grupo.tarefas.length > 0,
      temAtrasadas: !!grupo && grupo.temAtrasadas,
      quantidade: grupo ? grupo.tarefas.length : 0,
      isMesAtual,
      isHoje: dataComparar.getTime() === hoje.getTime()
    };
  }

  /**
   * Formata data como chave (YYYY-MM-DD)
   * Método público para uso no template
   */
  formatarDataChave(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  /**
   * Seleciona uma data
   */
  selecionarData(dia: DiaCalendario) {
    if (!dia.isMesAtual) {
      // Muda para o mês do dia selecionado
      this.mesAtual = dia.data.getMonth();
      this.anoAtual = dia.data.getFullYear();
      this.gerarCalendario();
    }
    
    this.dataSelecionada = new Date(dia.data);
    this.filtrarTarefasDataSelecionada();
  }

  /**
   * Filtra tarefas da data selecionada
   */
  filtrarTarefasDataSelecionada() {
    const chave = this.formatarDataChave(this.dataSelecionada);
    const grupo = this.tarefasPorData.get(chave);
    this.tarefasDataSelecionada = grupo ? grupo.tarefas : [];
  }

  /**
   * Navega para o mês anterior
   */
  mesAnterior() {
    if (this.mesAtual === 0) {
      this.mesAtual = 11;
      this.anoAtual--;
    } else {
      this.mesAtual--;
    }
    this.gerarCalendario();
  }

  /**
   * Navega para o próximo mês
   */
  mesProximo() {
    if (this.mesAtual === 11) {
      this.mesAtual = 0;
      this.anoAtual++;
    } else {
      this.mesAtual++;
    }
    this.gerarCalendario();
  }

  /**
   * Volta para o mês atual
   */
  voltarMesAtual() {
    const hoje = new Date();
    this.mesAtual = hoje.getMonth();
    this.anoAtual = hoje.getFullYear();
    this.dataSelecionada = new Date(hoje);
    this.gerarCalendario();
    this.filtrarTarefasDataSelecionada();
  }

  /**
   * Navega para detalhes da tarefa
   */
  verTarefa(tarefa: Tarefa) {
    this.router.navigate(['/tarefas/detalhes', tarefa.id]);
  }

  /**
   * Navega para editar tarefa
   */
  editarTarefa(tarefa: Tarefa) {
    this.router.navigate(['/tarefas/editar', tarefa.id]);
  }

  /**
   * Verifica se uma tarefa está em atraso
   */
  isTarefaAtrasada(tarefa: Tarefa): boolean {
    return this.tarefaService.isTarefaAtrasada(tarefa);
  }

  /**
   * Obtém o nome do projeto
   */
  getNomeProjeto(projetoId: string): string {
    const projeto = this.projetos.get(projetoId);
    return projeto ? projeto.nome : 'Projeto não encontrado';
  }

  /**
   * Recarrega os dados (pull-to-refresh)
   */
  async refresh(event: any) {
    await this.carregarTarefas();
    this.gerarCalendario();
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

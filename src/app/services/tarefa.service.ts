import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { DatabaseService } from './database.service';
import { Tarefa, TarefaCreate, TarefaUpdate } from '../models/tarefa.model';

/**
 * Serviço para gestão de Tarefas
 * Implementa operações CRUD (Create, Read, Update, Delete)
 * Inclui lógica de ordenação e movimentação entre projetos
 * Usa SQLite em dispositivos nativos, Storage no browser
 */
@Injectable({
  providedIn: 'root'
})
export class TarefaService {
  constructor(
    private storageService: StorageService,
    private databaseService: DatabaseService
  ) {}

  /**
   * Obtém todas as tarefas
   * @returns Promise com array de tarefas
   */
  async getAll(): Promise<Tarefa[]> {
    // Tenta usar SQLite primeiro
    if (this.databaseService.isUsingSQLite()) {
      const tarefas = await this.databaseService.getTarefasFromSQLite();
      return tarefas.map(tar => this.deserializeTarefaFromSQLite(tar));
    }
    
    // Fallback para Storage
    const tarefas = await this.storageService.getTarefas();
    return tarefas.map(tar => this.deserializeTarefa(tar));
  }

  /**
   * Obtém uma tarefa por ID
   * @param id - ID da tarefa
   * @returns Promise com a tarefa ou null se não encontrada
   */
  async getById(id: string): Promise<Tarefa | null> {
    const tarefas = await this.getAll();
    const tarefa = tarefas.find(tar => tar.id === id);
    return tarefa || null;
  }

  /**
   * Obtém todas as tarefas de um projeto
   * @param projetoId - ID do projeto
   * @returns Promise com array de tarefas do projeto, ordenadas por ordem
   */
  async getByProjetoId(projetoId: string): Promise<Tarefa[]> {
    // Tenta usar SQLite primeiro
    if (this.databaseService.isUsingSQLite()) {
      const query = 'SELECT * FROM tarefas WHERE projeto_id = ? ORDER BY ordem';
      const tarefas = await this.databaseService.query(query, [projetoId]);
      return tarefas.map(tar => this.deserializeTarefaFromSQLite(tar));
    }
    
    // Fallback para Storage
    const tarefas = await this.getAll();
    return tarefas
      .filter(tar => tar.projetoId === projetoId)
      .sort((a, b) => a.ordem - b.ordem);
  }

  /**
   * Obtém tarefas em atraso (data limite já passou e não está concluída)
   * @returns Promise com array de tarefas em atraso
   */
  async getTarefasAtrasadas(): Promise<Tarefa[]> {
    const tarefas = await this.getAll();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return tarefas.filter(tarefa => {
      if (tarefa.concluida) return false;
      
      const dataLimite = new Date(tarefa.dataLimite);
      dataLimite.setHours(0, 0, 0, 0);
      
      return dataLimite < hoje;
    });
  }

  /**
   * Verifica se uma tarefa está em atraso
   * @param tarefa - Tarefa a verificar
   * @returns true se está em atraso, false caso contrário
   */
  isTarefaAtrasada(tarefa: Tarefa): boolean {
    if (tarefa.concluida) return false;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const dataLimite = new Date(tarefa.dataLimite);
    dataLimite.setHours(0, 0, 0, 0);

    return dataLimite < hoje;
  }

  /**
   * Cria uma nova tarefa
   * @param tarefaData - Dados da tarefa (sem id, ordem e dataCriacao)
   * @returns Promise com a tarefa criada
   */
  async create(tarefaData: TarefaCreate): Promise<Tarefa> {
    const tarefasProjeto = await this.getByProjetoId(tarefaData.projetoId);
    
    // Determina a ordem (última ordem + 1)
    const novaOrdem = tarefasProjeto.length > 0 
      ? Math.max(...tarefasProjeto.map(t => t.ordem)) + 1 
      : 0;

    const novaTarefa: Tarefa = {
      id: this.generateId(),
      ...tarefaData,
      ordem: novaOrdem,
      concluida: false,
      dataCriacao: new Date()
    };

    // Salva no SQLite se disponível
    if (this.databaseService.isUsingSQLite()) {
      await this.databaseService.saveTarefaSQLite(novaTarefa);
    }

    // Sempre salva também no Storage
    const tarefas = await this.storageService.getTarefas();
    tarefas.push(this.serializeTarefa(novaTarefa));
    await this.storageService.setTarefas(tarefas);

    return novaTarefa;
  }

  /**
   * Atualiza uma tarefa existente
   * @param id - ID da tarefa
   * @param tarefaData - Dados a atualizar
   * @returns Promise com a tarefa atualizada
   */
  async update(id: string, tarefaData: TarefaUpdate): Promise<Tarefa> {
    const tarefa = await this.getById(id);
    if (!tarefa) {
      throw new Error(`Tarefa com ID ${id} não encontrada`);
    }

    // Atualiza apenas os campos fornecidos
    const tarefaAtualizada: Tarefa = {
      ...tarefa,
      ...tarefaData
    };

    // Atualiza no SQLite se disponível
    if (this.databaseService.isUsingSQLite()) {
      await this.databaseService.saveTarefaSQLite(tarefaAtualizada);
    }

    // Atualiza no Storage
    const tarefas = await this.storageService.getTarefas();
    const index = tarefas.findIndex((tar: any) => tar.id === id);
    if (index !== -1) {
      tarefas[index] = this.serializeTarefa(tarefaAtualizada);
      await this.storageService.setTarefas(tarefas);
    }

    return tarefaAtualizada;
  }

  /**
   * Elimina uma tarefa
   * @param id - ID da tarefa
   */
  async delete(id: string): Promise<void> {
    // Elimina do SQLite se disponível
    if (this.databaseService.isUsingSQLite()) {
      await this.databaseService.deleteTarefaSQLite(id);
    }

    // Elimina do Storage
    const tarefas = await this.getAll();
    const tarefasFiltradas = tarefas.filter(tar => tar.id !== id);
    await this.storageService.setTarefas(this.serializeTarefas(tarefasFiltradas));
  }

  /**
   * Elimina todas as tarefas de um projeto
   * @param projetoId - ID do projeto
   */
  async deleteByProjetoId(projetoId: string): Promise<void> {
    const tarefas = await this.getAll();
    const tarefasFiltradas = tarefas.filter(tar => tar.projetoId !== projetoId);
    await this.storageService.setTarefas(this.serializeTarefas(tarefasFiltradas));
  }

  /**
   * Reordena as tarefas de um projeto
   * @param projetoId - ID do projeto
   * @param novaOrdem - Array com os IDs das tarefas na nova ordem
   */
  async reordenarTarefas(projetoId: string, novaOrdem: string[]): Promise<void> {
    const tarefas = await this.getAll();
    
    // Atualiza a ordem das tarefas do projeto
    novaOrdem.forEach((tarefaId, index) => {
      const tarefa = tarefas.find(t => t.id === tarefaId && t.projetoId === projetoId);
      if (tarefa) {
        tarefa.ordem = index;
      }
    });

    await this.storageService.setTarefas(this.serializeTarefas(tarefas));
  }

  /**
   * Move uma tarefa para outro projeto
   * @param tarefaId - ID da tarefa
   * @param novoProjetoId - ID do novo projeto
   */
  async moverTarefa(tarefaId: string, novoProjetoId: string): Promise<void> {
    const tarefas = await this.getAll();
    const tarefa = tarefas.find(t => t.id === tarefaId);

    if (!tarefa) {
      throw new Error(`Tarefa com ID ${tarefaId} não encontrada`);
    }

    // Obtém a última ordem do novo projeto
    const tarefasNovoProjeto = await this.getByProjetoId(novoProjetoId);
    const novaOrdem = tarefasNovoProjeto.length > 0 
      ? Math.max(...tarefasNovoProjeto.map(t => t.ordem)) + 1 
      : 0;

    // Atualiza a tarefa
    tarefa.projetoId = novoProjetoId;
    tarefa.ordem = novaOrdem;

    await this.storageService.setTarefas(this.serializeTarefas(tarefas));
  }

  /**
   * Marca uma tarefa como concluída ou pendente
   * @param id - ID da tarefa
   * @param concluida - true para concluída, false para pendente
   */
  async toggleConcluida(id: string, concluida: boolean): Promise<Tarefa> {
    return await this.update(id, { concluida });
  }

  /**
   * Verifica se uma tarefa existe
   * @param id - ID da tarefa
   * @returns Promise com true se existe, false caso contrário
   */
  async exists(id: string): Promise<boolean> {
    const tarefa = await this.getById(id);
    return tarefa !== null;
  }

  /**
   * Gera um ID único para nova tarefa
   * @returns String com ID único
   */
  private generateId(): string {
    return `tarefa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Serializa tarefas para guardar no Storage (converte Date para string)
   */
  private serializeTarefas(tarefas: Tarefa[]): any[] {
    return tarefas.map(tar => this.serializeTarefa(tar));
  }

  /**
   * Serializa uma tarefa
   */
  private serializeTarefa(tarefa: Tarefa): any {
    return {
      ...tarefa,
      dataLimite: tarefa.dataLimite.toISOString(),
      dataCriacao: tarefa.dataCriacao.toISOString()
    };
  }

  /**
   * Deserializa uma tarefa do Storage (converte string para Date)
   */
  private deserializeTarefa(tarefa: any): Tarefa {
    return {
      ...tarefa,
      dataLimite: new Date(tarefa.dataLimite),
      dataCriacao: new Date(tarefa.dataCriacao)
    };
  }

  /**
   * Deserializa uma tarefa do SQLite (converte snake_case para camelCase)
   */
  private deserializeTarefaFromSQLite(tarefa: any): Tarefa {
    return {
      id: tarefa.id,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      dataLimite: new Date(tarefa.data_limite),
      imagem: tarefa.imagem,
      projetoId: tarefa.projeto_id,
      ordem: tarefa.ordem,
      concluida: tarefa.concluida === 1,
      dataCriacao: new Date(tarefa.data_criacao)
    };
  }
}


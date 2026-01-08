import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { DatabaseService } from './database.service';
import { Projeto, ProjetoCreate, ProjetoUpdate } from '../models/projeto.model';

/**
 * Serviço para gestão de Projetos
 * Implementa operações CRUD (Create, Read, Update, Delete)
 * Usa SQLite em dispositivos nativos, Storage no browser
 */
@Injectable({
  providedIn: 'root'
})
export class ProjetoService {
  constructor(
    private storageService: StorageService,
    private databaseService: DatabaseService
  ) {}

  /**
   * Obtém todos os projetos
   * @returns Promise com array de projetos
   */
  async getAll(): Promise<Projeto[]> {
    let projetos: Projeto[] = [];
    
    // Tenta usar SQLite primeiro
    if (this.databaseService.isUsingSQLite()) {
      const projetosSQLite = await this.databaseService.getProjetosFromSQLite();
      projetos = projetosSQLite
        .filter(proj => proj && proj.id) // Filtra entradas inválidas
        .map(proj => this.deserializeProjetoFromSQLite(proj))
        .filter((proj): proj is Projeto => proj !== null);
    } else {
      // Fallback para Storage
      const projetosStorage = await this.storageService.getProjetos();
      projetos = (projetosStorage || [])
        .filter(proj => proj && proj.id) // Filtra entradas inválidas
        .map(proj => this.deserializeProjeto(proj))
        .filter((proj): proj is Projeto => proj !== null);
    }
    
    return projetos;
  }

  /**
   * Obtém um projeto por ID
   * @param id - ID do projeto
   * @returns Promise com o projeto ou null se não encontrado
   */
  async getById(id: string): Promise<Projeto | null> {
    const projetos = await this.getAll();
    const projeto = projetos.find(proj => proj.id === id);
    return projeto || null;
  }

  /**
   * Obtém todos os projetos de uma categoria
   * @param categoriaId - ID da categoria
   * @returns Promise com array de projetos da categoria
   */
  async getByCategoriaId(categoriaId: string): Promise<Projeto[]> {
    const projetos = await this.getAll();
    return projetos.filter(proj => proj.categoriaId === categoriaId);
  }

  /**
   * Cria um novo projeto
   * @param projetoData - Dados do projeto (sem id e dataCriacao)
   * @returns Promise com o projeto criado
   */
  async create(projetoData: ProjetoCreate): Promise<Projeto> {
    const novoProjeto: Projeto = {
      id: this.generateId(),
      ...projetoData,
      dataCriacao: new Date()
    };

    // Salva no SQLite se disponível
    if (this.databaseService.isUsingSQLite()) {
      await this.databaseService.saveProjetoSQLite(novoProjeto);
    }

    // Sempre salva também no Storage
    const projetos = await this.storageService.getProjetos();
    projetos.push(this.serializeProjeto(novoProjeto));
    await this.storageService.setProjetos(projetos);

    return novoProjeto;
  }

  /**
   * Atualiza um projeto existente
   * @param id - ID do projeto
   * @param projetoData - Dados a atualizar
   * @returns Promise com o projeto atualizado
   */
  async update(id: string, projetoData: ProjetoUpdate): Promise<Projeto> {
    const projeto = await this.getById(id);
    if (!projeto) {
      throw new Error(`Projeto com ID ${id} não encontrado`);
    }

    // Atualiza apenas os campos fornecidos
    const projetoAtualizado: Projeto = {
      ...projeto,
      ...projetoData
    };

    // Atualiza no SQLite se disponível
    if (this.databaseService.isUsingSQLite()) {
      await this.databaseService.saveProjetoSQLite(projetoAtualizado);
    }

    // Atualiza no Storage
    const projetos = await this.storageService.getProjetos();
    const index = projetos.findIndex((proj: any) => proj.id === id);
    if (index !== -1) {
      projetos[index] = this.serializeProjeto(projetoAtualizado);
      await this.storageService.setProjetos(projetos);
    }

    return projetoAtualizado;
  }

  /**
   * Elimina um projeto e todas as tarefas associadas
   * @param id - ID do projeto
   */
  async delete(id: string): Promise<void> {
    // Elimina do SQLite se disponível (já elimina tarefas automaticamente)
    if (this.databaseService.isUsingSQLite()) {
      await this.databaseService.deleteProjetoSQLite(id);
    }

    // Eliminar todas as tarefas do projeto (Storage)
    const tarefas = await this.storageService.getTarefas();
    const tarefasFiltradas = tarefas.filter((tar: any) => tar.projetoId !== id);
    await this.storageService.setTarefas(tarefasFiltradas);

    // Eliminar o projeto (Storage)
    const projetos = await this.getAll();
    const projetosFiltrados = projetos.filter(proj => proj.id !== id);
    await this.storageService.setProjetos(this.serializeProjetos(projetosFiltrados));
  }

  /**
   * Verifica se um projeto existe
   * @param id - ID do projeto
   * @returns Promise com true se existe, false caso contrário
   */
  async exists(id: string): Promise<boolean> {
    const projeto = await this.getById(id);
    return projeto !== null;
  }

  /**
   * Gera um ID único para novo projeto
   * @returns String com ID único
   */
  private generateId(): string {
    return `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Serializa projetos para guardar no Storage (converte Date para string)
   */
  private serializeProjetos(projetos: Projeto[]): any[] {
    return projetos.map(proj => this.serializeProjeto(proj));
  }

  /**
   * Serializa um projeto
   */
  private serializeProjeto(projeto: Projeto): any {
    return {
      ...projeto,
      dataCriacao: projeto.dataCriacao.toISOString()
    };
  }

  /**
   * Deserializa um projeto do Storage (converte string para Date)
   */
  private deserializeProjeto(projeto: any): Projeto | null {
    if (!projeto || !projeto.id || !projeto.nome) {
      return null;
    }

    try {
      return {
        ...projeto,
        categoriaId: projeto.categoriaId || '',
        dataCriacao: projeto.dataCriacao ? new Date(projeto.dataCriacao) : new Date()
      };
    } catch (error) {
      console.warn('Erro ao deserializar projeto:', projeto, error);
      return null;
    }
  }

  /**
   * Deserializa um projeto do SQLite (converte snake_case para camelCase)
   */
  private deserializeProjetoFromSQLite(projeto: any): Projeto | null {
    if (!projeto || !projeto.id || !projeto.nome) {
      return null;
    }

    try {
      return {
        id: projeto.id,
        nome: projeto.nome,
        categoriaId: projeto.categoria_id || projeto.categoriaId || '',
        descricao: projeto.descricao || undefined,
        dataCriacao: projeto.data_criacao ? new Date(projeto.data_criacao) : 
                     (projeto.dataCriacao ? new Date(projeto.dataCriacao) : new Date())
      };
    } catch (error) {
      console.warn('Erro ao deserializar projeto do SQLite:', projeto, error);
      return null;
    }
  }
}


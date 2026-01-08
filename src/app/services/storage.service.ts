import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

/**
 * Chaves utilizadas no Storage
 */
const STORAGE_KEYS = {
  CATEGORIAS: 'categorias',
  PROJETOS: 'projetos',
  TAREFAS: 'tarefas',
  NOTAS: 'notas',
  INICIALIZADO: 'inicializado'
} as const;

/**
 * Serviço para gestão do Ionic Storage
 * Wrapper que facilita o acesso ao Storage com tipagem
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storageReady = false;

  constructor(private storage: Storage) {}

  /**
   * Inicializa o Storage
   * Deve ser chamado antes de usar qualquer método
   */
  async init(): Promise<void> {
    if (!this.storageReady) {
      await this.storage.create();
      this.storageReady = true;
    }
  }

  /**
   * Verifica se o Storage foi inicializado
   */
  isReady(): boolean {
    return this.storageReady;
  }

  /**
   * Obtém todas as categorias
   */
  async getCategorias(): Promise<any[]> {
    await this.init();
    return await this.storage.get(STORAGE_KEYS.CATEGORIAS) || [];
  }

  /**
   * Guarda todas as categorias
   */
  async setCategorias(categorias: any[]): Promise<void> {
    await this.init();
    await this.storage.set(STORAGE_KEYS.CATEGORIAS, categorias);
  }

  /**
   * Obtém todos os projetos
   */
  async getProjetos(): Promise<any[]> {
    await this.init();
    return await this.storage.get(STORAGE_KEYS.PROJETOS) || [];
  }

  /**
   * Guarda todos os projetos
   */
  async setProjetos(projetos: any[]): Promise<void> {
    await this.init();
    await this.storage.set(STORAGE_KEYS.PROJETOS, projetos);
  }

  /**
   * Obtém todas as tarefas
   */
  async getTarefas(): Promise<any[]> {
    await this.init();
    return await this.storage.get(STORAGE_KEYS.TAREFAS) || [];
  }

  /**
   * Guarda todas as tarefas
   */
  async setTarefas(tarefas: any[]): Promise<void> {
    await this.init();
    await this.storage.set(STORAGE_KEYS.TAREFAS, tarefas);
  }

  /**
   * Obtém todas as notas
   */
  async getNotas(): Promise<any[]> {
    await this.init();
    return await this.storage.get(STORAGE_KEYS.NOTAS) || [];
  }

  /**
   * Guarda todas as notas
   */
  async setNotas(notas: any[]): Promise<void> {
    await this.init();
    await this.storage.set(STORAGE_KEYS.NOTAS, notas);
  }

  /**
   * Verifica se os dados foram inicializados
   */
  async isInicializado(): Promise<boolean> {
    await this.init();
    return await this.storage.get(STORAGE_KEYS.INICIALIZADO) || false;
  }

  /**
   * Marca os dados como inicializados
   */
  async setInicializado(value: boolean): Promise<void> {
    await this.init();
    await this.storage.set(STORAGE_KEYS.INICIALIZADO, value);
  }

  /**
   * Limpa todos os dados do Storage
   * Útil para reset da aplicação
   */
  async clear(): Promise<void> {
    await this.init();
    await this.storage.clear();
  }

  /**
   * Obtém um valor genérico do Storage
   */
  async get(key: string): Promise<any> {
    await this.init();
    return await this.storage.get(key);
  }

  /**
   * Guarda um valor genérico no Storage
   */
  async set(key: string, value: any): Promise<void> {
    await this.init();
    await this.storage.set(key, value);
  }

  /**
   * Remove um valor do Storage
   */
  async remove(key: string): Promise<void> {
    await this.init();
    await this.storage.remove(key);
  }
}


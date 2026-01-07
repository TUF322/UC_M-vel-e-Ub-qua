import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StorageService } from './storage.service';
import { DatabaseService } from './database.service';
import { CategoriaService } from './categoria.service';
import { Categoria } from '../models/categoria.model';

/**
 * Serviço para inicialização de dados
 * Carrega dados iniciais do JSON e popula o Storage/SQLite
 */
@Injectable({
  providedIn: 'root'
})
export class DataInitService {
  constructor(
    private storageService: StorageService,
    private databaseService: DatabaseService,
    private categoriaService: CategoriaService,
    private http: HttpClient
  ) {}

  /**
   * Inicializa os dados da aplicação
   * Carrega dados iniciais do JSON se o Storage estiver vazio
   */
  async initialize(): Promise<void> {
    // Inicializa DatabaseService (SQLite ou Storage)
    await this.databaseService.initialize();
    await this.storageService.init();

    // Verifica se já foi inicializado
    const inicializado = await this.storageService.isInicializado();
    if (inicializado) {
      // Se SQLite está disponível, sincroniza dados do Storage
      if (this.databaseService.isUsingSQLite()) {
        await this.databaseService.syncFromStorage();
      }
      console.log('Dados já inicializados');
      return;
    }

    try {
      // Carrega categorias iniciais do JSON
      await this.loadInitialCategorias();
      
      // Se SQLite está disponível, sincroniza dados do Storage
      if (this.databaseService.isUsingSQLite()) {
        await this.databaseService.syncFromStorage();
      }
      
      // Marca como inicializado
      await this.storageService.setInicializado(true);
      console.log('Dados inicializados com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar dados:', error);
      // Continua mesmo com erro, para não bloquear a app
    }
  }

  /**
   * Carrega categorias iniciais do ficheiro JSON
   */
  private async loadInitialCategorias(): Promise<void> {
    try {
      const data = await firstValueFrom(
        this.http.get<{ categorias: any[] }>('/assets/data/categorias-inicial.json')
      );

      if (data.categorias && data.categorias.length > 0) {
        // Verifica se já existem categorias
        const categoriasExistentes = await this.categoriaService.getAll();
        
        if (categoriasExistentes.length === 0) {
          // Cria as categorias iniciais
          for (const catData of data.categorias) {
            await this.categoriaService.create({
              nome: catData.nome,
              cor: catData.cor,
              icone: catData.icone
            });
          }
          console.log(`${data.categorias.length} categorias iniciais criadas`);
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar categorias iniciais:', error);
      // Não bloqueia a aplicação se o ficheiro não existir
    }
  }

  /**
   * Reseta todos os dados (útil para desenvolvimento/testes)
   * ATENÇÃO: Elimina todos os dados!
   */
  async resetAllData(): Promise<void> {
    await this.storageService.clear();
    await this.storageService.setInicializado(false);
    await this.initialize();
  }
}


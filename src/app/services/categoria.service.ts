import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { DatabaseService } from './database.service';
import { Categoria, CategoriaCreate, CategoriaUpdate } from '../models/categoria.model';

/**
 * Serviço para gestão de Categorias
 * Implementa operações CRUD (Create, Read, Update, Delete)
 * Usa SQLite em dispositivos nativos, Storage no browser
 */
@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  constructor(
    private storageService: StorageService,
    private databaseService: DatabaseService
  ) {}

  /**
   * Obtém todas as categorias
   * @returns Promise com array de categorias
   */
  async getAll(): Promise<Categoria[]> {
    let categorias: Categoria[] = [];
    
    // Tenta usar SQLite primeiro
    if (this.databaseService.isUsingSQLite()) {
      const categoriasSQLite = await this.databaseService.getCategoriasFromSQLite();
      categorias = categoriasSQLite
        .filter(cat => cat && cat.id) // Filtra entradas inválidas
        .map(cat => this.deserializeCategoria(cat))
        .filter((cat): cat is Categoria => cat !== null); // Filtra nulls e valida tipo
    } else {
      // Fallback para Storage
      const categoriasStorage = await this.storageService.getCategorias();
      categorias = (categoriasStorage || [])
        .filter(cat => cat && cat.id) // Filtra entradas inválidas
        .map(cat => this.deserializeCategoria(cat))
        .filter((cat): cat is Categoria => cat !== null); // Filtra nulls e valida tipo
    }
    
    // Remove duplicados por ID (garante que não há duplicação)
    const categoriasUnicas = categorias.filter((cat, index, self) =>
      index === self.findIndex(c => c.id === cat.id)
    );
    
    return categoriasUnicas;
  }

  /**
   * Obtém uma categoria por ID
   * @param id - ID da categoria
   * @returns Promise com a categoria ou null se não encontrada
   */
  async getById(id: string): Promise<Categoria | null> {
    const categorias = await this.getAll();
    const categoria = categorias.find(cat => cat.id === id);
    return categoria || null;
  }

  /**
   * Cria uma nova categoria
   * @param categoriaData - Dados da categoria (sem id e dataCriacao)
   * @returns Promise com a categoria criada
   */
  async create(categoriaData: CategoriaCreate): Promise<Categoria> {
    const novaCategoria: Categoria = {
      id: this.generateId(),
      ...categoriaData,
      dataCriacao: new Date()
    };

    // Salva no SQLite se disponível (fonte principal)
    if (this.databaseService.isUsingSQLite()) {
      await this.databaseService.saveCategoriaSQLite(novaCategoria);
      // Também salva no Storage para sincronização (mas não duplica)
      const categorias = await this.storageService.getCategorias();
      // Verifica se já existe antes de adicionar
      const existe = categorias.some((cat: any) => cat.id === novaCategoria.id);
      if (!existe) {
        categorias.push(this.serializeCategoria(novaCategoria));
        await this.storageService.setCategorias(categorias);
      }
    } else {
      // Se não usa SQLite, salva apenas no Storage
      const categorias = await this.storageService.getCategorias();
      // Verifica se já existe antes de adicionar
      const existe = categorias.some((cat: any) => cat.id === novaCategoria.id);
      if (!existe) {
        categorias.push(this.serializeCategoria(novaCategoria));
        await this.storageService.setCategorias(categorias);
      }
    }

    return novaCategoria;
  }

  /**
   * Atualiza uma categoria existente
   * @param id - ID da categoria
   * @param categoriaData - Dados a atualizar
   * @returns Promise com a categoria atualizada
   */
  async update(id: string, categoriaData: CategoriaUpdate): Promise<Categoria> {
    const categoria = await this.getById(id);
    if (!categoria) {
      throw new Error(`Categoria com ID ${id} não encontrada`);
    }

    // Atualiza apenas os campos fornecidos
    const categoriaAtualizada: Categoria = {
      ...categoria,
      ...categoriaData
    };

    // Atualiza no SQLite se disponível
    if (this.databaseService.isUsingSQLite()) {
      await this.databaseService.saveCategoriaSQLite(categoriaAtualizada);
    }

    // Atualiza no Storage
    const categorias = await this.storageService.getCategorias();
    const index = categorias.findIndex((cat: any) => cat.id === id);
    if (index !== -1) {
      categorias[index] = this.serializeCategoria(categoriaAtualizada);
      await this.storageService.setCategorias(categorias);
    }

    return categoriaAtualizada;
  }

  /**
   * Elimina uma categoria
   * @param id - ID da categoria
   * @param verificarProjetos - Se true, verifica se há projetos usando a categoria (padrão: true)
   * @throws Erro se a categoria estiver em uso por algum projeto
   */
  async delete(id: string, verificarProjetos: boolean = true): Promise<void> {
    // Verificar se há projetos usando esta categoria
    if (verificarProjetos) {
      const projetos = await this.storageService.getProjetos();
      const projetosComCategoria = projetos.filter((proj: any) => proj.categoriaId === id);

      if (projetosComCategoria.length > 0) {
        throw new Error('Não é possível eliminar categoria com projetos associados');
      }
    }

    // Elimina do SQLite se disponível
    if (this.databaseService.isUsingSQLite()) {
      await this.databaseService.deleteCategoriaSQLite(id);
    }

    // Elimina do Storage
    const categorias = await this.getAll();
    const categoriasFiltradas = categorias.filter(cat => cat.id !== id);
    await this.storageService.setCategorias(this.serializeCategorias(categoriasFiltradas));
  }

  /**
   * Verifica se uma categoria existe
   * @param id - ID da categoria
   * @returns Promise com true se existe, false caso contrário
   */
  async exists(id: string): Promise<boolean> {
    const categoria = await this.getById(id);
    return categoria !== null;
  }

  /**
   * Gera um ID único para nova categoria
   * @returns String com ID único
   */
  private generateId(): string {
    return `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Serializa categorias para guardar no Storage (converte Date para string)
   */
  private serializeCategorias(categorias: Categoria[]): any[] {
    return categorias.map(cat => this.serializeCategoria(cat));
  }

  /**
   * Serializa uma categoria
   */
  private serializeCategoria(categoria: Categoria): any {
    return {
      ...categoria,
      dataCriacao: categoria.dataCriacao.toISOString()
    };
  }

  /**
   * Deserializa uma categoria do Storage (converte string para Date)
   */
  private deserializeCategoria(categoria: any): Categoria | null {
    // Valida se a categoria é válida
    if (!categoria || !categoria.id || !categoria.nome || !categoria.cor || !categoria.icone) {
      return null;
    }

    try {
      return {
        ...categoria,
        dataCriacao: categoria.dataCriacao ? new Date(categoria.dataCriacao) : new Date()
      };
    } catch (error) {
      console.warn('Erro ao deserializar categoria:', categoria, error);
      return null;
    }
  }
}


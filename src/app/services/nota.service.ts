import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { DatabaseService } from './database.service';
import { Nota, NotaCreate } from '../models/nota.model';

/**
 * Serviço para gestão de Notas
 * Implementa operações CRUD (Create, Read, Update, Delete)
 * Suporta proteção por senha
 * Usa SQLite em dispositivos nativos, Storage no browser
 */
@Injectable({
  providedIn: 'root'
})
export class NotaService {
  constructor(
    private storageService: StorageService,
    private databaseService: DatabaseService
  ) {}

  /**
   * Gera um hash SHA-256 da senha
   * @param senha - Senha em texto plano
   * @returns Promise com o hash em hexadecimal
   */
  private async hashSenha(senha: string): Promise<string> {
    // Usa Web Crypto API para gerar hash SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verifica se a senha está correta
   * @param senha - Senha em texto plano
   * @param senhaHash - Hash armazenado
   * @returns Promise com true se a senha está correta
   */
  async verificarSenha(senha: string, senhaHash: string): Promise<boolean> {
    const hash = await this.hashSenha(senha);
    return hash === senhaHash;
  }

  /**
   * Obtém todas as notas
   * @returns Promise com array de notas (sem conteúdo se protegida)
   */
  async getAll(): Promise<Nota[]> {
    // Tenta usar SQLite primeiro
    if (this.databaseService.isUsingSQLite()) {
      const notas = await this.databaseService.getNotasFromSQLite();
      return notas.map(nota => this.deserializeNota(nota));
    }
    
    // Fallback para Storage
    const notas = await this.storageService.getNotas();
    return notas.map(nota => this.deserializeNota(nota));
  }

  /**
   * Obtém uma nota por ID
   * @param id - ID da nota
   * @returns Promise com a nota ou null se não encontrada
   */
  async getById(id: string): Promise<Nota | null> {
    const notas = await this.getAll();
    const nota = notas.find(n => n.id === id);
    return nota || null;
  }

  /**
   * Cria uma nova nota
   * @param notaData - Dados da nota (sem id e datas)
   * @param senha - Senha opcional para proteger a nota
   * @returns Promise com a nota criada
   */
  async create(notaData: NotaCreate, senha?: string): Promise<Nota> {
    const agora = new Date();
    let senhaHash: string | undefined;

    // Se uma senha foi fornecida, gera o hash
    if (senha && senha.trim().length > 0) {
      senhaHash = await this.hashSenha(senha);
    }

    const novaNota: Nota = {
      id: this.generateId(),
      ...notaData,
      protegida: !!senhaHash,
      senhaHash,
      dataCriacao: agora,
      dataModificacao: agora
    };

    // Salva no SQLite se disponível
    if (this.databaseService.isUsingSQLite()) {
      await this.databaseService.saveNotaSQLite(novaNota);
    }

    // Sempre salva também no Storage (para sincronização e fallback)
    const notas = await this.storageService.getNotas();
    notas.push(this.serializeNota(novaNota));
    await this.storageService.setNotas(notas);

    return novaNota;
  }

  /**
   * Atualiza uma nota existente
   * @param id - ID da nota
   * @param notaData - Dados a atualizar
   * @param senha - Nova senha opcional (se fornecida, atualiza a proteção)
   * @returns Promise com a nota atualizada
   */
  async update(id: string, notaData: Partial<NotaCreate>, senha?: string): Promise<Nota> {
    const nota = await this.getById(id);
    if (!nota) {
      throw new Error('Nota não encontrada');
    }

    let senhaHash = nota.senhaHash;
    let protegida = nota.protegida;

    // Se uma nova senha foi fornecida, atualiza o hash
    if (senha !== undefined) {
      if (senha && senha.trim().length > 0) {
        senhaHash = await this.hashSenha(senha);
        protegida = true;
      } else {
        // Se senha vazia, remove proteção
        senhaHash = undefined;
        protegida = false;
      }
    }

    const notaAtualizada: Nota = {
      ...nota,
      ...notaData,
      protegida,
      senhaHash,
      dataModificacao: new Date()
    };

    // Salva no SQLite se disponível
    if (this.databaseService.isUsingSQLite()) {
      await this.databaseService.saveNotaSQLite(notaAtualizada);
    }

    // Atualiza no Storage
    const notas = await this.storageService.getNotas();
    const index = notas.findIndex(n => n.id === id);
    if (index !== -1) {
      notas[index] = this.serializeNota(notaAtualizada);
      await this.storageService.setNotas(notas);
    }

    return notaAtualizada;
  }

  /**
   * Elimina uma nota
   * @param id - ID da nota
   */
  async delete(id: string): Promise<void> {
    // Elimina do SQLite se disponível
    if (this.databaseService.isUsingSQLite()) {
      await this.databaseService.deleteNotaSQLite(id);
    }

    // Elimina do Storage
    const notas = await this.storageService.getNotas();
    const notasFiltradas = notas.filter(n => n.id !== id);
    await this.storageService.setNotas(notasFiltradas);
  }

  /**
   * Desbloqueia uma nota protegida
   * @param id - ID da nota
   * @param senha - Senha para desbloquear
   * @returns Promise com a nota desbloqueada ou null se senha incorreta
   */
  async desbloquearNota(id: string, senha: string): Promise<Nota | null> {
    const nota = await this.getById(id);
    if (!nota || !nota.protegida || !nota.senhaHash) {
      return nota;
    }

    const senhaCorreta = await this.verificarSenha(senha, nota.senhaHash);
    if (!senhaCorreta) {
      return null;
    }

    return nota;
  }

  /**
   * Serializa uma nota para armazenamento
   */
  private serializeNota(nota: Nota): any {
    return {
      ...nota,
      dataCriacao: nota.dataCriacao instanceof Date ? nota.dataCriacao.toISOString() : nota.dataCriacao,
      dataModificacao: nota.dataModificacao instanceof Date ? nota.dataModificacao.toISOString() : nota.dataModificacao
    };
  }

  /**
   * Deserializa uma nota do armazenamento
   */
  private deserializeNota(nota: any): Nota {
    return {
      ...nota,
      dataCriacao: new Date(nota.dataCriacao),
      dataModificacao: new Date(nota.dataModificacao),
      protegida: nota.protegida === true || nota.protegida === 1
    };
  }

  /**
   * Gera um ID único
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}


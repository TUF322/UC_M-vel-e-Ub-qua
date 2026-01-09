import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { StorageService } from './storage.service';

/**
 * Serviço de Base de Dados
 * Gerencia SQLite em dispositivos nativos e fallback para Ionic Storage no browser
 */
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: SQLiteDBConnection | null = null;
  private readonly DB_NAME = 'gestao_tarefas_db';
  private readonly DB_VERSION = 1;
  private useSQLite = false;
  private initialized = false;

  constructor(private storageService: StorageService) {
    // Verifica se está em dispositivo nativo
    this.useSQLite = Capacitor.isNativePlatform();
  }

  /**
   * Inicializa a base de dados
   * Cria tabelas se necessário
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.useSQLite) {
      try {
        await this.initializeSQLite();
      } catch (error) {
        console.warn('Erro ao inicializar SQLite, usando Storage:', error);
        this.useSQLite = false;
      }
    }

    // Inicializa Storage (sempre, para fallback)
    await this.storageService.init();
    this.initialized = true;
  }

  /**
   * Inicializa SQLite
   */
  private async initializeSQLite(): Promise<void> {
    try {
      // Cria conexão
      const connection = new SQLiteConnection(CapacitorSQLite);

      // Verifica se a base de dados existe
      const isConn = (await connection.isConnection(this.DB_NAME, false)).result;

      if (!isConn) {
        // Cria e abre base de dados
        this.db = await connection.createConnection(
          this.DB_NAME,
          false,
          'no-encryption',
          1,
          false
        );

        // Abre a conexão
        await this.db.open();

        // Cria tabelas
        await this.createTables();
        // Executa migrações
        await this.executarMigracoes();
        console.log('SQLite inicializado com sucesso');
      } else {
        this.db = await connection.retrieveConnection(this.DB_NAME, false);
      }
    } catch (error) {
      console.error('Erro ao inicializar SQLite:', error);
      throw error;
    }
  }

  /**
   * Cria todas as tabelas necessárias
   */
  private async createTables(): Promise<void> {
    if (!this.db) return;

    const queries = [
      // Tabela de Categorias
      `CREATE TABLE IF NOT EXISTS categorias (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        cor TEXT NOT NULL,
        icone TEXT NOT NULL,
        data_criacao TEXT NOT NULL
      );`,

      // Tabela de Projetos
      `CREATE TABLE IF NOT EXISTS projetos (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        categoria_id TEXT NOT NULL,
        descricao TEXT,
        data_criacao TEXT NOT NULL
      );`,

      // Tabela de Tarefas
      `CREATE TABLE IF NOT EXISTS tarefas (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        descricao TEXT,
        data_limite TEXT NOT NULL,
        hora_inicio TEXT,
        hora_fim TEXT,
        configuracao_notificacao TEXT,
        imagem TEXT,
        projeto_id TEXT NOT NULL,
        ordem INTEGER NOT NULL DEFAULT 0,
        concluida INTEGER NOT NULL DEFAULT 0,
        data_criacao TEXT NOT NULL
      );`,

      // Tabela de Notas
      `CREATE TABLE IF NOT EXISTS notas (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        conteudo TEXT NOT NULL,
        protegida INTEGER NOT NULL DEFAULT 0,
        senha_hash TEXT,
        data_criacao TEXT NOT NULL,
        data_modificacao TEXT NOT NULL
      );`,

      // Índices
      `CREATE INDEX IF NOT EXISTS idx_projetos_categoria ON projetos(categoria_id);`,
      `CREATE INDEX IF NOT EXISTS idx_tarefas_projeto ON tarefas(projeto_id);`,
      `CREATE INDEX IF NOT EXISTS idx_tarefas_data_limite ON tarefas(data_limite);`,
      `CREATE INDEX IF NOT EXISTS idx_notas_data_modificacao ON notas(data_modificacao);`
    ];

    for (const query of queries) {
      await this.db.execute(query);
    }
  }

  /**
   * Executa migrações de schema (adiciona colunas novas em tabelas existentes)
   */
  private async executarMigracoes(): Promise<void> {
    if (!this.db) return;

    // Migração: Adiciona colunas novas na tabela tarefas se não existirem
    const colunasNovas = [
      { nome: 'hora_inicio', tipo: 'TEXT' },
      { nome: 'hora_fim', tipo: 'TEXT' },
      { nome: 'configuracao_notificacao', tipo: 'TEXT' }
    ];

    for (const coluna of colunasNovas) {
      try {
        // Tenta adicionar a coluna (pode falhar se já existir, o que é OK)
        await this.db.execute(
          `ALTER TABLE tarefas ADD COLUMN ${coluna.nome} ${coluna.tipo};`
        );
        console.log(`Coluna ${coluna.nome} adicionada à tabela tarefas`);
      } catch (error: any) {
        // Ignora erro se a coluna já existir
        if (error && error.message && error.message.includes('duplicate column')) {
          // Coluna já existe, tudo bem
        } else {
          console.warn(`Erro ao adicionar coluna ${coluna.nome}:`, error);
        }
      }
    }
  }

  /**
   * Executa uma query SELECT
   */
  async query(query: string, params: any[] = []): Promise<any[]> {
    if (this.useSQLite && this.db) {
      try {
        const result = await this.db.query(query, params);
        return result.values || [];
      } catch (error) {
        console.error('Erro na query SQLite:', error);
        throw error;
      }
    } else {
      // Fallback: usar métodos específicos do StorageService
      return [];
    }
  }

  /**
   * Executa uma query INSERT, UPDATE ou DELETE
   */
  async execute(query: string, params: any[] = []): Promise<any> {
    if (this.useSQLite && this.db) {
      try {
        return await this.db.run(query, params);
      } catch (error) {
        console.error('Erro ao executar SQLite:', error);
        throw error;
      }
    } else {
      // Fallback: retorna sucesso (operações feitas via StorageService)
      return { changes: { changes: 1 } };
    }
  }

  /**
   * Verifica se está usando SQLite
   */
  isUsingSQLite(): boolean {
    return this.useSQLite && this.db !== null;
  }

  /**
   * Obtém todas as categorias do SQLite
   */
  async getCategoriasFromSQLite(): Promise<any[]> {
    if (!this.isUsingSQLite()) return [];
    const query = 'SELECT * FROM categorias ORDER BY nome';
    return await this.query(query);
  }

  /**
   * Obtém todos os projetos do SQLite
   */
  async getProjetosFromSQLite(): Promise<any[]> {
    if (!this.isUsingSQLite()) return [];
    const query = 'SELECT * FROM projetos ORDER BY nome';
    return await this.query(query);
  }

  /**
   * Obtém todas as tarefas do SQLite
   */
  async getTarefasFromSQLite(): Promise<any[]> {
    if (!this.isUsingSQLite()) return [];
    const query = 'SELECT * FROM tarefas ORDER BY ordem';
    return await this.query(query);
  }

  /**
   * Guarda uma categoria no SQLite
   */
  async saveCategoriaSQLite(categoria: any): Promise<void> {
    if (!this.isUsingSQLite()) return;
    const query = `
      INSERT OR REPLACE INTO categorias (id, nome, cor, icone, data_criacao)
      VALUES (?, ?, ?, ?, ?)
    `;
    await this.execute(query, [
      categoria.id,
      categoria.nome,
      categoria.cor,
      categoria.icone,
      categoria.dataCriacao instanceof Date ? categoria.dataCriacao.toISOString() : categoria.dataCriacao
    ]);
  }

  /**
   * Guarda um projeto no SQLite
   */
  async saveProjetoSQLite(projeto: any): Promise<void> {
    if (!this.isUsingSQLite()) return;
    const query = `
      INSERT OR REPLACE INTO projetos (id, nome, categoria_id, descricao, data_criacao)
      VALUES (?, ?, ?, ?, ?)
    `;
    await this.execute(query, [
      projeto.id,
      projeto.nome,
      projeto.categoriaId,
      projeto.descricao || null,
      projeto.dataCriacao instanceof Date ? projeto.dataCriacao.toISOString() : projeto.dataCriacao
    ]);
  }

  /**
   * Guarda uma tarefa no SQLite
   */
  async saveTarefaSQLite(tarefa: any): Promise<void> {
    if (!this.isUsingSQLite()) return;
    const query = `
      INSERT OR REPLACE INTO tarefas (id, titulo, descricao, data_limite, hora_inicio, hora_fim, configuracao_notificacao, imagem, projeto_id, ordem, concluida, data_criacao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.execute(query, [
      tarefa.id,
      tarefa.titulo,
      tarefa.descricao || null,
      tarefa.dataLimite instanceof Date ? tarefa.dataLimite.toISOString() : tarefa.dataLimite,
      tarefa.horaInicio ? (tarefa.horaInicio instanceof Date ? tarefa.horaInicio.toISOString() : tarefa.horaInicio) : null,
      tarefa.horaFim ? (tarefa.horaFim instanceof Date ? tarefa.horaFim.toISOString() : tarefa.horaFim) : null,
      tarefa.configuracaoNotificacao ? JSON.stringify(tarefa.configuracaoNotificacao) : null,
      tarefa.imagem || null,
      tarefa.projetoId,
      tarefa.ordem || 0,
      tarefa.concluida ? 1 : 0,
      tarefa.dataCriacao instanceof Date ? tarefa.dataCriacao.toISOString() : tarefa.dataCriacao
    ]);
  }

  /**
   * Elimina uma categoria do SQLite
   */
  async deleteCategoriaSQLite(id: string): Promise<void> {
    if (!this.isUsingSQLite()) return;
    await this.execute('DELETE FROM categorias WHERE id = ?', [id]);
  }

  /**
   * Elimina um projeto do SQLite
   */
  async deleteProjetoSQLite(id: string): Promise<void> {
    if (!this.isUsingSQLite()) return;
    await this.execute('DELETE FROM projetos WHERE id = ?', [id]);
    // Elimina tarefas associadas
    await this.execute('DELETE FROM tarefas WHERE projeto_id = ?', [id]);
  }

  /**
   * Elimina uma tarefa do SQLite
   */
  async deleteTarefaSQLite(id: string): Promise<void> {
    if (!this.isUsingSQLite()) return;
    await this.execute('DELETE FROM tarefas WHERE id = ?', [id]);
  }

  /**
   * Guarda uma nota no SQLite
   */
  async saveNotaSQLite(nota: any): Promise<void> {
    if (!this.isUsingSQLite()) return;
    const query = `
      INSERT OR REPLACE INTO notas (id, titulo, conteudo, protegida, senha_hash, data_criacao, data_modificacao)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await this.execute(query, [
      nota.id,
      nota.titulo,
      nota.conteudo,
      nota.protegida ? 1 : 0,
      nota.senhaHash || null,
      nota.dataCriacao instanceof Date ? nota.dataCriacao.toISOString() : nota.dataCriacao,
      nota.dataModificacao instanceof Date ? nota.dataModificacao.toISOString() : nota.dataModificacao
    ]);
  }

  /**
   * Elimina uma nota do SQLite
   */
  async deleteNotaSQLite(id: string): Promise<void> {
    if (!this.isUsingSQLite()) return;
    await this.execute('DELETE FROM notas WHERE id = ?', [id]);
  }

  /**
   * Obtém todas as notas do SQLite
   */
  async getNotasFromSQLite(): Promise<any[]> {
    if (!this.isUsingSQLite()) return [];
    const result = await this.query('SELECT * FROM notas ORDER BY data_modificacao DESC');
    return result.map((row: any) => ({
      id: row.id,
      titulo: row.titulo,
      conteudo: row.conteudo,
      protegida: row.protegida === 1,
      senhaHash: row.senha_hash || undefined,
      dataCriacao: new Date(row.data_criacao),
      dataModificacao: new Date(row.data_modificacao)
    }));
  }

  /**
   * Sincroniza dados do Storage para SQLite (migração)
   */
  async syncFromStorage(): Promise<void> {
    if (!this.isUsingSQLite()) return;

    try {
      // Migra categorias (INSERT OR REPLACE já evita duplicação)
      const categorias = await this.storageService.getCategorias();
      for (const cat of categorias) {
        await this.saveCategoriaSQLite(cat);
      }

      // Migra projetos
      const projetos = await this.storageService.getProjetos();
      for (const proj of projetos) {
        await this.saveProjetoSQLite(proj);
      }

      // Migra tarefas
      const tarefas = await this.storageService.getTarefas();
      for (const tar of tarefas) {
        await this.saveTarefaSQLite(tar);
      }

      // Migra notas
      const notas = await this.storageService.getNotas();
      for (const nota of notas) {
        await this.saveNotaSQLite(nota);
      }

      console.log('Dados sincronizados do Storage para SQLite');
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
    }
  }
}


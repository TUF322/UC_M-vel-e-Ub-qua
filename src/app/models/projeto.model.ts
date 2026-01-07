/**
 * Modelo de Projeto
 * Representa um projeto que agrupa tarefas
 */
export interface Projeto {
  /** Identificador único do projeto */
  id: string;
  
  /** Nome do projeto */
  nome: string;
  
  /** ID da categoria à qual o projeto pertence */
  categoriaId: string;
  
  /** Descrição opcional do projeto */
  descricao?: string;
  
  /** Data de criação do projeto */
  dataCriacao: Date;
}

/**
 * Dados para criação de um novo projeto (sem id e dataCriacao)
 */
export type ProjetoCreate = Omit<Projeto, 'id' | 'dataCriacao'>;

/**
 * Dados para atualização de um projeto (todos os campos opcionais exceto id)
 */
export type ProjetoUpdate = Partial<Omit<Projeto, 'id'>>;


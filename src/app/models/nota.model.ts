/**
 * Modelo de Nota
 * Representa uma nota de texto que pode ser protegida por senha
 */
export interface Nota {
  /** Identificador único da nota */
  id: string;
  
  /** Título da nota */
  titulo: string;
  
  /** Conteúdo da nota (texto) */
  conteudo: string;
  
  /** Indica se a nota está protegida por senha */
  protegida: boolean;
  
  /** Hash da senha (armazenado de forma segura, nunca a senha em texto plano) */
  senhaHash?: string;
  
  /** Data de criação da nota */
  dataCriacao: Date;
  
  /** Data da última modificação da nota */
  dataModificacao: Date;
}

/**
 * Dados para criação de uma nova nota (sem id e datas)
 */
export type NotaCreate = Omit<Nota, 'id' | 'dataCriacao' | 'dataModificacao'>;


/**
 * Modelo de Tarefa
 * Representa uma tarefa associada a um projeto
 */
export interface Tarefa {
  /** Identificador único da tarefa */
  id: string;
  
  /** Título da tarefa */
  titulo: string;
  
  /** Descrição da tarefa */
  descricao: string;
  
  /** Data limite para conclusão da tarefa */
  dataLimite: Date;
  
  /** Caminho ou base64 da imagem da tarefa (opcional) */
  imagem?: string;
  
  /** ID do projeto ao qual a tarefa pertence */
  projetoId: string;
  
  /** Ordem da tarefa dentro do projeto (para ordenação) */
  ordem: number;
  
  /** Indica se a tarefa está concluída */
  concluida: boolean;
  
  /** Data de criação da tarefa */
  dataCriacao: Date;
}

/**
 * Dados para criação de uma nova tarefa (sem id, ordem e dataCriacao)
 */
export type TarefaCreate = Omit<Tarefa, 'id' | 'ordem' | 'dataCriacao' | 'concluida'>;

/**
 * Dados para atualização de uma tarefa (todos os campos opcionais exceto id)
 */
export type TarefaUpdate = Partial<Omit<Tarefa, 'id'>>;


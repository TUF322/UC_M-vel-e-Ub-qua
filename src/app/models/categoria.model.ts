/**
 * Modelo de Categoria
 * Representa uma categoria de projetos (Ex: Escola, Trabalho, Pessoal)
 */
export interface Categoria {
  /** Identificador único da categoria */
  id: string;
  
  /** Nome da categoria */
  nome: string;
  
  /** Cor hexadecimal da categoria */
  cor: string;
  
  /** Nome do ícone Ionic a utilizar */
  icone: string;
  
  /** Data de criação da categoria */
  dataCriacao: Date;
}

/**
 * Dados para criação de uma nova categoria (sem id e dataCriacao)
 */
export type CategoriaCreate = Omit<Categoria, 'id' | 'dataCriacao'>;

/**
 * Dados para atualização de uma categoria (todos os campos opcionais exceto id)
 */
export type CategoriaUpdate = Partial<Omit<Categoria, 'id'>>;


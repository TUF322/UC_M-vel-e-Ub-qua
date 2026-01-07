import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Interface para estrutura de strings
 */
interface StringsData {
  app: {
    nome: string;
    versao: string;
  };
  mensagens: {
    sucesso: {
      salvo: string;
      eliminado: string;
      atualizado: string;
    };
    erro: {
      geral: string;
      camposObrigatorios: string;
      dataInvalida: string;
      categoriaEmUso: string;
    };
    confirmacao: {
      eliminar: string;
      eliminarProjeto: string;
      eliminarTarefa: string;
    };
  };
  labels: {
    categorias: string;
    projetos: string;
    tarefas: string;
    calendario: string;
    adicionar: string;
    editar: string;
    eliminar: string;
    salvar: string;
    cancelar: string;
    nome: string;
    descricao: string;
    dataLimite: string;
    imagem: string;
    categoria: string;
    projeto: string;
    concluida: string;
    pendente: string;
    emAtraso: string;
  };
}

/**
 * Serviço para isolamento de strings da aplicação
 * Carrega strings de um ficheiro JSON para facilitar internacionalização
 * e manutenção de textos
 */
@Injectable({
  providedIn: 'root'
})
export class StringService {
  private strings: StringsData | null = null;
  private loaded = false;

  constructor(private http: HttpClient) {}

  /**
   * Carrega as strings do ficheiro JSON
   */
  async loadStrings(): Promise<void> {
    if (this.loaded && this.strings) {
      return;
    }

    try {
      const data = await firstValueFrom(
        this.http.get<StringsData>('/assets/data/strings.json')
      );
      this.strings = data;
      this.loaded = true;
    } catch (error) {
      console.warn('Erro ao carregar strings.json, usando valores padrão', error);
      // Valores padrão caso o ficheiro não seja encontrado
      this.strings = this.getDefaultStrings();
      this.loaded = true;
    }
  }

  /**
   * Obtém uma string específica
   * @param path - Caminho da string (ex: 'mensagens.sucesso.salvo')
   */
  get(path: string): string {
    if (!this.strings) {
      this.strings = this.getDefaultStrings();
    }

    const keys = path.split('.');
    let value: any = this.strings;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return path; // Retorna o path se não encontrar
      }
    }

    return typeof value === 'string' ? value : path;
  }

  /**
   * Obtém todas as strings
   */
  getAll(): StringsData {
    if (!this.strings) {
      this.strings = this.getDefaultStrings();
    }
    return this.strings;
  }

  /**
   * Retorna strings padrão caso o ficheiro não seja carregado
   */
  private getDefaultStrings(): StringsData {
    return {
      app: {
        nome: 'Gestão de Tarefas',
        versao: '1.0.0'
      },
      mensagens: {
        sucesso: {
          salvo: 'Salvo com sucesso!',
          eliminado: 'Eliminado com sucesso!',
          atualizado: 'Atualizado com sucesso!'
        },
        erro: {
          geral: 'Ocorreu um erro. Tente novamente.',
          camposObrigatorios: 'Por favor, preencha todos os campos obrigatórios.',
          dataInvalida: 'Data inválida.',
          categoriaEmUso: 'Não é possível eliminar categoria com projetos associados.'
        },
        confirmacao: {
          eliminar: 'Tem certeza que deseja eliminar?',
          eliminarProjeto: 'Ao eliminar este projeto, todas as tarefas associadas serão eliminadas. Continuar?',
          eliminarTarefa: 'Tem certeza que deseja eliminar esta tarefa?'
        }
      },
      labels: {
        categorias: 'Categorias',
        projetos: 'Projetos',
        tarefas: 'Tarefas',
        calendario: 'Calendário',
        adicionar: 'Adicionar',
        editar: 'Editar',
        eliminar: 'Eliminar',
        salvar: 'Salvar',
        cancelar: 'Cancelar',
        nome: 'Nome',
        descricao: 'Descrição',
        dataLimite: 'Data Limite',
        imagem: 'Imagem',
        categoria: 'Categoria',
        projeto: 'Projeto',
        concluida: 'Concluída',
        pendente: 'Pendente',
        emAtraso: 'Em Atraso'
      }
    };
  }
}


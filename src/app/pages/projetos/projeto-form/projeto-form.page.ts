import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ProjetoService } from '../../../services/projeto.service';
import { CategoriaService } from '../../../services/categoria.service';
import { StringService } from '../../../services/string.service';
import { Projeto, ProjetoCreate } from '../../../models/projeto.model';
import { Categoria } from '../../../models/categoria.model';

/**
 * Página de formulário para adicionar/editar projeto
 * Utiliza ActivatedRoute para receber parâmetros
 */
@Component({
  selector: 'app-projeto-form',
  templateUrl: './projeto-form.page.html',
  styleUrls: ['./projeto-form.page.scss'],
  standalone: false
})
export class ProjetoFormPage implements OnInit {
  projeto: ProjetoCreate = {
    nome: '',
    categoriaId: '',
    descricao: ''
  };
  
  projetoId: string | null = null;
  isEditMode = false;
  loading = false;
  categorias: Categoria[] = [];

  constructor(
    private projetoService: ProjetoService,
    private categoriaService: CategoriaService,
    private stringService: StringService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    // Carrega categorias
    this.categorias = await this.categoriaService.getAll();
    
    // Verifica se está em modo de edição
    this.projetoId = this.activatedRoute.snapshot.paramMap.get('id');
    
    if (this.projetoId) {
      this.isEditMode = true;
      await this.carregarProjeto();
    } else {
      // Seleciona primeira categoria por padrão
      if (this.categorias.length > 0) {
        this.projeto.categoriaId = this.categorias[0].id;
      }
    }
  }

  /**
   * Carrega o projeto para edição
   */
  async carregarProjeto() {
    try {
      this.loading = true;
      const projeto = await this.projetoService.getById(this.projetoId!);
      
      if (projeto) {
        this.projeto = {
          nome: projeto.nome,
          categoriaId: projeto.categoriaId,
          descricao: projeto.descricao || ''
        };
      } else {
        await this.mostrarToast('Projeto não encontrado', 'danger');
        this.router.navigate(['/projetos']);
      }
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      await this.mostrarToast(this.getString('mensagens.erro.geral'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Valida o formulário
   */
  validarFormulario(): boolean {
    if (!this.projeto.nome || this.projeto.nome.trim() === '') {
      this.mostrarToast(this.getString('mensagens.erro.camposObrigatorios'), 'warning');
      return false;
    }
    if (!this.projeto.categoriaId) {
      this.mostrarToast('Por favor, selecione uma categoria', 'warning');
      return false;
    }
    return true;
  }

  /**
   * Salva o projeto (cria ou atualiza)
   */
  async salvar() {
    if (!this.validarFormulario()) {
      return;
    }

    try {
      this.loading = true;

      if (this.isEditMode) {
        await this.projetoService.update(this.projetoId!, this.projeto);
        await this.mostrarToast(this.getString('mensagens.sucesso.atualizado'), 'success');
      } else {
        await this.projetoService.create(this.projeto);
        await this.mostrarToast(this.getString('mensagens.sucesso.salvo'), 'success');
      }

      this.router.navigate(['/projetos']);
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      await this.mostrarToast(this.getString('mensagens.erro.geral'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Cancela e volta para a lista
   */
  cancelar() {
    this.router.navigate(['/projetos']);
  }

  /**
   * Obtém o nome da categoria
   */
  getNomeCategoria(categoriaId: string): string {
    const categoria = this.categorias.find(cat => cat.id === categoriaId);
    return categoria ? categoria.nome : 'Sem categoria';
  }

  /**
   * Obtém a categoria selecionada
   */
  getCategoriaSelecionada(): Categoria | undefined {
    return this.categorias.find(c => c.id === this.projeto.categoriaId);
  }

  /**
   * Obtém a cor da categoria selecionada
   */
  getCorCategoriaSelecionada(): string {
    const categoria = this.getCategoriaSelecionada();
    return categoria ? categoria.cor : '#92949c';
  }

  /**
   * Obtém o ícone da categoria selecionada
   */
  getIconeCategoriaSelecionada(): string {
    const categoria = this.getCategoriaSelecionada();
    return categoria ? categoria.icone : 'folder';
  }

  /**
   * Obtém uma string do StringService
   */
  getString(path: string): string {
    return this.stringService.get(path);
  }

  /**
   * Mostra um toast com mensagem
   */
  private async mostrarToast(mensagem: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}

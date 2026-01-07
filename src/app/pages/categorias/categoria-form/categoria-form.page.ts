import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { CategoriaService } from '../../../services/categoria.service';
import { StringService } from '../../../services/string.service';
import { Categoria, CategoriaCreate } from '../../../models/categoria.model';

/**
 * Ícones disponíveis para categorias
 */
const ICONES_DISPONIVEIS = [
  'school', 'briefcase', 'person', 'home', 'heart', 'star',
  'book', 'musical-notes', 'fitness', 'car', 'airplane',
  'restaurant', 'shirt', 'game-controller', 'pricetag'
];

/**
 * Cores predefinidas para categorias
 */
const CORES_PREDEFINIDAS = [
  '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336',
  '#00bcd4', '#ffeb3b', '#795548', '#607d8b', '#e91e63'
];

/**
 * Página de formulário para adicionar/editar categoria
 * Utiliza ActivatedRoute para receber parâmetros
 */
@Component({
  selector: 'app-categoria-form',
  templateUrl: './categoria-form.page.html',
  styleUrls: ['./categoria-form.page.scss'],
  standalone: false
})
export class CategoriaFormPage implements OnInit {
  categoria: CategoriaCreate = {
    nome: '',
    cor: CORES_PREDEFINIDAS[0],
    icone: ICONES_DISPONIVEIS[0]
  };
  
  categoriaId: string | null = null;
  isEditMode = false;
  loading = false;

  iconesDisponiveis = ICONES_DISPONIVEIS;
  coresPredefinidas = CORES_PREDEFINIDAS;

  constructor(
    private categoriaService: CategoriaService,
    private stringService: StringService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    // Verifica se está em modo de edição através do ActivatedRoute
    this.categoriaId = this.activatedRoute.snapshot.paramMap.get('id');
    
    if (this.categoriaId) {
      this.isEditMode = true;
      await this.carregarCategoria();
    }
  }

  /**
   * Carrega a categoria para edição
   */
  async carregarCategoria() {
    try {
      this.loading = true;
      const categoria = await this.categoriaService.getById(this.categoriaId!);
      
      if (categoria) {
        this.categoria = {
          nome: categoria.nome,
          cor: categoria.cor,
          icone: categoria.icone
        };
      } else {
        await this.mostrarToast('Categoria não encontrada', 'danger');
        this.router.navigate(['/categorias']);
      }
    } catch (error) {
      console.error('Erro ao carregar categoria:', error);
      await this.mostrarToast(this.getString('mensagens.erro.geral'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Valida o formulário
   */
  validarFormulario(): boolean {
    if (!this.categoria.nome || this.categoria.nome.trim() === '') {
      this.mostrarToast(this.getString('mensagens.erro.camposObrigatorios'), 'warning');
      return false;
    }
    return true;
  }

  /**
   * Salva a categoria (cria ou atualiza)
   */
  async salvar() {
    if (!this.validarFormulario()) {
      return;
    }

    try {
      this.loading = true;

      if (this.isEditMode) {
        await this.categoriaService.update(this.categoriaId!, this.categoria);
        await this.mostrarToast(this.getString('mensagens.sucesso.atualizado'), 'success');
      } else {
        await this.categoriaService.create(this.categoria);
        await this.mostrarToast(this.getString('mensagens.sucesso.salvo'), 'success');
      }

      this.router.navigate(['/categorias']);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      await this.mostrarToast(this.getString('mensagens.erro.geral'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Cancela e volta para a lista
   */
  cancelar() {
    this.router.navigate(['/categorias']);
  }

  /**
   * Seleciona um ícone
   */
  selecionarIcone(icone: string) {
    this.categoria.icone = icone;
  }

  /**
   * Seleciona uma cor
   */
  selecionarCor(cor: string) {
    this.categoria.cor = cor;
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

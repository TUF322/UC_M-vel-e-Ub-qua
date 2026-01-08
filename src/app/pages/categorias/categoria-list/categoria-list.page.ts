import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CategoriaService } from '../../../services/categoria.service';
import { StringService } from '../../../services/string.service';
import { Categoria } from '../../../models/categoria.model';

/**
 * Página de listagem de categorias
 * Permite visualizar, editar e eliminar categorias
 */
@Component({
  selector: 'app-categoria-list',
  templateUrl: './categoria-list.page.html',
  styleUrls: ['./categoria-list.page.scss'],
  standalone: false
})
export class CategoriaListPage implements OnInit {
  categorias: Categoria[] = [];
  loading = true;

  constructor(
    private categoriaService: CategoriaService,
    private stringService: StringService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.carregarCategorias();
  }

  /**
   * Recarrega dados quando a página é exibida
   */
  async ionViewWillEnter() {
    await this.carregarCategorias();
  }

  /**
   * Carrega todas as categorias
   */
  async carregarCategorias() {
    try {
      this.loading = true;
      const todasCategorias = await this.categoriaService.getAll();
      // Filtra apenas categorias válidas (com id, nome, cor e icone)
      this.categorias = todasCategorias
        .filter(cat => cat && cat.id && cat.nome && cat.cor && cat.icone)
        .filter((cat, index, self) =>
          index === self.findIndex(c => c.id === cat.id)
        );
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      await this.mostrarToast(this.getString('mensagens.erro.geral'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Navega para a página de adicionar categoria
   */
  adicionarCategoria() {
    this.router.navigate(['/categorias/nova']);
  }

  /**
   * Navega para a página de editar categoria
   */
  editarCategoria(categoria: Categoria) {
    this.router.navigate(['/categorias/editar', categoria.id]);
  }

  /**
   * Elimina uma categoria após confirmação
   */
  async eliminarCategoria(categoria: Categoria) {
    const alert = await this.alertController.create({
      header: this.getString('labels.eliminar'),
      message: `${this.getString('mensagens.confirmacao.eliminar')} "${categoria.nome}"?`,
      buttons: [
        {
          text: this.getString('labels.cancelar'),
          role: 'cancel'
        },
        {
          text: this.getString('labels.eliminar'),
          role: 'destructive',
          handler: async () => {
            try {
              await this.categoriaService.delete(categoria.id);
              await this.mostrarToast(this.getString('mensagens.sucesso.eliminado'), 'success');
              await this.carregarCategorias();
            } catch (error: any) {
              console.error('Erro ao eliminar categoria:', error);
              const mensagem = error.message || this.getString('mensagens.erro.geral');
              await this.mostrarToast(mensagem, 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Recarrega as categorias (pull-to-refresh)
   */
  async refresh(event: any) {
    await this.carregarCategorias();
    event.target.complete();
  }

  /**
   * Obtém uma string do StringService
   */
  getString(path: string): string {
    return this.stringService.get(path);
  }

  /**
   * Track by function para melhorar performance do ngFor
   */
  trackByCategoriaId(index: number, categoria: Categoria): string {
    return categoria.id;
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

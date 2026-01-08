import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, ActionSheetController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { TarefaService } from '../../../services/tarefa.service';
import { ProjetoService } from '../../../services/projeto.service';
import { StringService } from '../../../services/string.service';
import { Tarefa, TarefaCreate } from '../../../models/tarefa.model';
import { Projeto } from '../../../models/projeto.model';

/**
 * Página de formulário para adicionar/editar tarefa
 * Utiliza ActivatedRoute para receber parâmetros
 */
@Component({
  selector: 'app-tarefa-form',
  templateUrl: './tarefa-form.page.html',
  styleUrls: ['./tarefa-form.page.scss'],
  standalone: false
})
export class TarefaFormPage implements OnInit {
  tarefa: {
    titulo: string;
    descricao: string;
    dataLimite: string; // String para ion-datetime
    projetoId: string;
    imagem?: string;
  } = {
    titulo: '',
    descricao: '',
    dataLimite: new Date().toISOString().split('T')[0],
    projetoId: ''
  };
  
  tarefaId: string | null = null;
  projetoId: string | null = null;
  isEditMode = false;
  loading = false;
  projetos: Projeto[] = [];
  imagemPreview: string | null = null;
  dataMinima: string = '';
  dataMaxima: string = '';

  constructor(
    private tarefaService: TarefaService,
    private projetoService: ProjetoService,
    private stringService: StringService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {}

  async ngOnInit() {
    // Define datas mínima e máxima para o datetime
    const hoje = new Date();
    this.dataMinima = hoje.toISOString().split('T')[0];
    const umAnoDepois = new Date();
    umAnoDepois.setFullYear(hoje.getFullYear() + 1);
    this.dataMaxima = umAnoDepois.toISOString().split('T')[0];

    // Carrega projetos
    this.projetos = await this.projetoService.getAll();
    
    // Obtém projetoId da rota (se houver)
    this.projetoId = this.activatedRoute.snapshot.paramMap.get('projetoId');
    
    // Verifica se está em modo de edição
    this.tarefaId = this.activatedRoute.snapshot.paramMap.get('id');
    
    if (this.tarefaId) {
      this.isEditMode = true;
      await this.carregarTarefa();
    } else {
      // Define projetoId se fornecido na rota
      if (this.projetoId) {
        this.tarefa.projetoId = this.projetoId;
      } else if (this.projetos.length > 0) {
        // Seleciona primeiro projeto por padrão
        this.tarefa.projetoId = this.projetos[0].id;
      }
    }
  }

  /**
   * Carrega a tarefa para edição
   */
  async carregarTarefa() {
    try {
      this.loading = true;
      const tarefa = await this.tarefaService.getById(this.tarefaId!);
      
      if (tarefa) {
        this.tarefa = {
          titulo: tarefa.titulo,
          descricao: tarefa.descricao,
          dataLimite: tarefa.dataLimite.toISOString().split('T')[0], // Converte para string
          projetoId: tarefa.projetoId,
          imagem: tarefa.imagem
        };
        this.imagemPreview = tarefa.imagem || null;
      } else {
        await this.mostrarToast('Tarefa não encontrada', 'danger');
        this.router.navigate(['/projetos']);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefa:', error);
      await this.mostrarToast(this.getString('mensagens.erro.geral'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Valida o formulário
   */
  validarFormulario(): boolean {
    if (!this.tarefa.titulo || this.tarefa.titulo.trim() === '') {
      this.mostrarToast(this.getString('mensagens.erro.camposObrigatorios'), 'warning');
      return false;
    }
    if (!this.tarefa.projetoId) {
      this.mostrarToast('Por favor, selecione um projeto', 'warning');
      return false;
    }
    if (!this.tarefa.dataLimite) {
      this.mostrarToast('Por favor, selecione uma data limite', 'warning');
      return false;
    }
    
    // Valida se a data não é no passado
    const dataLimite = new Date(this.tarefa.dataLimite);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataLimite < hoje && !this.isEditMode) {
      this.mostrarToast('A data limite não pode ser no passado', 'warning');
      return false;
    }
    
    return true;
  }

  /**
   * Salva a tarefa (cria ou atualiza)
   */
  async salvar() {
    if (!this.validarFormulario()) {
      return;
    }

    try {
      this.loading = true;

      // Converte data para Date object
      const tarefaData: TarefaCreate = {
        ...this.tarefa,
        dataLimite: new Date(this.tarefa.dataLimite),
        imagem: this.imagemPreview || undefined
      };

      if (this.isEditMode) {
        await this.tarefaService.update(this.tarefaId!, tarefaData);
        await this.mostrarToast(this.getString('mensagens.sucesso.atualizado'), 'success');
      } else {
        await this.tarefaService.create(tarefaData);
        await this.mostrarToast(this.getString('mensagens.sucesso.salvo'), 'success');
      }

      // Navega de volta
      if (this.tarefa.projetoId) {
        this.router.navigate(['/projetos/detalhes', this.tarefa.projetoId]);
      } else {
        this.router.navigate(['/projetos']);
      }
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      await this.mostrarToast(this.getString('mensagens.erro.geral'), 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Cancela e volta
   */
  cancelar() {
    if (this.tarefa.projetoId) {
      this.router.navigate(['/projetos/detalhes', this.tarefa.projetoId]);
    } else {
      this.router.navigate(['/projetos']);
    }
  }

  /**
   * Captura foto usando a câmera
   */
  async capturarFoto() {
    try {
      if (!Capacitor.isNativePlatform()) {
        await this.mostrarToast('Captura de foto só funciona em dispositivos nativos', 'warning');
        return;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      this.imagemPreview = `data:image/jpeg;base64,${image.base64String}`;
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      // Usuário cancelou ou erro
    }
  }

  /**
   * Seleciona imagem da galeria
   */
  async selecionarImagem() {
    try {
      if (!Capacitor.isNativePlatform()) {
        // No browser, usa input file
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event: any) => {
          const file = event.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
              this.imagemPreview = e.target.result;
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        return;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });

      this.imagemPreview = `data:image/jpeg;base64,${image.base64String}`;
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
    }
  }

  /**
   * Remove a imagem
   */
  removerImagem() {
    this.imagemPreview = null;
    this.tarefa.imagem = undefined;
  }

  /**
   * Mostra opções para imagem
   */
  async mostrarOpcoesImagem() {
    const buttons: any[] = [
      {
        text: 'Câmera',
        icon: 'camera',
        handler: () => {
          this.capturarFoto();
        }
      },
      {
        text: 'Galeria',
        icon: 'images',
        handler: () => {
          this.selecionarImagem();
        }
      }
    ];

    if (this.imagemPreview) {
      buttons.push({
        text: 'Remover Imagem',
        icon: 'trash',
        role: 'destructive',
        handler: () => {
          this.removerImagem();
        }
      });
    }

    buttons.push({
      text: 'Cancelar',
      icon: 'close',
      role: 'cancel'
    });

    const actionSheet = await this.actionSheetController.create({
      header: 'Selecionar Imagem',
      buttons
    });

    await actionSheet.present();
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

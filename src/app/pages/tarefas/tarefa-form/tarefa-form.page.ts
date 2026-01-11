import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, ActionSheetController, AlertController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { TarefaService } from '../../../services/tarefa.service';
import { ProjetoService } from '../../../services/projeto.service';
import { StringService } from '../../../services/string.service';
import { Tarefa, TarefaCreate, ConfiguracaoNotificacao } from '../../../models/tarefa.model';
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
    horaInicio: string; // String para ion-datetime (HH:mm)
    horaFim: string; // String para ion-datetime (HH:mm)
    projetoId: string;
    imagem?: string;
  } = {
    titulo: '',
    descricao: '',
    dataLimite: new Date().toISOString().split('T')[0],
    horaInicio: this.obterHoraAtual(),
    horaFim: '',
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
  
  // Configuração de notificação
  notificarAtivo: boolean = false;
  tipoNotificacao: '30min' | '1hora' | '1dia' | 'custom' = '30min';
  dataHoraCustom: string = '';
  horaCustom: string = '';
  mostrarConfigCustom = false;

  constructor(
    private tarefaService: TarefaService,
    private projetoService: ProjetoService,
    private stringService: StringService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController
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
      // Define hora de início como hora atual por padrão
      this.tarefa.horaInicio = this.obterHoraAtual();
    }
  }

  /**
   * Obtém a hora atual no formato ISO para ion-datetime
   */
  obterHoraAtual(): string {
    const agora = new Date();
    // Formato ISO para ion-datetime (YYYY-MM-DDTHH:mm:ss.sssZ)
    return agora.toISOString();
  }

  /**
   * Converte string de hora (HH:mm ou ISO) para formato ISO para ion-datetime
   */
  converterHoraParaISO(hora: string | Date): string {
    if (!hora) return this.obterHoraAtual();
    
    if (hora instanceof Date) {
      return hora.toISOString();
    }
    
    // Se já está em formato ISO, retorna
    if (hora.includes('T') || hora.includes('Z')) {
      return hora;
    }
    
    // Se está em formato HH:mm, converte para ISO
    if (hora.includes(':')) {
      const [h, m] = hora.split(':').map(Number);
      const data = new Date();
      data.setHours(h, m, 0, 0);
      return data.toISOString();
    }
    
    return this.obterHoraAtual();
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
          horaInicio: tarefa.horaInicio ? this.converterHoraParaISO(tarefa.horaInicio) : this.obterHoraAtual(),
          horaFim: tarefa.horaFim ? this.converterHoraParaISO(tarefa.horaFim) : '',
          projetoId: tarefa.projetoId,
          imagem: tarefa.imagem
        };
        this.imagemPreview = tarefa.imagem || null;
        
        // Carrega configuração de notificação se existir
        if (tarefa.configuracaoNotificacao) {
          this.notificarAtivo = true;
          this.tipoNotificacao = tarefa.configuracaoNotificacao.tipo;
          if (tarefa.configuracaoNotificacao.tipo === 'custom' && tarefa.configuracaoNotificacao.dataHoraCustom) {
            const dataCustom = new Date(tarefa.configuracaoNotificacao.dataHoraCustom);
            this.dataHoraCustom = dataCustom.toISOString().split('T')[0];
            this.horaCustom = this.formatarHora(dataCustom);
            this.mostrarConfigCustom = true;
          }
        }
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
   * Formata Date para string HH:mm
   */
  formatarHora(data: Date): string {
    const horas = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
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

    // Valida hora de fim se fornecida
    if (this.tarefa.horaFim && this.tarefa.horaInicio) {
      const dataInicio = new Date(this.tarefa.horaInicio);
      const dataFim = new Date(this.tarefa.horaFim);
      
      if (dataFim <= dataInicio) {
        this.mostrarToast('A hora de fim deve ser posterior à hora de início', 'warning');
        return false;
      }
    }

    // Valida configuração de notificação se ativada
    if (this.notificarAtivo) {
      // Valida tipo custom - precisa de data e hora customizadas
      if (this.tipoNotificacao === 'custom') {
        if (!this.dataHoraCustom || !this.horaCustom) {
          this.mostrarToast('Por favor, selecione data e hora para notificação custom', 'warning');
          return false;
        }
      }
      
      // Valida tipos que precisam de horaInicio (30min, 1hora, 1dia)
      if (this.tipoNotificacao === '30min' || this.tipoNotificacao === '1hora' || this.tipoNotificacao === '1dia') {
        if (!this.tarefa.horaInicio) {
          this.mostrarToast(`Para notificação "${this.tipoNotificacao}", é necessário definir a hora de início`, 'warning');
          return false;
        }
      }
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

      // Converte data e horas para Date objects
      const dataLimite = new Date(this.tarefa.dataLimite);
      
      // Cria hora de início combinando data limite com hora selecionada
      let horaInicio: Date | undefined;
      if (this.tarefa.horaInicio) {
        const dataHoraInicio = new Date(this.tarefa.horaInicio);
        horaInicio = new Date(dataLimite);
        horaInicio.setHours(dataHoraInicio.getHours(), dataHoraInicio.getMinutes(), 0, 0);
      }

      // Cria hora de fim combinando data limite com hora selecionada
      let horaFim: Date | undefined;
      if (this.tarefa.horaFim) {
        const dataHoraFim = new Date(this.tarefa.horaFim);
        horaFim = new Date(dataLimite);
        horaFim.setHours(dataHoraFim.getHours(), dataHoraFim.getMinutes(), 0, 0);
      }

      // Cria configuração de notificação apenas se ativada
      let configuracaoNotificacao: ConfiguracaoNotificacao | undefined;
      if (this.notificarAtivo && this.tipoNotificacao) {
        // Para tipo custom, só cria se dataHoraCustom e horaCustom estiverem definidos
        if (this.tipoNotificacao === 'custom') {
          if (this.dataHoraCustom && this.horaCustom) {
            const [hora, minuto] = this.horaCustom.split(':').map(Number);
            const dataCustom = new Date(this.dataHoraCustom);
            dataCustom.setHours(hora, minuto, 0, 0);
            configuracaoNotificacao = {
              tipo: this.tipoNotificacao,
              dataHoraCustom: dataCustom
            };
          }
          // Se tipo é custom mas não tem dataHoraCustom definido, não cria configuracaoNotificacao
          // (a validação já impediu salvar, mas garantimos que não cria objeto inválido)
        } else {
          // Para outros tipos (30min, 1hora, 1dia), cria normalmente
          configuracaoNotificacao = {
            tipo: this.tipoNotificacao
          };
        }
      }

      const tarefaData: TarefaCreate = {
        titulo: this.tarefa.titulo,
        descricao: this.tarefa.descricao,
        dataLimite: dataLimite,
        horaInicio: horaInicio,
        horaFim: horaFim,
        configuracaoNotificacao: configuracaoNotificacao,
        projetoId: this.tarefa.projetoId,
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
   * Altera o tipo de notificação
   */
  alterarTipoNotificacao() {
    if (!this.notificarAtivo) {
      this.mostrarConfigCustom = false;
      this.dataHoraCustom = '';
      this.horaCustom = '';
      return;
    }
    this.mostrarConfigCustom = this.tipoNotificacao === 'custom';
    if (!this.mostrarConfigCustom) {
      this.dataHoraCustom = '';
      this.horaCustom = '';
    }
  }

  /**
   * Formata hora para exibição (HH:mm)
   */
  formatarHoraParaExibicao(hora: string | undefined): string {
    if (!hora) return '';
    try {
      const data = new Date(hora);
      const horas = data.getHours().toString().padStart(2, '0');
      const minutos = data.getMinutes().toString().padStart(2, '0');
      return `${horas}:${minutos}`;
    } catch (e) {
      return hora;
    }
  }

  /**
   * Abre seletor de hora usando Alert
   */
  async abrirSeletorHora(tipo: 'inicio' | 'fim') {
    const horaAtual = tipo === 'inicio' ? this.tarefa.horaInicio : this.tarefa.horaFim;
    let horaSelecionada = horaAtual || this.obterHoraAtual();
    const horaFormatada = this.formatarHoraParaExibicao(horaSelecionada);

    const alert = await this.alertController.create({
      header: tipo === 'inicio' ? 'Selecionar Hora de Início' : 'Selecionar Hora de Fim',
      inputs: [
        {
          name: 'hora',
          type: 'time',
          value: horaFormatada
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: (data) => {
            if (data.hora) {
              // Converte HH:mm para ISO
              const [hora, minuto] = data.hora.split(':').map(Number);
              const dataHora = new Date();
              dataHora.setHours(hora, minuto, 0, 0);
              
              if (tipo === 'inicio') {
                this.tarefa.horaInicio = dataHora.toISOString();
              } else {
                this.tarefa.horaFim = dataHora.toISOString();
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Abre seletor de data custom para notificação
   */
  async abrirSeletorDataCustom() {
    const alert = await this.alertController.create({
      header: 'Selecionar Data da Notificação',
      inputs: [
        {
          name: 'data',
          type: 'date',
          value: this.dataHoraCustom || new Date().toISOString().split('T')[0]
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: (data) => {
            if (data.data) {
              this.dataHoraCustom = data.data;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Abre seletor de hora custom para notificação
   */
  async abrirSeletorHoraCustom() {
    const horaAtual = this.horaCustom || this.obterHoraAtual();
    const horaFormatada = this.formatarHoraParaExibicao(horaAtual);

    const alert = await this.alertController.create({
      header: 'Selecionar Hora da Notificação',
      inputs: [
        {
          name: 'hora',
          type: 'time',
          value: horaFormatada
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: (data) => {
            if (data.hora) {
              // Converte HH:mm para ISO
              const [hora, minuto] = data.hora.split(':').map(Number);
              const dataHora = new Date();
              dataHora.setHours(hora, minuto, 0, 0);
              this.horaCustom = dataHora.toISOString();
            }
          }
        }
      ]
    });

    await alert.present();
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

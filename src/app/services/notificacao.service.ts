import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Tarefa } from '../models/tarefa.model';

/**
 * Configuração de notificações
 */
interface NotificacaoConfig {
  /** Dias antes da data limite para enviar notificação */
  diasAntes: number[];
  /** Horário do dia para enviar notificações (formato: HH:mm) */
  horario: string;
}

/**
 * Serviço de Notificações
 * Gerencia notificações locais para tarefas próximas da data limite
 */
@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  private permissaoConcedida = false;
  private config: NotificacaoConfig = {
    diasAntes: [3, 1, 0], // Notifica 3 dias antes, 1 dia antes e no dia
    horario: '09:00' // 9h da manhã
  };

  constructor() {
    this.verificarPermissao();
  }

  /**
   * Verifica e solicita permissão para notificações
   * @returns Promise<boolean> - true se permissão concedida
   */
  async verificarPermissao(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Notificações disponíveis apenas em dispositivos nativos');
      return false;
    }

    if (!Capacitor.isPluginAvailable('LocalNotifications')) {
      console.warn('Plugin LocalNotifications não disponível');
      return false;
    }

    try {
      const status = await LocalNotifications.checkPermissions();
      
      if (status.display === 'granted') {
        this.permissaoConcedida = true;
        return true;
      }

      // Solicita permissão
      const request = await LocalNotifications.requestPermissions();
      this.permissaoConcedida = request.display === 'granted';
      
      if (this.permissaoConcedida) {
        console.log('Permissão de notificações concedida');
      } else {
        console.warn('Permissão de notificações negada');
      }

      return this.permissaoConcedida;
    } catch (error) {
      console.error('Erro ao verificar permissão de notificações:', error);
      return false;
    }
  }

  /**
   * Agenda notificações para uma tarefa
   * Usa configuração personalizada da tarefa se disponível, senão usa padrão
   * @param tarefa - Tarefa para agendar notificações
   */
  async agendarNotificacoesTarefa(tarefa: Tarefa): Promise<void> {
    // Não agenda se a tarefa estiver concluída
    if (tarefa.concluida) {
      return;
    }

    // Verifica permissão
    if (!this.permissaoConcedida) {
      const temPermissao = await this.verificarPermissao();
      if (!temPermissao) {
        return;
      }
    }

    // Cancela notificações antigas desta tarefa
    await this.cancelarNotificacoesTarefa(tarefa.id);

    // Se a tarefa tem configuração personalizada, usa ela
    if (tarefa.configuracaoNotificacao) {
      await this.agendarNotificacaoPersonalizada(tarefa);
      return;
    }

    // Caso contrário, usa configuração padrão (compatibilidade com tarefas antigas)
    const dataLimite = new Date(tarefa.dataLimite);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Se a data limite já passou, não agenda
    if (dataLimite < hoje) {
      return;
    }

    const notificacoes = [];

    for (const diasAntes of this.config.diasAntes) {
      const dataNotificacao = new Date(dataLimite);
      dataNotificacao.setDate(dataLimite.getDate() - diasAntes);
      dataNotificacao.setHours(0, 0, 0, 0);

      // Se a data de notificação já passou, ignora
      if (dataNotificacao < hoje) {
        continue;
      }

      // Define horário da notificação
      const [hora, minuto] = this.config.horario.split(':').map(Number);
      dataNotificacao.setHours(hora, minuto, 0, 0);

      // Se a hora já passou hoje, agenda para amanhã
      if (diasAntes === 0 && dataNotificacao < new Date()) {
        dataNotificacao.setDate(dataNotificacao.getDate() + 1);
      }

      const id = this.gerarIdNotificacao(tarefa.id, diasAntes);
      
      let titulo = '';
      let corpo = '';

      if (diasAntes === 0) {
        titulo = 'Tarefa vence hoje!';
        corpo = `${tarefa.titulo} vence hoje.`;
      } else if (diasAntes === 1) {
        titulo = 'Tarefa vence amanhã';
        corpo = `${tarefa.titulo} vence amanhã.`;
      } else {
        titulo = `Tarefa vence em ${diasAntes} dias`;
        corpo = `${tarefa.titulo} vence em ${diasAntes} dias.`;
      }

      notificacoes.push({
        id,
        title: titulo,
        body: corpo,
        schedule: { at: dataNotificacao },
        sound: 'default',
        attachments: undefined,
        actionTypeId: '',
        extra: {
          tarefaId: tarefa.id,
          tipo: 'tarefa_vencimento'
        }
      });
    }

    if (notificacoes.length > 0) {
      try {
        await LocalNotifications.schedule({ notifications: notificacoes });
        console.log(`Notificações agendadas para tarefa ${tarefa.id}:`, notificacoes.length);
      } catch (error) {
        console.error('Erro ao agendar notificações:', error);
      }
    }
  }

  /**
   * Agenda notificação usando configuração personalizada da tarefa
   * @param tarefa - Tarefa com configuração personalizada
   */
  private async agendarNotificacaoPersonalizada(tarefa: Tarefa): Promise<void> {
    if (!tarefa.configuracaoNotificacao || !tarefa.horaInicio) {
      return;
    }

    const config = tarefa.configuracaoNotificacao;
    const horaInicio = new Date(tarefa.horaInicio);
    let dataNotificacao: Date;

    // Calcula data/hora da notificação baseado no tipo
    switch (config.tipo) {
      case '30min':
        dataNotificacao = new Date(horaInicio);
        dataNotificacao.setMinutes(dataNotificacao.getMinutes() - 30);
        break;
      case '1hora':
        dataNotificacao = new Date(horaInicio);
        dataNotificacao.setHours(dataNotificacao.getHours() - 1);
        break;
      case '1dia':
        dataNotificacao = new Date(horaInicio);
        dataNotificacao.setDate(dataNotificacao.getDate() - 1);
        break;
      case 'custom':
        if (!config.dataHoraCustom) {
          return;
        }
        dataNotificacao = new Date(config.dataHoraCustom);
        break;
      default:
        // Fallback para 30min
        dataNotificacao = new Date(horaInicio);
        dataNotificacao.setMinutes(dataNotificacao.getMinutes() - 30);
    }

    // Verifica se a data de notificação já passou
    if (dataNotificacao < new Date()) {
      console.log(`Data de notificação já passou para tarefa ${tarefa.id}`);
      return;
    }

    // Determina som do alarme
    let sound: string = 'default';
    if (config.somAlarme === 'alarm') {
      sound = 'alarm';
    } else if (config.somAlarme === 'notification') {
      sound = 'notification';
    }

    const id = this.gerarIdNotificacao(tarefa.id, 0);
    
    const notificacao = {
      id,
      title: tarefa.titulo,
      body: `Tarefa: ${tarefa.titulo}`,
      schedule: { at: dataNotificacao },
      sound: sound,
      attachments: undefined,
      actionTypeId: '',
      extra: {
        tarefaId: tarefa.id,
        tipo: 'tarefa_personalizada'
      }
    };

    try {
      await LocalNotifications.schedule({ notifications: [notificacao] });
      console.log(`Notificação personalizada agendada para tarefa ${tarefa.id} em ${dataNotificacao.toISOString()}`);
    } catch (error) {
      console.error('Erro ao agendar notificação personalizada:', error);
    }
  }

  /**
   * Cancela todas as notificações de uma tarefa
   * @param tarefaId - ID da tarefa
   */
  async cancelarNotificacoesTarefa(tarefaId: string): Promise<void> {
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('LocalNotifications')) {
      return;
    }

    try {
      const ids: number[] = [];
      
      // Gera IDs de todas as notificações possíveis desta tarefa
      // Inclui notificações padrão (por dias antes) e personalizada (id base)
      for (const diasAntes of this.config.diasAntes) {
        ids.push(this.gerarIdNotificacao(tarefaId, diasAntes));
      }
      // Adiciona ID base para notificações personalizadas
      ids.push(this.gerarIdNotificacao(tarefaId, 0));

      // Converte para o formato esperado
      const notifications = ids.map(id => ({ id }));
      await LocalNotifications.cancel({ notifications });
      console.log(`Notificações canceladas para tarefa ${tarefaId}`);
    } catch (error) {
      console.error('Erro ao cancelar notificações:', error);
    }
  }

  /**
   * Agenda notificações para todas as tarefas pendentes
   * Útil para inicializar notificações ou reconfigurar
   * @param tarefas - Array de tarefas
   */
  async agendarNotificacoesTodasTarefas(tarefas: Tarefa[]): Promise<void> {
    if (!this.permissaoConcedida) {
      const temPermissao = await this.verificarPermissao();
      if (!temPermissao) {
        return;
      }
    }

    // Cancela todas as notificações existentes
    await this.cancelarTodasNotificacoes();

    // Agenda notificações para cada tarefa pendente
    for (const tarefa of tarefas) {
      if (!tarefa.concluida) {
        await this.agendarNotificacoesTarefa(tarefa);
      }
    }

    console.log('Notificações agendadas para todas as tarefas pendentes');
  }

  /**
   * Cancela todas as notificações
   */
  async cancelarTodasNotificacoes(): Promise<void> {
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('LocalNotifications')) {
      return;
    }

    try {
      const pendentes = await LocalNotifications.getPending();
      if (pendentes && pendentes.notifications.length > 0) {
        const notifications = pendentes.notifications.map(n => ({ id: n.id }));
        await LocalNotifications.cancel({ notifications });
        console.log('Todas as notificações foram canceladas');
      }
    } catch (error) {
      console.error('Erro ao cancelar todas as notificações:', error);
    }
  }

  /**
   * Atualiza a configuração de notificações
   * @param config - Nova configuração
   */
  atualizarConfiguracao(config: Partial<NotificacaoConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('Configuração de notificações atualizada:', this.config);
  }

  /**
   * Obtém a configuração atual
   * @returns Configuração atual
   */
  getConfiguracao(): NotificacaoConfig {
    return { ...this.config };
  }

  /**
   * Gera um ID único para a notificação baseado no ID da tarefa e dias antes
   * @param tarefaId - ID da tarefa
   * @param diasAntes - Dias antes da data limite
   * @returns ID numérico da notificação
   */
  private gerarIdNotificacao(tarefaId: string, diasAntes: number): number {
    // Usa hash simples do ID da tarefa + dias antes
    let hash = 0;
    for (let i = 0; i < tarefaId.length; i++) {
      const char = tarefaId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Combina com dias antes (multiplica por 1000 para evitar colisões)
    return Math.abs(hash * 1000 + diasAntes);
  }
}


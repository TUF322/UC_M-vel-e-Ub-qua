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
      console.log('Status de permissão de notificações:', status);
      
      if (status.display === 'granted') {
        this.permissaoConcedida = true;
        console.log('Permissão de notificações já concedida');
        return true;
      }

      // Solicita permissão
      console.log('Solicitando permissão de notificações...');
      const request = await LocalNotifications.requestPermissions();
      this.permissaoConcedida = request.display === 'granted';
      
      if (this.permissaoConcedida) {
        console.log('✅ Permissão de notificações concedida');
      } else {
        console.warn('❌ Permissão de notificações negada. Status:', request.display);
      }

      return this.permissaoConcedida;
    } catch (error) {
      console.error('❌ Erro ao verificar permissão de notificações:', error);
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
        console.log(`✅ Notificações agendadas para tarefa ${tarefa.id}:`, notificacoes.length);
        console.log('Detalhes das notificações:', notificacoes.map(n => ({
          id: n.id,
          title: n.title,
          schedule: n.schedule
        })));
      } catch (error) {
        console.error('❌ Erro ao agendar notificações:', error);
        console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
      }
    } else {
      console.log(`⚠️ Nenhuma notificação a agendar para tarefa ${tarefa.id}`);
    }
  }

  /**
   * Agenda notificação usando configuração personalizada da tarefa
   * @param tarefa - Tarefa com configuração personalizada
   */
  private async agendarNotificacaoPersonalizada(tarefa: Tarefa): Promise<void> {
    // Verifica se tem configuração de notificação
    if (!tarefa.configuracaoNotificacao) {
      console.log(`Sem configuração de notificação para tarefa ${tarefa.id}`);
      return;
    }

    const config = tarefa.configuracaoNotificacao;
    let dataNotificacao: Date | undefined;

    // Calcula data/hora da notificação baseado no tipo
    switch (config.tipo) {
      case '30min':
        if (!tarefa.horaInicio) {
          console.log(`Tipo "30min" sem horaInicio para tarefa ${tarefa.id} - não agendando`);
          return;
        }
        dataNotificacao = new Date(tarefa.horaInicio);
        dataNotificacao.setMinutes(dataNotificacao.getMinutes() - 30);
        break;
      case '1hora':
        if (!tarefa.horaInicio) {
          console.log(`Tipo "1hora" sem horaInicio para tarefa ${tarefa.id} - não agendando`);
          return;
        }
        dataNotificacao = new Date(tarefa.horaInicio);
        dataNotificacao.setHours(dataNotificacao.getHours() - 1);
        break;
      case '1dia':
        if (!tarefa.horaInicio) {
          console.log(`Tipo "1dia" sem horaInicio para tarefa ${tarefa.id} - não agendando`);
          return;
        }
        dataNotificacao = new Date(tarefa.horaInicio);
        dataNotificacao.setDate(dataNotificacao.getDate() - 1);
        break;
      case 'custom':
        if (!config.dataHoraCustom || config.dataHoraCustom === null || config.dataHoraCustom === undefined) {
          console.log(`Tipo "custom" sem dataHoraCustom válido para tarefa ${tarefa.id} - não agendando`);
          console.log(`Config completa:`, JSON.stringify(config, null, 2));
          return;
        }
        dataNotificacao = new Date(config.dataHoraCustom);
        // Verifica se a data é válida após conversão
        if (isNaN(dataNotificacao.getTime())) {
          console.log(`Tipo "custom" com dataHoraCustom inválido para tarefa ${tarefa.id} - não agendando`);
          console.log(`dataHoraCustom valor:`, config.dataHoraCustom);
          console.log(`dataHoraCustom tipo:`, typeof config.dataHoraCustom);
          return;
        }
        break;
      default:
        console.log(`Tipo de notificação desconhecido "${config.tipo}" para tarefa ${tarefa.id} - não agendando`);
        return;
    }

    // Verifica se dataNotificacao foi definida corretamente
    if (!dataNotificacao || isNaN(dataNotificacao.getTime())) {
      console.log(`Data de notificação inválida para tarefa ${tarefa.id} - não agendando`);
      return;
    }

    // Verifica se a data de notificação já passou
    if (dataNotificacao < new Date()) {
      console.log(`Data de notificação já passou para tarefa ${tarefa.id}`);
      return;
    }

    const id = this.gerarIdNotificacao(tarefa.id, 0);
    
    const notificacao = {
      id,
      title: tarefa.titulo,
      body: `Tarefa: ${tarefa.titulo}`,
      schedule: { at: dataNotificacao },
      sound: 'default',
      attachments: undefined,
      actionTypeId: '',
      extra: {
        tarefaId: tarefa.id,
        tipo: 'tarefa_personalizada'
      }
    };

    try {
      await LocalNotifications.schedule({ notifications: [notificacao] });
      console.log(`✅ Notificação personalizada agendada para tarefa ${tarefa.id}`);
      console.log(`Data/hora agendada: ${dataNotificacao.toLocaleString('pt-PT')}`);
      console.log(`Tipo: ${config.tipo}`);
    } catch (error) {
      console.error('❌ Erro ao agendar notificação personalizada:', error);
      console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
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
   * @returns ID numérico da notificação (int válido Java: máximo 2147483647)
   */
  private gerarIdNotificacao(tarefaId: string, diasAntes: number): number {
    // Usa hash simples do ID da tarefa
    let hash = 0;
    for (let i = 0; i < tarefaId.length; i++) {
      const char = tarefaId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Usa apenas uma parte do hash (mod 100000 para garantir números menores)
    // Multiplica por 10 e adiciona diasAntes (0-9) para garantir unicidade
    const hashLimitado = Math.abs(hash) % 100000; // Limita a 100000
    const id = hashLimitado * 10 + (diasAntes % 10); // Resultado máximo: 999999 * 10 + 9 = 9999999
    // Garante que está dentro do limite de int Java (máximo 2147483647)
    return Math.min(Math.max(id, 1), 2147483647);
  }
}


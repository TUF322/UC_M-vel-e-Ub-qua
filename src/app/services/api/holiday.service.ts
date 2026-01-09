import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ConfigService } from '../config.service';
import { Holiday, HolidayResponse } from '../../models/api.models';

/**
 * Serviço para integração com Holiday API (date.nager.at)
 * Fornece feriados públicos configuráveis por país
 */
@Injectable({
  providedIn: 'root'
})
export class HolidayService {
  private readonly BASE_URL = 'https://date.nager.at/api/v3';

  constructor(
    private apiService: ApiService,
    private configService: ConfigService
  ) {}

  /**
   * Obtém feriados públicos de um país e ano
   * Usa configuração salva se countryCode não for fornecido
   * @param year Ano (padrão: ano atual)
   * @param countryCode Código do país ISO 3166-1 alpha-2 (opcional, usa configuração se não fornecido)
   * @returns Promise com array de feriados
   */
  async getHolidays(year: number = new Date().getFullYear(), countryCode?: string): Promise<Holiday[]> {
    try {
      // Usa configuração salva se não fornecido
      if (!countryCode) {
        const config = await this.configService.getConfig();
        countryCode = config.holidayCountry;
      }

      const url = `${this.BASE_URL}/PublicHolidays/${year}/${countryCode}`;
      // Cache de 1 dia (feriados não mudam durante o ano)
      const response = await this.apiService.get<HolidayResponse>(url, true, 24 * 60 * 60 * 1000);
      
      return response || [];
    } catch (error) {
      console.error('[HolidayService] Erro ao obter feriados:', error);
      return [];
    }
  }

  /**
   * Obtém feriados para múltiplos anos
   * Útil para carregar feriados do ano anterior, atual e próximo
   * Usa configuração salva se countryCode não for fornecido
   */
  async getHolidaysRange(startYear: number, endYear: number, countryCode?: string): Promise<Map<number, Holiday[]>> {
    const holidaysMap = new Map<number, Holiday[]>();
    
    // Usa configuração salva se não fornecido
    if (!countryCode) {
      const config = await this.configService.getConfig();
      countryCode = config.holidayCountry;
    }
    
    for (let year = startYear; year <= endYear; year++) {
      const holidays = await this.getHolidays(year, countryCode);
      holidaysMap.set(year, holidays);
    }
    
    return holidaysMap;
  }

  /**
   * Verifica se uma data é feriado
   * @param date Data a verificar
   * @param holidays Array de feriados (opcional, se não fornecido busca automaticamente)
   * @returns True se for feriado
   */
  async isHoliday(date: Date, holidays?: Holiday[]): Promise<boolean> {
    const year = date.getFullYear();
    const dateStr = this.formatDate(date);
    
    if (!holidays) {
      holidays = await this.getHolidays(year);
    }
    
    return holidays.some(holiday => holiday.date === dateStr);
  }

  /**
   * Obtém o nome do feriado para uma data
   * @param date Data a verificar
   * @param holidays Array de feriados (opcional)
   * @returns Nome do feriado ou null
   */
  async getHolidayName(date: Date, holidays?: Holiday[]): Promise<string | null> {
    const year = date.getFullYear();
    const dateStr = this.formatDate(date);
    
    if (!holidays) {
      holidays = await this.getHolidays(year);
    }
    
    const holiday = holidays.find(h => h.date === dateStr);
    return holiday ? holiday.localName : null;
  }

  /**
   * Formata data como YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}


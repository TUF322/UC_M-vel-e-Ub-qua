import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

/**
 * Interface para configurações da aplicação
 */
export interface AppConfig {
  weatherCity: string; // Cidade para API de clima
  weatherCountry: string; // Código do país para API de clima (ex: 'PT')
  holidayCountry: string; // Código do país para API de feriados (ex: 'PT')
}

/**
 * Valores padrão das configurações
 */
const DEFAULT_CONFIG: AppConfig = {
  weatherCity: 'Lisbon',
  weatherCountry: 'PT',
  holidayCountry: 'PT'
};

/**
 * Chave de armazenamento
 */
const STORAGE_KEY = 'app_config';

/**
 * Serviço para gestão de configurações da aplicação
 * Persiste configurações usando Ionic Storage
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig | null = null;

  constructor(private storageService: StorageService) {}

  /**
   * Inicializa o serviço carregando configurações salvas
   */
  async initialize(): Promise<void> {
    await this.loadConfig();
  }

  /**
   * Carrega configurações do Storage
   */
  private async loadConfig(): Promise<void> {
    try {
      const saved = await this.storageService.get(STORAGE_KEY);
      if (saved) {
        this.config = { ...DEFAULT_CONFIG, ...saved };
      } else {
        this.config = { ...DEFAULT_CONFIG };
        await this.saveConfig();
      }
    } catch (error) {
      console.error('[ConfigService] Erro ao carregar configurações:', error);
      this.config = { ...DEFAULT_CONFIG };
    }
  }

  /**
   * Salva configurações no Storage
   */
  private async saveConfig(): Promise<void> {
    if (this.config) {
      await this.storageService.set(STORAGE_KEY, this.config);
    }
  }

  /**
   * Obtém todas as configurações
   */
  async getConfig(): Promise<AppConfig> {
    if (!this.config) {
      await this.loadConfig();
    }
    return this.config || { ...DEFAULT_CONFIG };
  }

  /**
   * Atualiza configurações
   */
  async updateConfig(updates: Partial<AppConfig>): Promise<void> {
    if (!this.config) {
      await this.loadConfig();
    }
    
    this.config = { ...this.config!, ...updates };
    await this.saveConfig();
  }

  /**
   * Obtém cidade para API de clima
   */
  async getWeatherCity(): Promise<string> {
    const config = await this.getConfig();
    return config.weatherCity;
  }

  /**
   * Obtém código do país para API de clima
   */
  async getWeatherCountry(): Promise<string> {
    const config = await this.getConfig();
    return config.weatherCountry;
  }

  /**
   * Obtém código do país para API de feriados
   */
  async getHolidayCountry(): Promise<string> {
    const config = await this.getConfig();
    return config.holidayCountry;
  }

  /**
   * Define cidade para API de clima
   */
  async setWeatherCity(city: string): Promise<void> {
    await this.updateConfig({ weatherCity: city });
  }

  /**
   * Define código do país para API de clima
   */
  async setWeatherCountry(country: string): Promise<void> {
    await this.updateConfig({ weatherCountry: country });
  }

  /**
   * Define código do país para API de feriados
   */
  async setHolidayCountry(country: string): Promise<void> {
    await this.updateConfig({ holidayCountry: country });
  }

  /**
   * Reseta configurações para valores padrão
   */
  async resetConfig(): Promise<void> {
    this.config = { ...DEFAULT_CONFIG };
    await this.saveConfig();
  }
}


import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ConfigService } from '../config.service';
import { WeatherData, OpenWeatherResponse } from '../../models/api.models';
import { environment } from '../../../environments/environment';

/**
 * Serviço para integração com OpenWeatherMap API
 * Fornece dados meteorológicos configuráveis por cidade/país
 */
@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';
  // API Key deve ser configurada em environment.ts
  // Por padrão, usa uma key de exemplo (substituir pela sua)
  private readonly API_KEY = environment.weatherApiKey || 'YOUR_API_KEY_HERE';

  constructor(
    private apiService: ApiService,
    private configService: ConfigService
  ) {}

  /**
   * Obtém condições meteorológicas atuais
   * Usa configurações salvas se city/countryCode não forem fornecidos
   * @param city Nome da cidade (opcional, usa configuração se não fornecido)
   * @param countryCode Código do país (opcional, usa configuração se não fornecido)
   * @returns Promise com dados meteorológicos
   */
  async getCurrentWeather(city?: string, countryCode?: string): Promise<WeatherData | null> {
    if (!this.API_KEY || this.API_KEY === 'YOUR_API_KEY_HERE') {
      console.warn('[WeatherService] API Key não configurada. Configure em environment.ts');
      return null;
    }

    try {
      // Usa configurações salvas se não fornecidos
      if (!city || !countryCode) {
        const config = await this.configService.getConfig();
        city = city || config.weatherCity;
        countryCode = countryCode || config.weatherCountry;
      }

      const url = `${this.BASE_URL}/weather?q=${city},${countryCode}&appid=${this.API_KEY}&units=metric&lang=pt`;
      const response = await this.apiService.get<OpenWeatherResponse>(url, true, 30 * 60 * 1000); // Cache de 30 minutos

      return this.mapWeatherResponse(response);
    } catch (error) {
      console.error('[WeatherService] Erro ao obter clima:', error);
      return null;
    }
  }

  /**
   * Converte resposta da API para formato interno
   */
  private mapWeatherResponse(response: OpenWeatherResponse): WeatherData {
    const weather = response.weather[0];
    
    return {
      temp: Math.round(response.main.temp),
      feelsLike: Math.round(response.main.feels_like),
      description: this.capitalizeFirst(weather.description),
      icon: `https://openweathermap.org/img/wn/${weather.icon}@2x.png`,
      city: response.name,
      country: response.sys.country,
      humidity: response.main.humidity,
      windSpeed: Math.round(response.wind.speed * 3.6), // Converte m/s para km/h
      pressure: response.main.pressure
    };
  }

  /**
   * Capitaliza primeira letra de uma string
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Verifica se a API key está configurada
   */
  isConfigured(): boolean {
    return !!this.API_KEY && this.API_KEY !== 'YOUR_API_KEY_HERE';
  }
}


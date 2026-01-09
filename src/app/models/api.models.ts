/**
 * Models e Interfaces para APIs Externas
 * Definições de tipos para respostas das APIs
 */

/**
 * Dados meteorológicos atuais
 */
export interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  city: string;
  country: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
}

/**
 * Previsão meteorológica
 */
export interface ForecastData {
  date: Date;
  temp: number;
  description: string;
  icon: string;
}

/**
 * Resposta da API OpenWeatherMap (Current Weather)
 */
export interface OpenWeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
  sys: {
    country: string;
  };
}

/**
 * Feriado público
 */
export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  localName: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

/**
 * Resposta da Holiday API
 */
export type HolidayResponse = Holiday[];


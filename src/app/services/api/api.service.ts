import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

/**
 * Serviço base para chamadas HTTP a APIs externas
 * Implementa cache, tratamento de erros e retry logic
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos

  constructor(private http: HttpClient) {}

  /**
   * Faz uma requisição GET com cache
   * @param url URL completa da API
   * @param useCache Se deve usar cache (padrão: true)
   * @param cacheDuration Duração do cache em milissegundos (padrão: 5 minutos)
   * @returns Promise com os dados da resposta
   */
  async get<T>(url: string, useCache: boolean = true, cacheDuration: number = this.CACHE_DURATION): Promise<T> {
    // Verifica cache
    if (useCache) {
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        console.log(`[ApiService] Cache hit para: ${url}`);
        return cached.data as T;
      }
    }

    try {
      console.log(`[ApiService] Fazendo requisição para: ${url}`);
      const data = await firstValueFrom(
        this.http.get<T>(url).pipe(
          catchError(this.handleError.bind(this))
        )
      );

      // Armazena no cache
      if (useCache) {
        this.cache.set(url, {
          data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (error) {
      console.error(`[ApiService] Erro ao fazer requisição para ${url}:`, error);
      throw error;
    }
  }

  /**
   * Limpa o cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[ApiService] Cache limpo');
  }

  /**
   * Remove uma entrada específica do cache
   */
  clearCacheEntry(url: string): void {
    this.cache.delete(url);
    console.log(`[ApiService] Entrada do cache removida: ${url}`);
  }

  /**
   * Trata erros HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Requisição inválida';
          break;
        case 401:
          errorMessage = 'Não autorizado. Verifique sua API key.';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado';
          break;
        case 429:
          errorMessage = 'Muitas requisições. Tente novamente mais tarde.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }

    console.error('[ApiService] Erro HTTP:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}


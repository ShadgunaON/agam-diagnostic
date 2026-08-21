/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpRequest } from './request';
import { ApiRequestOptions } from './types';
import { HttpResponse } from './response';
import { NetworkError } from './errors';

/**
 * Interface for the HTTP Client abstraction.
 * This guarantees UI and Domain layers don't rely directly on Fetch, Axios, or Apollo.
 */
export interface IApiClient {
  get<T>(url: string, options?: ApiRequestOptions): Promise<HttpResponse<T>>;
  post<T>(url: string, body?: unknown, options?: ApiRequestOptions): Promise<HttpResponse<T>>;
  put<T>(url: string, body?: unknown, options?: ApiRequestOptions): Promise<HttpResponse<T>>;
  patch<T>(url: string, body?: unknown, options?: ApiRequestOptions): Promise<HttpResponse<T>>;
  delete<T>(url: string, options?: ApiRequestOptions): Promise<HttpResponse<T>>;
  
  /**
   * Generic request method for complex requests.
   */
  request<T>(config: HttpRequest): Promise<HttpResponse<T>>;
}

/**
 * Placeholder implementation of IApiClient.
 * Actual runtime integrations will inject or instantiate a concrete client (e.g., FetchClient)
 * that implements this interface.
 */
export class ApiClient implements IApiClient {
  private get baseUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || 'https://35ea31w6qf.execute-api.us-east-1.amazonaws.com/dev';
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token');
  }

  private async execute<T>(endpoint: string, options: RequestInit = {}): Promise<HttpResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    const token = this.getAuthToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const response = await fetch(url, { ...options, headers });
      
      let data: any = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        if (response.status === 401) {
           throw new NetworkError('Unauthorized');
        }
        throw new NetworkError(data?.error?.message || data?.message || 'API request failed');
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return { data: (data?.data !== undefined ? data.data : data) as T, status: response.status, headers: responseHeaders };
    } catch (error) {
      if (error instanceof NetworkError) throw error;
      throw new NetworkError(error instanceof Error ? error.message : 'Network error');
    }
  }

  async get<T>(url: string, options?: ApiRequestOptions): Promise<HttpResponse<T>> {
    return this.execute<T>(url, { method: 'GET', ...options });
  }

  async post<T>(url: string, body?: unknown, options?: ApiRequestOptions): Promise<HttpResponse<T>> {
    return this.execute<T>(url, { method: 'POST', body: JSON.stringify(body), ...options });
  }

  async put<T>(url: string, body?: unknown, options?: ApiRequestOptions): Promise<HttpResponse<T>> {
    return this.execute<T>(url, { method: 'PUT', body: JSON.stringify(body), ...options });
  }

  async patch<T>(url: string, body?: unknown, options?: ApiRequestOptions): Promise<HttpResponse<T>> {
    return this.execute<T>(url, { method: 'PATCH', body: JSON.stringify(body), ...options });
  }

  async delete<T>(url: string, options?: ApiRequestOptions): Promise<HttpResponse<T>> {
    return this.execute<T>(url, { method: 'DELETE', ...options });
  }

  async request<T>(config: HttpRequest): Promise<HttpResponse<T>> {
    return this.execute<T>(config.url, {
      method: config.method,
      body: config.body ? JSON.stringify(config.body) : undefined,
      headers: config.headers as any
    });
  }
}

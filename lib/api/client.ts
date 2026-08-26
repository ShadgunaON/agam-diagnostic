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

import { env } from '@/config/env';

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**
 * Placeholder implementation of IApiClient.
 * Actual runtime integrations will inject or instantiate a concrete client (e.g., FetchClient)
 * that implements this interface.
 */
export class ApiClient implements IApiClient {
  private refreshPromise: Promise<string | null> | null = null;

  private get baseUrl(): string {
    return env.apiUrl;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('cognito_refresh_token') || localStorage.getItem('cognito_refresh_token');
  }

  private storeTokens(idToken: string, accessToken: string) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('cognito_id_token', idToken);
    sessionStorage.setItem('cognito_access_token', accessToken);
  }

  private clearTokens() {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('cognito_id_token');
    sessionStorage.removeItem('cognito_access_token');
    sessionStorage.removeItem('cognito_refresh_token');
  }

  public async refreshSession(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await fetch(`https://cognito-idp.${env.cognitoRegion}.amazonaws.com/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
          },
          body: JSON.stringify({
            AuthFlow: 'REFRESH_TOKEN_AUTH',
            ClientId: env.cognitoClientId,
            AuthParameters: {
              REFRESH_TOKEN: refreshToken,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Refresh failed');
        }

        const data = await response.json();
        if (data.AuthenticationResult && data.AuthenticationResult.IdToken) {
          this.storeTokens(data.AuthenticationResult.IdToken, data.AuthenticationResult.AccessToken);
          return data.AuthenticationResult.IdToken;
        } else {
           throw new Error('Invalid refresh response');
        }
      } catch (err) {
        this.clearTokens();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('session_expired'));
        }
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async execute<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<HttpResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    let token = this.getAuthToken();

    // Proactive refresh: check if token expires in less than 5 minutes
    if (token && !isRetry) {
      const payload = parseJwt(token);
      if (payload && payload.exp) {
        const timeRemainingMs = (payload.exp * 1000) - Date.now();
        if (timeRemainingMs < 5 * 60 * 1000) {
          const newToken = await this.refreshSession();
          if (newToken) {
            token = newToken;
          }
        }
      }
    }

    if (token) {
      headers.set('Authorization', token);
    }

    try {
      const response = await fetch(url, { ...options, headers });
      
      // Reactive refresh: if 401 and we haven't retried yet
      if (response.status === 401 && !isRetry) {
        const newToken = await this.refreshSession();
        if (newToken) {
          // Retry the request exactly once with new token
          headers.set('Authorization', newToken);
          return this.execute<T>(endpoint, { ...options, headers }, true);
        }
      }

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

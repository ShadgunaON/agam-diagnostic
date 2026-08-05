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
  async get<T>(_url: string, _options?: ApiRequestOptions): Promise<HttpResponse<T>> {
    throw new NetworkError('ApiClient.get is not implemented yet.');
  }

  async post<T>(_url: string, _body?: unknown, _options?: ApiRequestOptions): Promise<HttpResponse<T>> {
    throw new NetworkError('ApiClient.post is not implemented yet.');
  }

  async put<T>(_url: string, _body?: unknown, _options?: ApiRequestOptions): Promise<HttpResponse<T>> {
    throw new NetworkError('ApiClient.put is not implemented yet.');
  }

  async patch<T>(_url: string, _body?: unknown, _options?: ApiRequestOptions): Promise<HttpResponse<T>> {
    throw new NetworkError('ApiClient.patch is not implemented yet.');
  }

  async delete<T>(_url: string, _options?: ApiRequestOptions): Promise<HttpResponse<T>> {
    throw new NetworkError('ApiClient.delete is not implemented yet.');
  }

  async request<T>(_config: HttpRequest): Promise<HttpResponse<T>> {
    throw new NetworkError('ApiClient.request is not implemented yet.');
  }
}

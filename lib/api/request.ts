import { ApiRequestOptions } from './types';

/**
 * Generic request configuration interface.
 * Abstracted to avoid coupling with fetch/axios specifics directly in UI components.
 */
export interface HttpRequest extends ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  body?: unknown;
}

import { HttpRequest } from './request';
import { HttpResponse } from './response';

/**
 * Interceptor types for the generic HTTP client.
 * Provides a hook system for request modification (e.g. adding auth tokens)
 * and response modification (e.g. global error handling).
 */

export type RequestInterceptor = (request: HttpRequest) => Promise<HttpRequest> | HttpRequest;
export type ResponseInterceptor = (response: HttpResponse) => Promise<HttpResponse> | HttpResponse;
export type ErrorInterceptor = (error: Error) => Promise<never>;

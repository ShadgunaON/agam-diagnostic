/**
 * Generic response interface.
 */
export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

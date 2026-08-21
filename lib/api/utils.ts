import { Result, success, failure } from '@/shared/result';
import { HttpResponse } from './response';
import { NetworkError, ServerError } from './errors';

/**
 * Converts a Promise<HttpResponse<T>> from IApiClient into a Promise<Result<T>>.
 * Handles extracting the data on success and mapping exceptions to Failure<Error>.
 */
export async function toResult<T>(apiCall: Promise<HttpResponse<T>>): Promise<Result<T>> {
  try {
    const response = await apiCall;
    return success(response.data);
  } catch (err: any) {
    if (err instanceof NetworkError || err instanceof ServerError) {
      return failure(err);
    }
    return failure(new ServerError(err.message || 'Unknown API error occurred'));
  }
}

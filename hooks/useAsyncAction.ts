import { useState, useCallback } from 'react';

export function useAsyncAction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const execute = useCallback(async <T>(asyncAction: () => Promise<T>): Promise<T | undefined> => {
    setIsLoading(true);
    setError('');
    try {
      return await asyncAction();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, setError, execute };
}

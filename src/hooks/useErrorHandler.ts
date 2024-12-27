import { useState, useCallback } from 'react';
import { AppError } from '@/types/errors';

interface ErrorState {
  error: AppError | Error | null;
  isError: boolean;
}

export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
  });

  const handleError = useCallback((error: unknown) => {
    if (error instanceof AppError || error instanceof Error) {
      setErrorState({ error, isError: true });
    } else {
      setErrorState({
        error: new Error('An unexpected error occurred'),
        isError: true,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState({ error: null, isError: false });
  }, []);

  return {
    error: errorState.error,
    isError: errorState.isError,
    handleError,
    clearError,
  };
}

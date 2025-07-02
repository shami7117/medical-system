// utils/queryOptimizations.ts
import { QueryClient } from '@tanstack/react-query';

// Enhanced Query Client Configuration
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Global optimization settings
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: (failureCount, error: any) => {
          // Smart retry logic
          if (error?.status >= 400 && error?.status < 500) {
            return false; // Don't retry client errors
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        refetchOnMount: false,
      },
      mutations: {
        // Global mutation settings
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
};


// hooks/useErrorHandler.ts
import { useCallback } from 'react'
import { ApiErrorHandler } from '@/lib/error-handler'
import { useAuth } from '@/contexts/AuthContext'

export function useErrorHandler() {
  const { logout } = useAuth()

  const handleError = useCallback((error: unknown) => {
    const apiError = ApiErrorHandler.handle(error)
    
    // Auto logout on auth errors
    if (apiError.status === 401) {
      logout()
      return
    }

    ApiErrorHandler.showToast(apiError)
    return apiError
  }, [logout])

  return { handleError }
}

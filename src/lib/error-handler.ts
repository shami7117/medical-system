import { toast } from 'sonner'

export interface ApiError {
  message: string
  status?: number
  code?: string
}

export class ApiErrorHandler {
  static handle(error: unknown): ApiError {
    if (error instanceof Error) {
      // Network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          message: 'Network error. Please check your connection.',
          status: 0,
          code: 'NETWORK_ERROR'
        }
      }

      // Timeout errors
      if (error.message.includes('timeout')) {
        return {
          message: 'Request timeout. Please try again.',
          status: 408,
          code: 'TIMEOUT_ERROR'
        }
      }

      // Generic error
      return {
        message: error.message,
        code: 'GENERIC_ERROR'
      }
    }

    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    }
  }

  static showToast(error: ApiError) {
    switch (error.status) {
      case 401:
        toast.error('Session expired. Please login again.')
        break
      case 403:
        toast.error('You do not have permission to perform this action.')
        break
      case 404:
        toast.error('The requested resource was not found.')
        break
      case 422:
        toast.error('Please check your input and try again.')
        break
      case 500:
        toast.error('Server error. Please try again later.')
        break
      default:
        toast.error(error.message)
    }
  }
}

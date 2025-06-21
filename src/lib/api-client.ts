// lib/api-client.ts
import { useAuth } from '@/contexts/AuthContext'
import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ApiClientOptions {
  baseURL?: string
  timeout?: number
}

class ApiClient {
  private baseURL: string
  private timeout: number
  private getToken: (() => string | null) | null = null
  private onUnauthorized: (() => void) | null = null

  constructor(options: ApiClientOptions = {}) {
    this.baseURL = options.baseURL || ''
    this.timeout = options.timeout || 10000
  }

  // Set token getter function
  setTokenGetter(getter: () => string | null) {
    this.getToken = getter
  }

  // Set unauthorized handler
  setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getToken?.()

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    // Add timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle unauthorized
      if (response.status === 401 || response.status === 403) {
        this.onUnauthorized?.()
        throw new Error('Unauthorized')
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `HTTP ${response.status}`)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw error
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Create singleton instance
export const apiClient = new ApiClient({
  baseURL: '/api',
  timeout: 15000,
})

// Hook to setup API client with auth
export function useApiClient() {
  const { token, logout } = useAuth()

  React.useEffect(() => {
    // Set token getter
    apiClient.setTokenGetter(() => token)
    
    // Set unauthorized handler
    apiClient.setUnauthorizedHandler(() => {
      logout()
    })
  }, [token, logout])

  return apiClient
}

// Generic API hook for TanStack Query
export function useApiQuery<T>(
  key: string[],
  endpoint: string,
  options?: {
    enabled?: boolean
    staleTime?: number
    gcTime?: number
    retry?: number | boolean
  }
) {
  const client = useApiClient()

  return useQuery({
    queryKey: key,
    queryFn: () => client.get<T>(endpoint),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes
    retry: options?.retry ?? 3,
  })
}

export function useApiMutation<TData, TVariables>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options?: {
    onSuccess?: (data: TData) => void
    onError?: (error: Error) => void
  }
) {
  const client = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: TVariables) => {
      switch (method) {
        case 'POST':
          return client.post<TData>(endpoint, variables)
        case 'PUT':
          return client.put<TData>(endpoint, variables)
        case 'PATCH':
          return client.patch<TData>(endpoint, variables)
        case 'DELETE':
          return client.delete<TData>(endpoint)
        default:
          throw new Error(`Unsupported method: ${method}`)
      }
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries()
      options?.onSuccess?.(data)
    },
    onError: options?.onError,
  })
}
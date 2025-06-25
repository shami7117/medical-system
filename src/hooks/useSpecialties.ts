// hooks/useSpecialties.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
  import { useAuth } from '@/contexts/AuthContext'
// Types
export interface Specialty {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  stats: {
    totalVisits: number
  }
}

export interface CreateSpecialtyPayload {
  name: string
  description?: string
}

export interface SpecialtiesResponse {
  success: boolean
  data: {
    specialties: Specialty[]
  }
  message?: string
}

export interface CreateSpecialtyResponse {
  success: boolean
  data: {
    id: string
    name: string
    description: string | null
    isActive: boolean
    createdAt: string
  }
  message: string
}

// API Functions
const specialtiesApi = {
  getSpecialties: async (hospitalId: string, token: string, includeInactive = false): Promise<SpecialtiesResponse> => {
    const params = new URLSearchParams()
    if (includeInactive) {
      params.append('includeInactive', 'true')
    }
    const url = `/api/hospitals/${hospitalId}/specialities${params.toString() ? `?${params.toString()}` : ''}`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch specialties')
    }
    return data
  },

  createSpecialty: async (hospitalId: string, token: string, payload: CreateSpecialtyPayload): Promise<CreateSpecialtyResponse> => {
    const res = await fetch(`/api/hospitals/${hospitalId}/specialities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create specialty')
    }
    return data
  },
}

// Query Keys
export const specialtiesKeys = {
  all: ['specialties'] as const,
  lists: () => [...specialtiesKeys.all, 'list'] as const,
  list: (hospitalId: string, includeInactive?: boolean) => 
    [...specialtiesKeys.lists(), hospitalId, { includeInactive }] as const,
  details: () => [...specialtiesKeys.all, 'detail'] as const,
  detail: (id: string) => [...specialtiesKeys.details(), id] as const,
}

// Hooks
export function useSpecialties(hospitalId: string, includeInactive = false, options?: { enabled?: boolean }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: specialtiesKeys.list(hospitalId, includeInactive),
    queryFn: () => {
      if (!token) throw new Error('No auth token');
      return specialtiesApi.getSpecialties(hospitalId, token, includeInactive);
    },
    enabled: !!hospitalId && !!token && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => data.data.specialties, // Extract specialties array directly
  })
}

export function useCreateSpecialty(hospitalId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSpecialtyPayload) => {
      if (!token) throw new Error('No auth token');
      return specialtiesApi.createSpecialty(hospitalId, token, payload);
    },
    onSuccess: (response) => {
      // Invalidate and refetch specialties list
      queryClient.invalidateQueries({
        queryKey: specialtiesKeys.lists()
      })
      toast.success(response.message || 'Specialty created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create specialty')
    },
  })
}

// Utility hooks for common operations
export function useActiveSpecialties(hospitalId: string, options?: { enabled?: boolean }) {
  return useSpecialties(hospitalId, false, options)
}

export function useAllSpecialties(hospitalId: string, options?: { enabled?: boolean }) {
  return useSpecialties(hospitalId, true, options)
}

// Hook for optimistic updates (optional - for better UX)
export function useCreateSpecialtyOptimistic(hospitalId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSpecialtyPayload) => {
      if (!token) throw new Error('No auth token');
      return specialtiesApi.createSpecialty(hospitalId, token, payload);
    },
    onMutate: async (newSpecialty) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: specialtiesKeys.list(hospitalId, false) 
      })

      // Snapshot the previous value
      const previousSpecialties = queryClient.getQueryData(
        specialtiesKeys.list(hospitalId, false)
      )

      // Optimistically update to the new value
      const optimisticSpecialty: Specialty = {
        id: `temp-${Date.now()}`,
        name: newSpecialty.name,
        description: newSpecialty.description || null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: { totalVisits: 0 }
      }

      queryClient.setQueryData(
        specialtiesKeys.list(hospitalId, false),
        (old: Specialty[] | undefined) => {
          if (!old) return [optimisticSpecialty]
          return [...old, optimisticSpecialty]
        }
      )

      return { previousSpecialties }
    },
    onError: (error: Error, newSpecialty, context) => {
      // Rollback on error
      if (context?.previousSpecialties) {
        queryClient.setQueryData(
          specialtiesKeys.list(hospitalId, false),
          context.previousSpecialties
        )
      }
      toast.error(error.message || 'Failed to create specialty')
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Specialty created successfully!')
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: specialtiesKeys.lists()
      })
    },
  })
}

// Custom hook for specialty statistics
export function useSpecialtyStats(hospitalId: string) {
  const { data: specialties, ...rest } = useActiveSpecialties(hospitalId)

  const stats = {
    totalSpecialties: specialties?.length || 0,
    totalVisits: specialties?.reduce((sum, specialty) => sum + specialty.stats.totalVisits, 0) || 0,
    mostActiveSpecialty: specialties?.reduce((max, specialty) => 
      specialty.stats.totalVisits > (max?.stats.totalVisits || 0) ? specialty : max
    ),
  }

  return {
    ...rest,
    data: specialties,
    stats,
  }
}
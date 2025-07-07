// hooks/usePatients.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  usePatientsApi, 
  CreatePatientData, 
  PatientsListParams,
  Patient 
} from '@/lib/api/patients'
import { useUpdatePatientStatus } from '@/lib/api/patients';

// Optimized Query Keys with better structure
export const patientsKeys = {
  all: ['patients'] as const,
  lists: () => [...patientsKeys.all, 'list'] as const,
  list: (hospitalId: string, params: PatientsListParams) => 
    [...patientsKeys.lists(), hospitalId, params] as const,
  details: () => [...patientsKeys.all, 'detail'] as const,
  detail: (hospitalId: string, id: string) => 
    [...patientsKeys.details(), hospitalId, id] as const,
}

// Hook to get patients list with better caching
export function usePatients(hospitalId: string, params: PatientsListParams = {}) {
  const api = usePatientsApi(hospitalId);
  return useQuery({
    queryKey: patientsKeys.list(hospitalId, params),
    queryFn: () => api.getPatients(params),
    enabled: !!hospitalId,
    staleTime: 2 * 60 * 1000, // 2 minutes - longer stale time for better performance
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: false, // Only refetch if data is stale
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2; // Reduce retry attempts
    },
  });
}

// Optimized create patient hook with better optimistic updates
export function useCreatePatientOptimistic(hospitalId: string, currentParams: PatientsListParams = {}) {
  const queryClient = useQueryClient();
  const api = usePatientsApi(hospitalId);
  
  return useMutation({
    mutationFn: (patientData: CreatePatientData) => api.createPatient(patientData),
    
    onMutate: async (newPatient) => {
      const queryKey = patientsKeys.list(hospitalId, currentParams);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Get previous data
      const previousData = queryClient.getQueryData(queryKey) as {
        data: { patients: Patient[]; pagination: { total: number } };
      } | undefined;
      
      if (!previousData) return { previousData: null };
      // Create optimistic patient
      const optimisticPatient: Patient = {
        id: `optimistic-${Date.now()}`,
        ...newPatient,
        fullName: `${newPatient.firstName} ${newPatient.lastName}`,
        dateOfBirth: new Date(newPatient.dateOfBirth),
        age: Math.floor((Date.now() - new Date(newPatient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
        priority: newPatient.priority || 'Routine',
        status: newPatient.status || 'Waiting',
        hospitalId,
        isActive: true,
        createdAt: new Date(),
        arrivalTime: newPatient.arrivalTime ? new Date(newPatient.arrivalTime) : new Date(),
        stats: { totalVisits: 0, activeProblems: 0 },
        visits: [], // Add empty visits array for type compatibility
      };
      
      // Optimistically update cache
      queryClient.setQueryData(queryKey, {
        ...previousData,
        data: {
          ...previousData.data,
          patients: [optimisticPatient, ...previousData.data.patients],
          pagination: {
            ...previousData.data.pagination,
            total: previousData.data.pagination.total + 1,
          },
        },
      });
      
      return { previousData };
    },
    
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          patientsKeys.list(hospitalId, currentParams),
          context.previousData
        );
      }
      
      // Let the component handle the error toast
      // Don't show toast here to avoid conflicts
      console.error('Mutation error:', error);
    },
    
    onSuccess: (response, variables, context) => {
      // Replace optimistic data with real data
      const queryKey = patientsKeys.list(hospitalId, currentParams);
      const currentData = queryClient.getQueryData(queryKey) as {
        data: { patients: Patient[]; pagination: { total: number } };
      } | undefined;
      
      if (currentData && response.data) {
        const updatedPatients = currentData.data.patients.map(patient => 
          patient.id.startsWith('optimistic-') ? response.data : patient
        );
        
        queryClient.setQueryData(queryKey, {
          ...currentData,
          data: {
            ...currentData.data,
            patients: updatedPatients,
          },
        });
      }
      
      // Let the component handle success toast too
      console.log('Patient created successfully');
    },
    
    onSettled: () => {
      // Only invalidate if we suspect data might be out of sync
      // This is much more efficient than always invalidating
      queryClient.invalidateQueries({
        queryKey: patientsKeys.list(hospitalId, currentParams),
        exact: true,
      });
    },
  });
}


// Highly optimized status update hook with instant UI updates
export function useUpdatePatientStatusMutation(hospitalId: string, currentParams: PatientsListParams = {}) {
  const { updateStatus } = useUpdatePatientStatus(hospitalId);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ patientId, status }: { patientId: string; status: 'Waiting' | 'In Progress' | 'Completed' }) =>
      updateStatus(patientId, status),
    
    onMutate: async ({ patientId, status }) => {
      const queryKey = patientsKeys.list(hospitalId, currentParams);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Get current data
      const previousData = queryClient.getQueryData(queryKey) as {
        data: { patients: Patient[]; pagination: { total: number } };
      } | undefined;
      
      if (!previousData) return { previousData: null };
      
      // Optimistically update patient status
      const updatedPatients = previousData.data.patients.map(patient =>
        patient.id === patientId
          ? { ...patient, status: status as any }
          : patient
      );
      
      // Apply optimistic update
      queryClient.setQueryData(queryKey, {
        ...previousData,
        data: {
          ...previousData.data,
          patients: updatedPatients,
        },
      });
      
      return { previousData, patientId, status };
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(
          patientsKeys.list(hospitalId, currentParams),
          context.previousData
        );
      }
      toast.error(error.message || 'Failed to update patient status');
    },
    
    onSuccess: (response, { patientId, status }) => {
      // Update was successful, no need to invalidate if optimistic update was correct
      // Only show success message for critical operations
      if (status === 'Completed') {
        toast.success('Visit completed successfully');
      }
    },
    
    onSettled: (data, error, { patientId }) => {
      // Only invalidate specific patient data, not the entire list
      // This is much more efficient
      if (error) {
        // Only invalidate on error to ensure data consistency
        queryClient.invalidateQueries({
          queryKey: patientsKeys.list(hospitalId, currentParams),
          exact: true,
        });
      }
    },
  });
}

// Hook for background refetching without affecting UI
export function useBackgroundRefreshPatients(hospitalId: string, params: PatientsListParams = {}) {
  const queryClient = useQueryClient();
  
  const refreshInBackground = () => {
    queryClient.prefetchQuery({
      queryKey: patientsKeys.list(hospitalId, params),
      staleTime: 0, // Force refetch
    });
  };
  
  return { refreshInBackground };
}

// Hook to prefetch patients data
export function usePrefetchPatients(hospitalId: string) {
  const queryClient = useQueryClient();
  return (params: PatientsListParams = {}) => {
    const api = usePatientsApi(hospitalId);
    queryClient.prefetchQuery({
      queryKey: patientsKeys.list(hospitalId, params),
      queryFn: () => api.getPatients(params),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };
}

// Hook to get cached patients data without triggering a request
export function useCachedPatients(hospitalId: string, params: PatientsListParams = {}) {
  const queryClient = useQueryClient()
  return queryClient.getQueryData(patientsKeys.list(hospitalId, params))
}

// Selective invalidation hook for better performance
export function useInvalidatePatients() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({
        queryKey: patientsKeys.all
      })
    },
    invalidateLists: () => {
      queryClient.invalidateQueries({
        queryKey: patientsKeys.lists()
      })
    },
    invalidateList: (hospitalId: string, params: PatientsListParams) => {
      queryClient.invalidateQueries({
        queryKey: patientsKeys.list(hospitalId, params),
        exact: true, // Only invalidate exact match
      })
    },
    // Soft refresh - refetch without showing loading state
    softRefreshList: (hospitalId: string, params: PatientsListParams) => {
      queryClient.refetchQueries({
        queryKey: patientsKeys.list(hospitalId, params),
        exact: true,
      })
    },
  }
}
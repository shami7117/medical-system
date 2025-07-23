  // hooks/useEmergencyVisitNotes.ts
  import React from 'react';
  import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
  import { toast } from 'sonner';

  // Types based on your API structure
  export interface Patient {
    id: string;
    mrn: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'M' | 'F' | 'O';
    phone?: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    insuranceNumber?: string;
    insuranceProvider?: string;
    occupation?: string;
    maritalStatus?: string;
    patientType: 'EMERGENCY' | 'CLINIC';
    arrivalTime: string;
    priority: 'Critical' | 'Urgent' | 'Routine';
    status: string;
  }

  export interface Specialty {
    id: string;
    name: string;
    hospitalId: string;
    isActive: boolean;
  }

  export interface User {
    id: string;
    name: string;
    role: 'DOCTOR' | 'NURSE';
    employeeId?: string;
  }

  export interface Vitals {
    id?: string;
    systolicBP?: number;
    diastolicBP?: number;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    consciousnessLevel?: 'Alert' | 'Verbal' | 'Pain' | 'Unresponsive';
    painScore?: number;
    glucose?: number;
    createdBy?: User;
    createdAt?: string;
  }

  export interface Problem {
    id?: string;
    title: string;
    description?: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'ACTIVE' | 'RESOLVED' | 'CHRONIC' | 'INACTIVE';
    onsetDate?: string;
    createdBy?: User;
  }

  export interface ClinicalNote {
    id?: string;
    title: string;
    content: string;
    noteType: 'History' | 'Examination' | 'Assessment' | 'Alert';
    attachments?: string[];
    createdBy?: User;
    createdAt?: string;
  }

  export interface ProgressNote {
    id?: string;
    content: string;
    noteType: string;
    isPrivate: boolean;
    attachments?: string[];
    createdBy?: User;
    createdAt?: string;
  }

  export interface Visit {
    id: string;
    visitNumber: string;
    hospitalId: string;
    patientId: string;
    createdById: string;
    assignedToId?: string;
    specialtyId?: string;
    type: 'EMERGENCY' | 'CLINIC';
    chiefComplaint?: string;
    status: 'SCHEDULED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    checkedInAt?: string;
    completedAt?: string;
    patient: Patient & {
      medicalHistory?: any[];
      problems?: Problem[];
    };
    assignedTo?: User;
    specialty?: Specialty;
    vitals?: Vitals[];
    clinicalNotes?: ClinicalNote[];
    progressNotes?: ProgressNote[];
    prescriptions?: any[];
  }

  export interface EmergencyVisitData {
    visit: Visit | null;
    patients: Patient[];
    specialties: Specialty[];
    users: User[];
    patientTypes: string[];
    priorities: string[];
    visitStatuses: string[];
    problemStatuses: string[];
    consciousnessLevels: string[];
    genders: string[];
    maritalStatuses: string[];
  }

  export interface CreateEmergencyVisitPayload {
    // Visit data
    visitId?: string;
    hospitalId: string;
    patientId?: string;
    createdById: string;
    assignedToId?: string;
    specialtyId?: string;
    visitType?: 'EMERGENCY' | 'CLINIC';
    
    // Patient data (if creating new patient)
    patientData?: Partial<Patient>;
    
    // Chief complaint and visit details
    chiefComplaint?: string;
    isTraumaCase?: boolean;
    
    // History of present illness
    presentIllnessHistory?: string;
    
    // Examination findings
    examinationFindings?: string;
    
    // Vital signs
    vitals?: Partial<Vitals>;
    
    // Assessment and plan
    assessmentAndPlan?: string;
    
    // Problems list
    problems?: Omit<Problem, 'id' | 'createdBy'>[];
    
    // Progress notes
    progressNotes?: Omit<ProgressNote, 'id' | 'createdBy'>[];
    
    // Disposition
    disposition?: 'discharge' | 'admit' | 'transfer';
    
    // File attachments
    attachments?: string[];
  }

  // Query Keys
  export const emergencyVisitKeys = {
    all: ['emergency-visits'] as const,
    lists: () => [...emergencyVisitKeys.all, 'list'] as const,
    list: (filters: string) => [...emergencyVisitKeys.lists(), { filters }] as const,
    details: () => [...emergencyVisitKeys.all, 'detail'] as const,
    detail: (id: string) => [...emergencyVisitKeys.details(), id] as const,
    data: (hospitalId: string, visitId?: string, patientId?: string) => 
      [...emergencyVisitKeys.all, 'data', { hospitalId, visitId, patientId }] as const,
  };

  // API Functions
  const emergencyVisitApi = {
    // Get emergency visit data
    getEmergencyVisitData: async (
      hospitalId: string,
      visitId?: string,
      patientId?: string
    ): Promise<EmergencyVisitData> => {
      const params = new URLSearchParams({ hospitalId });
      if (visitId) params.append('visitId', visitId);
      if (patientId) params.append('patientId', patientId);

      const response = await fetch(`/api/emergency-visit-notes?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch emergency visit data');
      }
      return response.json();
    },

    // Create emergency visit
    createEmergencyVisit: async (
      payload: CreateEmergencyVisitPayload
    ): Promise<{ success: boolean; message: string; data: Visit }> => {
      const response = await fetch('/api/emergency-visit-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create emergency visit');
      }

      return response.json();
    },

    // Update emergency visit
    updateEmergencyVisit: async (
      visitId: string,
      payload: Partial<CreateEmergencyVisitPayload>
    ): Promise<{ success: boolean; message: string; data: Visit }> => {
      const response = await fetch('/api/emergency-visit-notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitId, ...payload }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update emergency visit');
      }

      return response.json();
    },

    // Delete/Cancel emergency visit
    deleteEmergencyVisit: async (visitId: string): Promise<{ success: boolean; message: string }> => {
      const response = await fetch(`/api/emergency-visit-notes?visitId=${visitId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel emergency visit');
      }

      return response.json();
    },
  };

  // Custom Hooks

  /**
   * Hook to fetch emergency visit data including patients, specialties, users, and visit details
   */
  export const useEmergencyVisitData = (
    hospitalId: string,
    visitId?: string,
    patientId?: string,
    options?: {
      enabled?: boolean;
      refetchInterval?: number;
    }
  ) => {
    return useQuery({
      queryKey: emergencyVisitKeys.data(hospitalId, visitId, patientId),
      queryFn: () => emergencyVisitApi.getEmergencyVisitData(hospitalId, visitId, patientId),
      enabled: !!hospitalId && (options?.enabled ?? true),
      refetchInterval: options?.refetchInterval,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  /**
   * Hook to create a new emergency visit
   */
  export const useCreateEmergencyVisit = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: emergencyVisitApi.createEmergencyVisit,
      onSuccess: (data, variables) => {
        toast.success('Emergency visit created successfully!');
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: emergencyVisitKeys.all });
        queryClient.invalidateQueries({ 
          queryKey: emergencyVisitKeys.data(variables.hospitalId) 
        });
        
        // Update the cache with new data
        queryClient.setQueryData(
          emergencyVisitKeys.data(variables.hospitalId, data.data.id),
          (oldData: EmergencyVisitData | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              visit: data.data,
            };
          }
        );
      },
      onError: (error: Error) => {
        toast.error(`Failed to create emergency visit: ${error.message}`);
      },
    });
  };

  /**
   * Hook to update an existing emergency visit
   */
  export const useUpdateEmergencyVisit = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ visitId, ...payload }: { visitId: string } & Partial<CreateEmergencyVisitPayload>) =>
        emergencyVisitApi.updateEmergencyVisit(visitId, payload),
      onSuccess: (data, variables) => {
        toast.success('Emergency visit updated successfully!');
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: emergencyVisitKeys.all });
        
        // Update specific visit data in cache
        queryClient.setQueryData(
          emergencyVisitKeys.data(data.data.hospitalId, variables.visitId),
          (oldData: EmergencyVisitData | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              visit: data.data,
            };
          }
        );
      },
      onError: (error: Error) => {
        toast.error(`Failed to update emergency visit: ${error.message}`);
      },
    });
  };

  /**
   * Hook to delete/cancel an emergency visit
   */
  export const useDeleteEmergencyVisit = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: emergencyVisitApi.deleteEmergencyVisit,
      onSuccess: (data, visitId) => {
        toast.success('Emergency visit cancelled successfully!');
        
        // Invalidate all related queries
        queryClient.invalidateQueries({ queryKey: emergencyVisitKeys.all });
        
        // Remove the specific visit from cache
        queryClient.removeQueries({ 
          queryKey: emergencyVisitKeys.details(),
          exact: false 
        });
      },
      onError: (error: Error) => {
        toast.error(`Failed to cancel emergency visit: ${error.message}`);
      },
    });
  };

  /**
   * Hook to save emergency visit notes (creates or updates based on visitId)
   */
  export const useSaveEmergencyVisitNotes = () => {
    const createMutation = useCreateEmergencyVisit();
    const updateMutation = useUpdateEmergencyVisit();

    // Memoize mutate to avoid repeated calls and body-read errors
    const mutate = React.useCallback((payload: CreateEmergencyVisitPayload) => {
      console.log("POST API CALLED");
      if (payload.visitId) {
        // Update existing visit
        updateMutation.mutate({ visitId: payload.visitId, ...payload });
      } else {
        // Create new visit
        createMutation.mutate(payload);
      }
    }, [createMutation, updateMutation]);

    return {
      mutate,
      isLoading: createMutation.isPending || updateMutation.isPending,
      error: createMutation.error || updateMutation.error,
      isSuccess: createMutation.isSuccess || updateMutation.isSuccess,
      data: createMutation.data || updateMutation.data,
    };
  };

  /**
   * Hook to get optimistic updates for real-time features
   */
  export const useOptimisticEmergencyVisit = (hospitalId: string, visitId?: string) => {
    const queryClient = useQueryClient();

    const updateOptimistically = (updates: Partial<Visit>) => {
      queryClient.setQueryData(
        emergencyVisitKeys.data(hospitalId, visitId),
        (oldData: EmergencyVisitData | undefined) => {
          if (!oldData || !oldData.visit) return oldData;
          return {
            ...oldData,
            visit: {
              ...oldData.visit,
              ...updates,
            },
          };
        }
      );
    };

    return { updateOptimistically };
  };

  // Utility hooks for specific operations

  /**
   * Hook to add a new problem to a visit
   */
  export const useAddProblem = () => {
    const updateMutation = useUpdateEmergencyVisit();

    return {
      mutate: (visitId: string, problem: Omit<Problem, 'id' | 'createdBy'>) => {
        updateMutation.mutate({
          visitId,
          problems: [problem],
        });
      },
      isLoading: updateMutation.isPending,
      error: updateMutation.error,
    };
  };

  /**
   * Hook to add a progress note to a visit
   */
  export const useAddProgressNote = () => {
    const updateMutation = useUpdateEmergencyVisit();

    return {
      mutate: (visitId: string, note: Omit<ProgressNote, 'id' | 'createdBy'>) => {
        updateMutation.mutate({
          visitId,
          progressNotes: [note],
        });
      },
      isLoading: updateMutation.isPending,
      error: updateMutation.error,
    };
  };

  /**
   * Hook to update vitals for a visit
   */
  export const useUpdateVitals = () => {
    const updateMutation = useUpdateEmergencyVisit();

    return {
      mutate: (visitId: string, vitals: Partial<Vitals>) => {
        updateMutation.mutate({
          visitId,
          vitals,
        });
      },
      isLoading: updateMutation.isPending,
      error: updateMutation.error,
    };
  };
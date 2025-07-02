// Update patient status API
export const useUpdatePatientStatus = (hospitalId: string) => {
  const { token } = useAuth();

  const updateStatus = async (patientId: string, status: 'Waiting' | 'In Progress' | 'Completed') => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api/hospitals/${hospitalId}/patients/${patientId}/status`, {
      method: 'PATCH',
      headers,
      credentials: 'include',
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update patient status');
    }
    return data;
  };

  return { updateStatus };
};
// lib/api/patients.ts
export interface Patient {
  id: string
  mrn: string
  firstName: string
  lastName: string
  fullName: string
  dateOfBirth: Date
  age: number
  gender: 'M' | 'F' | 'O'
  phone?: string
  email?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  insuranceNumber?: string
  insuranceProvider?: string
  occupation?: string
  maritalStatus?: string
  arrivalTime?: Date
  priority: 'Critical' | 'Urgent' | 'Routine'
  status: 'Waiting' | 'In Progress' | 'Completed'
  hospitalId: string
  isActive: boolean
  createdAt: Date
  stats?: {
    totalVisits: number
    activeProblems: number
  }
}

export interface CreatePatientData {
  mrn: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'M' | 'F' | 'O'
  phone?: string
  email?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  insuranceNumber?: string
  insuranceProvider?: string
  occupation?: string
  maritalStatus?: string
  arrivalTime?: string
  priority?: 'Critical' | 'Urgent' | 'Routine'
  status?: 'Waiting' | 'In Progress' | 'Completed'
}

export interface PatientsListParams {
  page?: number
  limit?: number
  search?: string
  priority?: 'Critical' | 'Urgent' | 'Routine'
  status?: 'Waiting' | 'In Progress' | 'Completed'
  patientType?: 'EMERGENCY' | 'CLINIC';
  specialtyId?: string;
}

export interface PatientsListResponse {
  patients: Patient[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

import { useAuth } from "@/contexts/AuthContext";

// PatientsApi as a set of functions using the current token from useAuth
export const usePatientsApi = (hospitalId: string) => {
  const { token } = useAuth();

  const getPatients = async (params: PatientsListParams = {}): Promise<ApiResponse<PatientsListResponse>> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.priority) searchParams.set('priority', params.priority);
    if (params.status) searchParams.set('status', params.status);
    if (params.patientType) searchParams.set('patientType', params.patientType);
    if (params.specialtyId) searchParams.set('specialtyId', params.specialtyId);

    const url = `/api/hospitals/${hospitalId}/patients?${searchParams.toString()}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch patients');
    }

    return data;
  };

 const createPatient = async (patientData: CreatePatientData): Promise<ApiResponse<Patient>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api/hospitals/${hospitalId}/patients`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(patientData),
  });

  const data = await response.json();

  if (!response.ok) {
    // Fix: Check for both data.error and data.message
    const errorMessage = data.error || data.message || 'Failed to create patient';
    throw new Error(errorMessage);
  }

  return data;
};

  return { getPatients, createPatient };
};
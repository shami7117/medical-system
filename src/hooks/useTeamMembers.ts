// hooks/useTeamMembers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST';
  employeeId?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TeamMemberFormData {
  name: string;
  email: string;
  role: string;
  employeeId?: string;
  phone?: string;
}

export interface TeamMemberUpdateData extends TeamMemberFormData {
  isActive?: boolean;
}

export interface TeamMembersResponse {
  users: TeamMember[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Fetch team members
export function useTeamMembers(
  page: number = 1,
  limit: number = 10,
  role?: string,
  search?: string
) {
  return useQuery({
    queryKey: ['team-members', page, limit, role, search],
    queryFn: async (): Promise<TeamMembersResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (role && role !== 'all') params.append('role', role);
      if (search) params.append('search', search);

      const token = typeof window !== 'undefined' ? localStorage.getItem('hospital_auth_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`/api/team-members?${params}`, { credentials: 'include', headers });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch team members');
      }
      return response.json();
    },
  });
}

// Fetch single team member
export function useTeamMember(id: string) {
  return useQuery({
    queryKey: ['team-member', id],
    queryFn: async (): Promise<{ user: TeamMember }> => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hospital_auth_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`/api/team-members/${id}`, { credentials: 'include', headers });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch team member');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Create team member
export function useCreateTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TeamMemberFormData) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hospital_auth_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch('/api/team-members', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create team member');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Team member created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update team member
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TeamMemberUpdateData }) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hospital_auth_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`/api/team-members/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update team member');
      }
      
      return response.json();
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-member', id] });
      toast.success('Team member updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Delete team member
export function useDeleteTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hospital_auth_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`/api/team-members/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete team member');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Team member deactivated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Reset password
export function useResetPassword() {
  return useMutation({
    mutationFn: async (id: string) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hospital_auth_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`/api/team-members/${id}/reset-password`, {
        method: 'POST',
        credentials: 'include',
        headers,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset password');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Password reset successfully! New password sent to user\'s email.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
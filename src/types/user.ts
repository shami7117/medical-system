// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST';
  employeeId?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST';
  employeeId?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST';
  employeeId?: string;
  phone?: string;
  isActive?: boolean;
}

export interface BulkImportRequest {
  users: CreateUserRequest[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
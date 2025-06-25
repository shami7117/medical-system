// lib/api/auth.ts
export interface LoginCredentials {
    email: string
    password: string
  }
  
  export interface RegisterData {
    // Hospital data
    hospitalName: string
    hospitalCode: string
    hospitalAddress: string
    hospitalPhone: string
    hospitalEmail: string
    hospitalWebsite?: string
    // Admin data
    adminName: string
    adminEmail: string
    adminPassword: string
    adminEmployeeId?: string
  }
  
  export interface AuthResponse {
    success: boolean
    data: {
      token: string
      user: {
        id: string
        name: string
        email: string
        role: string
        employeeId?: string
        hospital: {
          id: string
          name: string
          email: string
        }
      }
    }
    message: string
  }
  
  export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })
  
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }
  
      return response.json()
    },
  
    register: async (data: RegisterData): Promise<AuthResponse> => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
  
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }
  
      return response.json()
    },
  
    // Refresh user data
    getProfile: async (token: string) => {
     try {
       const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
  
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
  
      return response.json()
     } catch (error) {
      console.error('Error fetching profile:', error)
     }
    },
    // Logout user (client-side only)
    logout: async () => {
      // Remove tokens and user data from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
      // Optionally, you can also call a backend endpoint to invalidate the session if needed
      const response =  await fetch('/api/auth/logout', { method: 'POST' ,credentials: 'include' });
      console.log('Logout response:', response);
      return { success: true, message: 'Logged out successfully' };
    },
  }


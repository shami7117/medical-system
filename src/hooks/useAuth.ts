// hooks/useAuth.ts
  import { useMutation, useQuery } from '@tanstack/react-query'
  import { useAuth } from '@/contexts/AuthContext'
  import { authApi, LoginCredentials, RegisterData } from '@/lib/api/auth'
  import { useRouter } from 'next/navigation'
  import { toast } from 'sonner' // or your preferred toast library
  
  export function useLogin() {
    const { login } = useAuth()
    const router = useRouter()
  
    return useMutation({
      mutationFn: authApi.login,
      onSuccess: (response) => {
        login(response.data.token, response.data.user)
        toast.success('Login successful!')
        router.push('/dashboard')
      },
      onError: (error: Error) => {
        toast.error(error.message)
      },
    })
  }
  
  export function useRegister() {
    const { login } = useAuth()
    const router = useRouter()
  
    return useMutation({
      mutationFn: authApi.register,
      onSuccess: (response) => {
        login(response.data.token, response.data.user)
        toast.success('Registration successful!')
        router.push('/dashboard')
      },
      onError: (error: Error) => {
        toast.error(error.message)
      },
    })
  }
  
  export function useProfile() {
    const { token, logout } = useAuth()
  
    return useQuery({
      queryKey: ['profile'],
      queryFn: () => authApi.getProfile(token!),
      enabled: !!token,
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.status === 401 || error?.status === 403) {
          logout()
          return false
        }
        return failureCount < 3
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    })
  }
  
  export function useLogout() {
    const { logout } = useAuth();
    const router = useRouter();
  
    return useMutation({
      mutationFn: authApi.logout,
      onSuccess: () => {
        logout();
        toast.success('Logged out successfully!');
        router.push('/login');
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    });
  }
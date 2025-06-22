// hooks/useAuth.ts
  import { useMutation, useQuery } from '@tanstack/react-query'
  import { useAuth } from '@/contexts/AuthContext'
  import { authApi, LoginCredentials, RegisterData } from '@/lib/api/auth'
  import { useRouter } from 'next/navigation'
  import { toast } from 'sonner' // or your preferred toast library

  
export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
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

  
export function useLogin() {
  const { login } = useAuth()
  const router = useRouter()

  return useMutation({
    mutationFn: async ({ email, password }: LoginPayload): Promise<LoginResponse> => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // must include this to receive HTTP-only JWT cookie
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Login failed")
      }

      return data
    },
    onSuccess: (data) => {
      if (!data?.token || !data?.user) {
        toast.error("Unexpected response from server.")
        return
      }

      login(data.token, data.user)
      toast.success("Login successful!")
      router.push("/dashboard")
    },
    onError: (error: unknown) => {
      let message = "An error occurred during login"

      if (error instanceof Error) {
        message = error.message
      }

      toast.error(message)
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
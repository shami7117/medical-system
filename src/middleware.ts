// middleware.ts (Next.js middleware for route protection)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/jwt'

// Define protected and public routes
const protectedRoutes = ['/dashboard', '/admin', '/settings', '/profile']
const publicRoutes = ['/login', '/register', '/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )
  
  // Enhanced debug logging
  console.log('=== Middleware Debug ===')
  console.log('Pathname:', pathname)
  console.log('Is Protected Route:', isProtectedRoute)
  console.log('Is Public Route:', isPublicRoute)
  
  const cookieToken = request.cookies.get('hospital_auth_token')?.value
  const headerToken = request.headers.get('authorization')?.replace('Bearer ', '')
  
  console.log('Cookie Token:', cookieToken ? 'Present' : 'Missing')
  console.log('Header Token:', headerToken ? 'Present' : 'Missing')

  if (isProtectedRoute) {
    const token = cookieToken || headerToken
    
    if (!token) {
      console.log('No token found, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      const payload = await verifyJWT(token)
      console.log('Token verified successfully:', payload ? 'Valid' : 'Invalid')
      
      if (!payload) {
        console.log('Invalid payload, redirecting to login')
        throw new Error('Invalid token')
      }
      
      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.userId)
      requestHeaders.set('x-hospital-id', payload.hospitalId)
      requestHeaders.set('x-user-role', payload.role)
      
      console.log('Access granted, proceeding to protected route')
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.log('Token verification failed:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect authenticated users from public routes (except home page)
  if (isPublicRoute && pathname !== '/') {
    const token = cookieToken
    console.log('Checking authenticated user on public route:', pathname)
    if (token) {
      try {
        const payload = await verifyJWT(token)
        console.log('Token verification result:', payload)
        console.log('Payload truthy check:', !!payload)
        if (payload) {
          console.log('Authenticated user accessing public route, redirecting to dashboard')
          return NextResponse.redirect(new URL('/dashboard', request.url))
        } else {
          console.log('Payload is falsy, not redirecting')
        }
      } catch (error:any) {
        console.log('Token verification threw error:', error.message)
        console.log('Full error:', error)
        // Token invalid, allow access to public route
      }
    } else {
      console.log('No token found on public route, allowing access')
    }
  }

  console.log('Allowing access to route')
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
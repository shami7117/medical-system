import { NextRequest } from 'next/server'
import { withAuth } from './auth-middleware'
import { errorResponse } from './api-response'
import { UserRole } from '@prisma/client'

export async function authorizeHospitalAccess(
  request: NextRequest,
  hospitalId: string,
  requiredRoles?: UserRole[]
) {
  const { user, error } = await withAuth(request)

  if (error || !user) {
    return { authorized: false, response: errorResponse('Unauthorized', 401) }
  }

  // Check if user belongs to the requested hospital
  if (user.hospitalId !== hospitalId) {
    return { authorized: false, response: errorResponse('Access denied to this hospital', 403) }
  }

  // Check role permissions if specified
  if (requiredRoles && !requiredRoles.includes(user.role as UserRole)) {
    return { authorized: false, response: errorResponse('Insufficient permissions', 403) }
  }

  return { authorized: true, user }
}
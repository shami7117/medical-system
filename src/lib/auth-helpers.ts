import { NextRequest } from 'next/server'
import { authenticateRequest } from './auth-middleware'
import { errorResponse } from './api-response'
import { UserRole } from '@prisma/client'

export async function authorizeHospitalAccess(
  request: NextRequest,
  hospitalId: string,
  requiredRoles?: UserRole[]
) {
  const auth = await authenticateRequest(request)

  if (!auth) {
    return { authorized: false, response: errorResponse('Unauthorized', 401) }
  }

  const { user, payload } = auth

  // Check if user belongs to the requested hospital
  if (payload.hospitalId !== hospitalId) {
    return { authorized: false, response: errorResponse('Access denied to this hospital', 403) }
  }

  // Check role permissions if specified
  if (requiredRoles && !requiredRoles.includes(user.role as UserRole)) {
    return { authorized: false, response: errorResponse('Insufficient permissions', 403) }
  }

  return { authorized: true, user, payload }
}
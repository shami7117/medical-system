import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request)

    if (error || !user) {
      return error || errorResponse('Unauthorized', 401)
    }

    return successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        hospital: user.hospital ? {
          id: user.hospital.id,
          name: user.hospital.name,
          email: user.hospital.email,
        } : undefined,
      },
    })

  } catch (error) {
    console.error('Get user error:', error)
    return errorResponse('Failed to get user information', 500)
  }
}
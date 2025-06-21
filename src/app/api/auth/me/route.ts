import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth) {
      return errorResponse('Unauthorized', 401)
    }

    const { user } = auth

    return successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        hospital: {
          id: user.hospital.id,
          name: user.hospital.name,
          email: user.hospital.email,
        },
      },
    })

  } catch (error) {
    console.error('Get user error:', error)
    return errorResponse('Failed to get user information', 500)
  }
}
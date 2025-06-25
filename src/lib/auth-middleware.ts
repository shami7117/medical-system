import { NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/jwt'
import { prisma } from '@/lib/db'
import { errorResponse } from '@/lib/api-response'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    hospitalId: string
    role: string
    email: string
  }
}

export async function withAuth(
  request: NextRequest,
  requiredRole?: string
): Promise<{ user: any; error: Response | null }> {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return {
        user: null,
        error: errorResponse('Authentication required', 401)
      }
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return {
        user: null,
        error: errorResponse('Invalid or expired token', 401)
      }
    }
    // Verify user exists and is active
    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        isActive: true,
      },
      include: {
        hospital: true,
      },
    })

    if (!user || !user.hospital.isActive) {
      return {
        user: null,
        error: errorResponse('User not found or inactive', 401)
      }
    }

    // Check role-based access
    if (requiredRole && user.role !== requiredRole) {
      return {
        user: null,
        error: errorResponse('Insufficient permissions', 403)
      }
    }

    return {
      user: {
        id: user.id,
        hospitalId: user.hospitalId,
        role: user.role,
        email: user.email,
        name: user.name,
        hospital:user.hospital ? {
          id: user.hospital.id,
          name: user.hospital.name,
          email: user.hospital.email,
        }: undefined
      },
      error: null
    }
  } catch (error) {
    return {
      user: null,
      error: errorResponse('Invalid token', 401)
    }
  }
}
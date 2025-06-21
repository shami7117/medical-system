import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth) {
      return errorResponse('Unauthorized', 401)
    }

    const { user } = auth

    // Return the hospital the user belongs to
    const hospital = await prisma.hospital.findUnique({
      where: {
        id: user.hospitalId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        logo: true,
        createdAt: true,
        _count: {
          select: {
            users: { where: { isActive: true } },
            patients: { where: { isActive: true } },
            visits: true,
            specialties: { where: { isActive: true } },
          },
        },
      },
    })

    if (!hospital) {
      return errorResponse('Hospital not found', 404)
    }

    return successResponse({
      hospital: {
        ...hospital,
        stats: {
          totalUsers: hospital._count.users,
          totalPatients: hospital._count.patients,
          totalVisits: hospital._count.visits,
          totalSpecialties: hospital._count.specialties,
        },
      },
    })

  } catch (error) {
    console.error('Get hospital error:', error)
    return errorResponse('Failed to get hospital information', 500)
  }
}
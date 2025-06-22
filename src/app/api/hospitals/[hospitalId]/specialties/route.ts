import { NextRequest } from 'next/server'
import { authorizeHospitalAccess } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET - List all specialties in the hospital
export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const auth = await authorizeHospitalAccess(request, context.params.hospitalId)

    if (!auth.authorized) {
      return auth.response
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: any = {
      hospitalId: context.params.hospitalId,
    }

    if (!includeInactive) {
      where.isActive = true
    }

    const specialties = await prisma.specialty.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            visits: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return successResponse({
      specialties: specialties.map(specialty => ({
        ...specialty,
        stats: {
          totalVisits: specialty._count.visits,
        },
      })),
    })

  } catch (error) {
    console.error('Get specialties error:', error)
    return errorResponse('Failed to get specialties', 500)
  }
}

// POST - Create new specialty
export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const auth = await authorizeHospitalAccess(request, context.params.hospitalId, ['ADMIN'])

    if (!auth.authorized) {
      return auth.response
    }

    const body = await request.json()
    const { name, description } = body

    // Validation
    if (!name) {
      return errorResponse('Specialty name is required')
    }

    // Check if specialty with this name already exists in this hospital
    const existingSpecialty = await prisma.specialty.findFirst({
      where: {
        name: name.trim(),
        hospitalId: context.params.hospitalId,
      },
    })

    if (existingSpecialty) {
      return errorResponse('Specialty with this name already exists')
    }

    // Create specialty
    const newSpecialty = await prisma.specialty.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        hospitalId: context.params.hospitalId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
      },
    })

    // Log specialty creation
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Specialty',
        entityId: newSpecialty.id,
        newValues: {
          name: newSpecialty.name,
          description: newSpecialty.description,
        },
        hospitalId: context.params.hospitalId,
        userId: auth.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return successResponse(newSpecialty, 'Specialty created successfully')

  } catch (error) {
    console.error('Create specialty error:', error)
    return errorResponse('Failed to create specialty', 500)
  }
}
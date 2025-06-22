import { NextRequest } from 'next/server'
import { authorizeHospitalAccess } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'
import { VisitType, VisitStatus } from '@prisma/client'

// GET - List all visits in the hospital
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status') as VisitStatus | null
    const type = searchParams.get('type') as VisitType | null
    const assignedToId = searchParams.get('assignedToId')
    const date = searchParams.get('date') // YYYY-MM-DD format

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      hospitalId: context.params.hospitalId,
    }

    if (patientId) {
      where.patientId = patientId
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (assignedToId) {
      where.assignedToId = assignedToId
    }

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)

      where.scheduledAt = {
        gte: startDate,
        lt: endDate,
      }
    }

    // Get visits with pagination
    const [visits, total] = await Promise.all([
      prisma.visit.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              mrn: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              phone: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          specialty: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          _count: {
            select: {
              vitals: true,
              clinicalNotes: true,
              progressNotes: true,
              prescriptions: true,
              results: true,
            },
          },
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.visit.count({ where }),
    ])

    return successResponse({
      visits: visits.map(visit => ({
        ...visit,
        patient: {
          ...visit.patient,
          fullName: `${visit.patient.firstName} ${visit.patient.lastName}`,
        },
        stats: {
          vitalsCount: visit._count.vitals,
          clinicalNotesCount: visit._count.clinicalNotes,
          progressNotesCount: visit._count.progressNotes,
          prescriptionsCount: visit._count.prescriptions,
          resultsCount: visit._count.results,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error('Get visits error:', error)
    return errorResponse('Failed to get visits', 500)
  }
}

// POST - Create new visit
export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const auth = await authorizeHospitalAccess(request, context.params.hospitalId, ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'])

    if (!auth.authorized) {
      return auth.response
    }

    const body = await request.json()
    const {
      patientId,
      type,
      chiefComplaint,
      scheduledAt,
      assignedToId,
      specialtyId,
    } = body

    // Validation
    if (!patientId || !type) {
      return errorResponse('Patient ID and visit type are required')
    }

    const validTypes: VisitType[] = ['EMERGENCY', 'CLINIC', 'FOLLOWUP', 'CONSULTATION']
    if (!validTypes.includes(type)) {
      return errorResponse('Invalid visit type')
    }

    // Verify patient belongs to this hospital
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        hospitalId: context.params.hospitalId,
        isActive: true,
      },
    })

    if (!patient) {
      return errorResponse('Patient not found or does not belong to this hospital')
    }

    // Verify assigned user belongs to this hospital (if provided)
    if (assignedToId) {
      const assignedUser = await prisma.user.findFirst({
        where: {
          id: assignedToId,
          hospitalId: context.params.hospitalId,
          isActive: true,
        },
      })

      if (!assignedUser) {
        return errorResponse('Assigned user not found or does not belong to this hospital')
      }
    }

    // Verify specialty belongs to this hospital (if provided)
    if (specialtyId) {
      const specialty = await prisma.specialty.findFirst({
        where: {
          id: specialtyId,
          hospitalId: context.params.hospitalId,
          isActive: true,
        },
      })

      if (!specialty) {
        return errorResponse('Specialty not found or does not belong to this hospital')
      }
    }

    // Generate unique visit number
    const visitCount = await prisma.visit.count({
      where: { hospitalId: context.params.hospitalId },
    })
    const visitNumber = `V${Date.now()}-${(visitCount + 1).toString().padStart(4, '0')}`

    // Create visit
    const newVisit = await prisma.visit.create({
      data: {
        visitNumber,
        type,
        chiefComplaint,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        status: 'SCHEDULED',
        hospitalId: context.params.hospitalId,
        patientId,
        createdById: auth.user.id,
        assignedToId,
        specialtyId,
      },
      include: {
        patient: {
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        specialty: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Log visit creation
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Visit',
        entityId: newVisit.id,
        newValues: {
          visitNumber: newVisit.visitNumber,
          patientName: `${newVisit.patient.firstName} ${newVisit.patient.lastName}`,
          type: newVisit.type,
        },
        hospitalId: context.params.hospitalId,
        userId: auth.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return successResponse({
      ...newVisit,
      patient: {
        ...newVisit.patient,
        fullName: `${newVisit.patient.firstName} ${newVisit.patient.lastName}`,
      },
    }, 'Visit created successfully')

  } catch (error) {
    console.error('Create visit error:', error)
    return errorResponse('Failed to create visit', 500)
  }
}
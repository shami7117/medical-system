import { NextRequest } from 'next/server'
import { authorizeHospitalAccess } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET - List all patients in the hospital
export async function GET(
  request: NextRequest,
  { params }: { params: { hospitalId: string } }
) {
  try {
    const auth = await authorizeHospitalAccess(request, params.hospitalId)

    if (!auth.authorized) {
      return auth.response
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      hospitalId: params.hospitalId,
      isActive: true,
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { mrn: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get patients with pagination
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        select: {
          id: true,
          mrn: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
          phone: true,
          email: true,
          address: true,
          emergencyContact: true,
          emergencyPhone: true,
          insuranceProvider: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              visits: true,
              problems: { where: { status: 'ACTIVE' } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.patient.count({ where }),
    ])

    return successResponse({
      patients: patients.map(patient => ({
        ...patient,
        fullName: `${patient.firstName} ${patient.lastName}`,
        age: Math.floor((Date.now() - patient.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
        stats: {
          totalVisits: patient._count.visits,
          activeProblems: patient._count.problems,
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
    console.error('Get patients error:', error)
    return errorResponse('Failed to get patients', 500)
  }
}

// POST - Create new patient
export async function POST(
  request: NextRequest,
  { params }: { params: { hospitalId: string } }
) {
  try {
    const auth = await authorizeHospitalAccess(request, params.hospitalId, ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'])

    if (!auth.authorized) {
      return auth.response
    }

    const body = await request.json()
    const {
      mrn,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      emergencyContact,
      emergencyPhone,
      insuranceNumber,
      insuranceProvider,
      occupation,
      maritalStatus,
    } = body

    // Validation
    if (!mrn || !firstName || !lastName || !dateOfBirth || !gender) {
      return errorResponse('MRN, first name, last name, date of birth, and gender are required')
    }

    const validGenders = ['M', 'F', 'O']
    if (!validGenders.includes(gender)) {
      return errorResponse('Gender must be M, F, or O')
    }

    // Check if MRN already exists in this hospital
    const existingPatient = await prisma.patient.findFirst({
      where: {
        mrn,
        hospitalId: params.hospitalId,
      },
    })

    if (existingPatient) {
      return errorResponse('Patient with this MRN already exists')
    }

    // Create patient
    const newPatient = await prisma.patient.create({
      data: {
        mrn,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        phone,
        email: email?.toLowerCase(),
        address,
        emergencyContact,
        emergencyPhone,
        insuranceNumber,
        insuranceProvider,
        occupation,
        maritalStatus,
        hospitalId: params.hospitalId,
        createdById: auth.user.id,
        isActive: true,
      },
      select: {
        id: true,
        mrn: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        phone: true,
        email: true,
        address: true,
        emergencyContact: true,
        emergencyPhone: true,
        insuranceProvider: true,
        createdAt: true,
      },
    })

    // Log patient creation
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Patient',
        entityId: newPatient.id,
        newValues: {
          mrn: newPatient.mrn,
          name: `${newPatient.firstName} ${newPatient.lastName}`,
        },
        hospitalId: params.hospitalId,
        userId: auth.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return successResponse({
      ...newPatient,
      fullName: `${newPatient.firstName} ${newPatient.lastName}`,
      age: Math.floor((Date.now() - newPatient.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
    }, 'Patient created successfully')

  } catch (error) {
    console.error('Create patient error:', error)
    return errorResponse('Failed to create patient', 500)
  }
}
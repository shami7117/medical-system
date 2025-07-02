import { NextRequest } from 'next/server'
import { authorizeHospitalAccess } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'

// Helper to extract dynamic route param
function extractHospitalIdFromUrl(request: NextRequest): string | null {
  const match = request.nextUrl.pathname.match(/\/hospitals\/([^/]+)\/patients/)
  return match ? match[1] : null
}

// GET - List all patients in the hospital
export async function GET(request: NextRequest) {
  try {
    const hospitalId = extractHospitalIdFromUrl(request)
    if (!hospitalId) return errorResponse('Invalid hospital ID', 400)

    const auth = await authorizeHospitalAccess(request, hospitalId)
    if (!auth.authorized) return auth.response

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const priority = searchParams.get('priority') // Filter by priority
    const status = searchParams.get('status') // Filter by status

    const skip = (page - 1) * limit

    // Patient type and specialty filters
    const patientType = searchParams.get('patientType');
    const specialtyId = searchParams.get('specialtyId');

    const where: any = {
      hospitalId,
      isActive: true,
    };

    if (patientType === 'EMERGENCY') {
      where.patientType = 'EMERGENCY';
    } else if (patientType === 'CLINIC') {
      where.patientType = 'CLINIC';
      if (specialtyId) {
        where.specialtyId = specialtyId;
      }
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

    // Add priority filter
    if (priority && ['Critical', 'Urgent', 'Routine'].includes(priority)) {
      where.priority = priority
    }

    // Add status filter
    if (status && ['Waiting', 'In Progress', 'Completed'].includes(status)) {
      where.status = status
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: {
          _count: {
            select: {
              visits: true,
              problems: true,
            },
          },
        },
        orderBy: [
          { priority: 'asc' } as any, // workaround for Prisma type error
          { arrivalTime: 'asc' } as any,
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      prisma.patient.count({ where }),
    ])

    return successResponse({
      patients: patients.map(patient => ({
        ...patient,
        fullName: `${patient.firstName} ${patient.lastName}`,
        age: Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
        stats: {
          totalVisits: patient._count?.visits ?? 0,
          activeProblems: patient._count?.problems ?? 0,
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
export async function POST(request: NextRequest) {
  try {
    const hospitalId = extractHospitalIdFromUrl(request)
    if (!hospitalId) return errorResponse('Invalid hospital ID', 400)

    const auth = await authorizeHospitalAccess(request, hospitalId, ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'])
    if (!auth.authorized) return auth.response

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
      arrivalTime,
      specialtyId,
      priority,
      status,
      patientType
    } = body

    if (!mrn || !firstName || !lastName || !dateOfBirth || !gender || !patientType) {
      return errorResponse('MRN, first name, last name, date of birth, gender, and patient type are required')
    }

    const validGenders = ['M', 'F', 'O']
    if (!validGenders.includes(gender)) {
      return errorResponse('Gender must be M, F, or O')
    }

    // Validate priority if provided
    if (priority && !['Critical', 'Urgent', 'Routine'].includes(priority)) {
      return errorResponse('Priority must be Critical, Urgent, or Routine')
    }

    // Validate status if provided
    if (status && !['Waiting', 'In Progress', 'Completed'].includes(status)) {
      return errorResponse('Status must be Waiting, In Progress, or Completed')
    }

    const existingPatient = await prisma.patient.findFirst({
      where: {
        mrn,
        hospitalId,
      },
    })

    if (existingPatient) {
      return errorResponse('Patient with this MRN already exists')
    }

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
        patientType: patientType || 'Emergency', // Default to Emergency if not provided
        emergencyPhone,
        insuranceNumber,
        insuranceProvider,
        occupation,
        specialtyId,
        maritalStatus,
        arrivalTime: arrivalTime ? new Date(arrivalTime) : null,
        priority: priority || 'Routine', // Default to Routine if not provided
        status: status || 'Waiting', // Default to Waiting if not provided
        hospitalId,
        createdById: auth.user.id,
        isActive: true,
      } as any,
      select: {
        id: true,
        mrn: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        patientType: true,
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

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Patient',
        entityId: newPatient.id,
        newValues: {
          mrn: (newPatient as any).mrn,
          name: `${(newPatient as any).firstName} ${(newPatient as any).lastName}`,
          priority: (newPatient as any).priority,
          status: (newPatient as any).status,
          arrivalTime: (newPatient as any).arrivalTime,
        },
        hospitalId,
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
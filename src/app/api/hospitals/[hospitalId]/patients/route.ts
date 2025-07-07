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
          visits: {
            select: {
              id: true,
              visitNumber: true,
              type: true,
              status: true,
              chiefComplaint: true,
              scheduledAt: true,
              checkedInAt: true,
              completedAt: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
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
        visits: patient.visits || [],
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

// POST - Create new patient with automatic visit creation
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
      patientType,
      chiefComplaint // Add this for visit creation
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

    // Check for existing patient
    const existingPatient = await prisma.patient.findFirst({
      where: { mrn, hospitalId },
    })

    if (existingPatient) {
      return errorResponse('Patient with this MRN already exists')
    }

    // Determine if we should create a visit
    const shouldCreateVisit = (
      patientType === 'EMERGENCY' || 
      (patientType === 'CLINIC' && arrivalTime)
    )

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the patient (remove visit-related fields from patient)
      const newPatient = await tx.patient.create({
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
          patientType,
          specialtyId: patientType === 'CLINIC' ? specialtyId : null,
          hospitalId,
          createdById: auth.user.id,
          isActive: true,
        },
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

      let newVisit = null

      // Create visit if needed
      if (shouldCreateVisit) {
        // Generate unique visit number
        const visitNumber = `${patientType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        const visitType = patientType === 'EMERGENCY' ? 'EMERGENCY' : 'CLINIC'
        const visitStatus = arrivalTime ? 'CHECKED_IN' : 'SCHEDULED'

        newVisit = await tx.visit.create({
          data: {
            visitNumber,
            type: visitType,
            status: visitStatus,
            chiefComplaint: chiefComplaint || null,
            scheduledAt: arrivalTime ? new Date(arrivalTime) : null,
            checkedInAt: arrivalTime ? new Date(arrivalTime) : null,
            patientId: newPatient.id,
            hospitalId,
            createdById: auth.user.id,
            assignedToId: null, // Will be assigned later
            specialtyId: patientType === 'CLINIC' ? specialtyId : null,
          },
          select: {
            id: true,
            visitNumber: true,
            type: true,
            status: true,
            chiefComplaint: true,
            scheduledAt: true,
            checkedInAt: true,
            createdAt: true,
          },
        })
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'Patient',
          entityId: newPatient.id,
          newValues: {
            mrn: newPatient.mrn,
            name: `${newPatient.firstName} ${newPatient.lastName}`,
            patientType,
            visitCreated: shouldCreateVisit,
            visitNumber: newVisit?.visitNumber || null,
          },
          hospitalId,
          userId: auth.user.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })

      return { patient: newPatient, visit: newVisit }
    })

    // Prepare response
    const response = {
      patient: {
        ...result.patient,
        fullName: `${result.patient.firstName} ${result.patient.lastName}`,
        age: Math.floor((Date.now() - result.patient.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
      },
      visit: result.visit,
      message: shouldCreateVisit 
        ? 'Patient and visit created successfully' 
        : 'Patient created successfully (no visit created)',
    }

    return successResponse(response, shouldCreateVisit 
      ? 'Patient and visit created successfully' 
      : 'Patient created successfully')

  } catch (error) {
    console.error('Create patient error:', error)
    return errorResponse('Failed to create patient', 500)
  }
}
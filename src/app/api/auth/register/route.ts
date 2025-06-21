import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { signJWT } from '@/lib/jwt'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { 
      // Hospital data
      hospitalName,
      hospitalCode,
      hospitalAddress,
      hospitalPhone,
      hospitalEmail,
      hospitalWebsite,
      // Admin data
      adminName,
      adminEmail,
      adminPassword,
      adminEmployeeId 
    } = body

    // Basic validation
    if (!hospitalName || !hospitalCode || !hospitalAddress || !hospitalPhone || !hospitalEmail) {
      return errorResponse('Hospital information is incomplete')
    }

    if (!adminName || !adminEmail || !adminPassword) {
      return errorResponse('Administrator information is incomplete')
    }

    if (adminPassword.length < 8) {
      return errorResponse('Password must be at least 8 characters long')
    }

    // Check if hospital code or email already exists
    const existingHospital = await prisma.hospital.findFirst({
      where: {
        OR: [
          { email: hospitalEmail },
          { name: hospitalName }
        ]
      }
    })

    if (existingHospital) {
      return errorResponse('Hospital with this name or email already exists')
    }

    // Check if admin email already exists across all hospitals
    const existingUser = await prisma.user.findFirst({
      where: { email: adminEmail }
    })

    if (existingUser) {
      return errorResponse('Administrator email already exists')
    }

    // Hash admin password
    const hashedPassword = await hashPassword(adminPassword)

    // Create hospital and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create hospital
      const hospital = await tx.hospital.create({
        data: {
          name: hospitalName,
          address: hospitalAddress,
          phone: hospitalPhone,
          email: hospitalEmail,
          website: hospitalWebsite,
          registrationStep: 3, // Complete registration
          isActive: true,
        }
      })

      // Create admin user
      const adminUser = await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          passwordHash: hashedPassword,
          employeeId: adminEmployeeId,
          hospitalId: hospital.id,
          role: 'ADMIN',
          isActive: true,
        },
        include: {
          hospital: true,
        }
      })

      // Create default specialties
      await tx.specialty.createMany({
        data: [
          { name: 'General Medicine', hospitalId: hospital.id },
          { name: 'Emergency', hospitalId: hospital.id },
          { name: 'Pediatrics', hospitalId: hospital.id },
          { name: 'Cardiology', hospitalId: hospital.id },
        ]
      })

      // Log the registration
      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'Hospital',
          entityId: hospital.id,
          newValues: {
            hospitalName: hospital.name,
            adminEmail: adminUser.email,
          },
          hospitalId: hospital.id,
          userId: adminUser.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      })

      return { hospital, adminUser }
    })

    // Generate JWT token
    const token = signJWT({
      userId: result.adminUser.id,
      hospitalId: result.hospital.id,
      role: result.adminUser.role,
      email: result.adminUser.email,
    })

    return successResponse({
      token,
      user: {
        id: result.adminUser.id,
        name: result.adminUser.name,
        email: result.adminUser.email,
        role: result.adminUser.role,
        employeeId: result.adminUser.employeeId,
        hospital: {
          id: result.hospital.id,
          name: result.hospital.name,
          email: result.hospital.email,
        },
      },
    }, 'Hospital registered successfully')

  } catch (error) {
    console.error('Registration error:', error)
    return errorResponse('Registration failed. Please try again.', 500)
  }
}
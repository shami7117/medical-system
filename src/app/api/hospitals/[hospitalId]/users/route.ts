import { NextRequest } from 'next/server'
import { authorizeHospitalAccess } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { successResponse, errorResponse } from '@/lib/api-response'
import { UserRole } from '@prisma/client'

// GET - List all users in the hospital
export async function GET(
  request: NextRequest,
  { params }: { params: { hospitalId: string } }
) {
  try {
    const auth = await authorizeHospitalAccess(request, params.hospitalId, ['ADMIN'])

    if (!auth.authorized) {
      return auth.response
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const role = searchParams.get('role') as UserRole | null
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      hospitalId: params.hospitalId,
    }

    if (role) {
      where.role = role
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          employeeId: true,
          phone: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return successResponse({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error('Get users error:', error)
    return errorResponse('Failed to get users', 500)
  }
}

// POST - Create new user
export async function POST(
  request: NextRequest,
  { params }: { params: { hospitalId: string } }
) {
  try {
    const auth = await authorizeHospitalAccess(request, params.hospitalId, ['ADMIN'])

    if (!auth.authorized) {
      return auth.response
    }

    const body = await request.json()
    const { name, email, password, employeeId, phone, role } = body

    // Validation
    if (!name || !email || !password || !role) {
      return errorResponse('Name, email, password, and role are required')
    }

    const validRoles: UserRole[] = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']
    if (!validRoles.includes(role)) {
      return errorResponse('Invalid role specified')
    }

    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters long')
    }

    // Check if email already exists in this hospital
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        hospitalId: params.hospitalId,
      },
    })

    if (existingUser) {
      return errorResponse('User with this email already exists in this hospital')
    }

    // Check if employee ID already exists in this hospital (if provided)
    if (employeeId) {
      const existingEmployeeId = await prisma.user.findFirst({
        where: {
          employeeId,
          hospitalId: params.hospitalId,
        },
      })

      if (existingEmployeeId) {
        return errorResponse('Employee ID already exists in this hospital')
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        employeeId,
        phone,
        role,
        hospitalId: params.hospitalId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    // Log user creation
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'User',
        entityId: newUser.id,
        newValues: {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        hospitalId: params.hospitalId,
        userId: auth.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return successResponse(newUser, 'User created successfully')

  } catch (error) {
    console.error('Create user error:', error)
    return errorResponse('Failed to create user', 500)
  }
}
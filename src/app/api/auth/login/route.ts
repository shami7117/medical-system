import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { signJWT } from '@/lib/jwt'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return errorResponse('Email and password are required')
    }

    // Find user with hospital data
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        isActive: true,
      },
      include: {
        hospital: true,
      },
    })

    if (!user) {
      return errorResponse('Invalid email or password', 401)
    }

    // Check if hospital is active
    if (!user.hospital.isActive) {
      return errorResponse('Hospital account is inactive', 403)
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash)

    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401)
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Log login
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        hospitalId: user.hospitalId,
        userId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    })

    // Generate JWT token (now async)
    const token = await signJWT({
      userId: user.id,
      hospitalId: user.hospitalId,
      role: user.role,
      email: user.email,
    })

    // Create response with user data
    const response = successResponse({
      token,
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
    }, 'Login successful')

    // Set the authentication cookie
    response.cookies.set('hospital_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('Login failed. Please try again.', 500)
  }
}
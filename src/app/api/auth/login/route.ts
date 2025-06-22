import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { signJWT } from '@/lib/jwt'

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
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
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!user.hospital.isActive) {
      return NextResponse.json(
        { message: 'Hospital account is inactive' },
        { status: 403 }
      )
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash)

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Log login event
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

    // Generate JWT
    const token = await signJWT({
      userId: user.id,
      hospitalId: user.hospitalId,
      role: user.role,
      email: user.email,
    })

    // Create response
    const response = NextResponse.json(
      {
        message: 'Login successful',
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
      }
    )

    // Set cookie
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
    return NextResponse.json(
      { message: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}

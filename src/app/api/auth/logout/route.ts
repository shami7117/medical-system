import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    
    const { user, error } = await withAuth(request)

    // if (error || !user) {
    //   return errorResponse('Unauthorized', 401)
    // }

    // Log logout
    // await prisma.auditLog.create({
    //   data: {
    //     action: 'LOGOUT',
    //     entity: 'User',
    //     entityId: user?.id,
    //     hospitalId: user?.hospitalId,
    //     userId: user?.id,
    //     ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    //     userAgent: request.headers.get('user-agent') || 'unknown',
    //   }
    // })
      console.log(`User ${user?.id} logged out`)

    // Always clear the cookie, regardless of authentication
    const response = NextResponse.json({ success: true, message: 'Logout successful' })
    response.headers.set(
      'Set-Cookie',
      'hospital_auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
    )
    return response

  } catch (error) {
    console.error('Logout error:', error)
    return errorResponse('Logout failed', 500)
  }
}
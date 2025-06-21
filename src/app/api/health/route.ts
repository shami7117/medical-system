import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`

    return successResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    })

  } catch (error) {
    console.error('Health check error:', error)
    return errorResponse('Service unhealthy', 503)
  }
}
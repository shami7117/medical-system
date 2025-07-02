import { NextRequest } from 'next/server';
import { authorizeHospitalAccess } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

// PATCH - Update patient status
export async function PATCH(
  request: NextRequest, 
  context: { params: Promise<{ hospitalId: string; patientId: string }> }
) {
  try {
    // Await params as per Next.js dynamic API requirements
    const { hospitalId, patientId } = await context.params;
    if (!hospitalId || !patientId) return errorResponse('Invalid hospital or patient ID', 400);

    const auth = await authorizeHospitalAccess(request, hospitalId, ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']);
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { status } = body;
    const validStatuses = ['Waiting', 'In Progress', 'Completed'];
    if (!validStatuses.includes(status)) {
      return errorResponse('Status must be Waiting, In Progress, or Completed', 400);
    }

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, hospitalId, isActive: true },
    });
    if (!patient) return errorResponse('Patient not found', 404);

    const updated = await prisma.patient.update({
      where: { id: patientId },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Patient',
        entityId: patientId,
        newValues: { status },
        hospitalId,
        userId: auth.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return successResponse({ ...updated }, 'Patient status updated successfully');
  } catch (error) {
    console.error('Update patient status error:', error);
    return errorResponse('Failed to update patient status', 500);
  }
}
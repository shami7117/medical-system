// app/api/visits/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/visits/[id] - Get a specific visit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    const visit = await prisma.visit.findUnique({
      where: { id: resolvedParams.id },
      include: {
        patient: {
          include: {
            medicalHistory: true,
            problems: true,
          },
        },
        assignedTo: true,
        specialty: true,
        vitals: {
          orderBy: { createdAt: 'desc' },
        },
        clinicalNotes: {
          orderBy: { createdAt: 'desc' },
        },
        progressNotes: {
          orderBy: { createdAt: 'desc' },
        },
        prescriptions: {
          orderBy: { createdAt: 'desc' },
        },
        results: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    return NextResponse.json(visit);
  } catch (error) {
    console.error('Error fetching visit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/visits/[id] - Update visit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { status, chiefComplaint, assignedToId, specialtyId } = body;

    const visit = await prisma.visit.update({
      where: { id: resolvedParams.id },
      data: {
        status,
        chiefComplaint,
        assignedToId,
        specialtyId,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
      },
      include: {
        patient: true,
        assignedTo: true,
        specialty: true,
      },
    });

    return NextResponse.json(visit);
  } catch (error) {
    console.error('Error updating visit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
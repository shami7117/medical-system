// app/api/visits/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/visits - Get all visits for a hospital
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospitalId');
    const patientId = searchParams.get('patientId');
    const type = searchParams.get('type'); // EMERGENCY, CLINIC, etc.

    if (!hospitalId) {
      return NextResponse.json({ error: 'Hospital ID is required' }, { status: 400 });
    }

    const where: any = { hospitalId };
    
    if (patientId) where.patientId = patientId;
    if (type) where.type = type;

    const visits = await prisma.visit.findMany({
      where,
      include: {
        patient: true,
        assignedTo: true,
        specialty: true,
        vitals: true,
        clinicalNotes: true,
        progressNotes: true,
        prescriptions: true,
        results: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// POST /api/visits - Create a new visit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      hospitalId,
      patientId,
      type,
      chiefComplaint,
      specialtyId,
      createdById,
      assignedToId,
      scheduledAt,
    } = body;

    if (!hospitalId || !patientId || !type || !createdById) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique visit number
    const visitCount = await prisma.visit.count({
      where: { hospitalId }
    });
    const visitNumber = `V${Date.now()}-${visitCount + 1}`;

    const visit = await prisma.visit.create({
      data: {
        visitNumber,
        hospitalId,
        patientId,
        type,
        chiefComplaint,
        specialtyId,
        createdById,
        assignedToId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        status: 'CHECKED_IN',
        checkedInAt: new Date(),
      },
      include: {
        patient: true,
        assignedTo: true,
        specialty: true,
      },
    });

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    console.error('Error creating visit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
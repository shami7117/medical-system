// app/api/visits/[id]/problems/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/visits/[id]/problems - Get problems for a patient via visit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    // First get the visit to get the patient ID
    const visit = await prisma.visit.findUnique({
      where: { id: resolvedParams.id },
      select: { patientId: true },
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    const problems = await prisma.problem.findMany({
      where: { patientId: visit.patientId },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(problems);
  } catch (error) {
    console.error('Error fetching problems:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/visits/[id]/problems - Create problem for a patient via visit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const {
      title,
      description,
      severity,
      onsetDate,
      hospitalId,
      createdById,
    } = body;

    if (!title || !hospitalId || !createdById) {
      return NextResponse.json(
        { error: 'Title, Hospital ID, and Created By ID are required' },
        { status: 400 }
      );
    }

    // First get the visit to get the patient ID
    const visit = await prisma.visit.findUnique({
      where: { id: resolvedParams.id },
      select: { patientId: true },
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    const problem = await prisma.problem.create({
      data: {
        patientId: visit.patientId,
        hospitalId,
        createdById,
        title,
        description,
        severity,
        onsetDate: onsetDate ? new Date(onsetDate) : undefined,
        status: 'ACTIVE',
      },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return NextResponse.json(problem, { status: 201 });
  } catch (error) {
    console.error('Error creating problem:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
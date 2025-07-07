// app/api/visits/[id]/vitals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/visits/[id]/vitals - Get vitals for a visit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    const vitals = await prisma.vitals.findMany({
      where: { visitId: resolvedParams.id },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(vitals);
  } catch (error) {
    console.error('Error fetching vitals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/visits/[id]/vitals - Create vitals for a visit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const {
      temperature,
      bloodPressureSys,
      bloodPressureDia,
      heartRate,
      respiratoryRate,
      oxygenSaturation,
      weight,
      height,
      painScore,
      notes,
      hospitalId,
      createdById,
    } = body;

    if (!hospitalId || !createdById) {
      return NextResponse.json(
        { error: 'Hospital ID and Created By ID are required' },
        { status: 400 }
      );
    }

    // Calculate BMI if weight and height are provided
    let bmi = null;
    if (weight && height) {
      const heightInMeters = height / 100;
      bmi = weight / (heightInMeters * heightInMeters);
    }

    const vitals = await prisma.vitals.create({
      data: {
        visitId: resolvedParams.id,
        hospitalId,
        createdById,
        temperature,
        bloodPressureSys,
        bloodPressureDia,
        heartRate,
        respiratoryRate,
        oxygenSaturation,
        weight,
        height,
        bmi,
        painScore,
        notes,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return NextResponse.json(vitals, { status: 201 });
  } catch (error) {
    console.error('Error creating vitals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
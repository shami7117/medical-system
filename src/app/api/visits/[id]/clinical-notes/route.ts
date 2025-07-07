// app/api/visits/[id]/clinical-notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/visits/[id]/clinical-notes - Get clinical notes for a visit
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const clinicalNotes = await prisma.clinicalNote.findMany({
      where: { visitId: params.id },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(clinicalNotes);
  } catch (error) {
    console.error('Error fetching clinical notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/visits/[id]/clinical-notes - Create clinical note for a visit
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const {
      title,
      content,
      noteType,
      attachments,
      hospitalId,
      createdById,
    } = body;

    if (!content || !hospitalId || !createdById) {
      return NextResponse.json(
        { error: 'Content, Hospital ID, and Created By ID are required' },
        { status: 400 }
      );
    }

    const clinicalNote = await prisma.clinicalNote.create({
      data: {
        visitId: params.id,
        hospitalId,
        createdById,
        title,
        content,
        noteType,
        attachments: attachments || [],
      },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return NextResponse.json(clinicalNote, { status: 201 });
  } catch (error) {
    console.error('Error creating clinical note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
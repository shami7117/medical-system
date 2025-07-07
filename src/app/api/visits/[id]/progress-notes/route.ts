// app/api/visits/[id]/progress-notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/visits/[id]/progress-notes - Get progress notes for a visit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    const progressNotes = await prisma.progressNote.findMany({
      where: { visitId: resolvedParams.id },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(progressNotes);
  } catch (error) {
    console.error('Error fetching progress notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/visits/[id]/progress-notes - Create progress note for a visit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const {
      content,
      noteType,
      isPrivate,
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

    const progressNote = await prisma.progressNote.create({
      data: {
        visitId: resolvedParams.id,
        hospitalId,
        createdById,
        content,
        noteType,
        isPrivate: isPrivate || false,
        attachments: attachments || [],
      },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return NextResponse.json(progressNote, { status: 201 });
  } catch (error) {
    console.error('Error creating progress note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
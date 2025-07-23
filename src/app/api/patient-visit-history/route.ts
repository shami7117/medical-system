// app/api/patient-visit-history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/patient-visit-history - Get all visits for a patient by MRN
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mrn = searchParams.get('mrn');
    const hospitalId = searchParams.get('hospitalId');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    if (!mrn) {
      return NextResponse.json({ error: 'Patient MRN is required' }, { status: 400 });
    }

    if (!hospitalId) {
      return NextResponse.json({ error: 'Hospital ID is required' }, { status: 400 });
    }
console.log('Fetching visits for MRN:', mrn, 'Hospital ID:', hospitalId);
    // First, find the patient by MRN
    const patient = await prisma.patient.findFirst({
      where: {
        mrn: mrn,
        hospitalId: hospitalId,
        isActive: true,
      },
      select: {
        id: true,
        mrn: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        phone: true,
        email: true,
        address: true,
        emergencyContact: true,
        emergencyPhone: true,
        insuranceNumber: true,
        insuranceProvider: true,
        occupation: true,
        maritalStatus: true,
        patientType: true,
        priority: true,
        status: true,
        createdAt: true,
      },
    });
console.log('Patient found:', patient);
    if (!patient) {
      return NextResponse.json({ 
        error: 'Patient not found with the provided MRN' 
      }, { status: 404 });
    }

    // Build query options for pagination
    const queryOptions: Parameters<typeof prisma.visit.findMany>[0] = {
      where: {
        patientId: patient.id,
        hospitalId: hospitalId,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, role: true, employeeId: true },
        },
        createdBy: {
          select: { id: true, name: true, role: true, employeeId: true },
        },
        specialty: {
          select: { id: true, name: true, description: true },
        },
        vitals: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get latest vitals for each visit
          include: {
            createdBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        clinicalNotes: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        progressNotes: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        prescriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        // Include problems related to each visit
        patient: {
          include: {
            problems: {
              where: { 
                status: { in: ['ACTIVE', 'RESOLVED', 'CHRONIC'] },
              },
              include: {
                createdBy: {
                  select: { id: true, name: true, role: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' }, // Most recent visits first
    };

    // Add pagination if provided
    if (limit) {
      queryOptions.take = parseInt(limit);
    }
    if (offset) {
      queryOptions.skip = parseInt(offset);
    }

    // Fetch all visits for this patient
    const visits = await prisma.visit.findMany(queryOptions);

    // Get total count for pagination
    const totalVisits = await prisma.visit.count({
      where: {
        patientId: patient.id,
        hospitalId: hospitalId,
      },
    });

    // Get patient's medical history
    const medicalHistory = await prisma.medicalHistory.findMany({
      where: {
        patientId: patient.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get all active problems for the patient
    const activeProblems = await prisma.problem.findMany({
      where: {
        patientId: patient.id,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    // Calculate visit statistics
    const visitStats = {
      total: totalVisits,
      emergency: visits.filter(v => v.type === 'EMERGENCY').length,
      clinic: visits.filter(v => v.type === 'CLINIC').length,
      completed: visits.filter(v => v.status === 'COMPLETED').length,
      inProgress: visits.filter(v => v.status === 'IN_PROGRESS').length,
      scheduled: visits.filter(v => v.status === 'SCHEDULED').length,
      cancelled: visits.filter(v => v.status === 'CANCELLED').length,
    };

    // Group visits by year and month for timeline view
    const visitTimeline = visits.reduce((timeline, visit) => {
      const visitDate = new Date(visit.createdAt);
      const year = visitDate.getFullYear();
      const month = visitDate.toLocaleString('default', { month: 'long' });
      const key = `${year}-${month}`;

      if (!timeline[key]) {
        timeline[key] = {
          year,
          month,
          visits: [],
          count: 0,
        };
      }

      timeline[key].visits.push(visit);
      timeline[key].count++;

      return timeline;
    }, {} as Record<string, { year: number; month: string; visits: any[]; count: number }>);

    // Convert timeline to array and sort
    const timelineArray = Object.values(visitTimeline as Record<string, { year: number; month: string; visits: any[]; count: number }>).sort((a, b) => {
      return new Date(`${b.year}-${b.month}-01`).getTime() - new Date(`${a.year}-${a.month}-01`).getTime();
    });

    const response = {
      success: true,
      patient: patient,
      visits: visits,
      medicalHistory: medicalHistory,
      activeProblems: activeProblems,
      statistics: visitStats,
      timeline: timelineArray,
      pagination: {
        total: totalVisits,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : 0,
        hasMore: limit ? (parseInt(offset || '0') + parseInt(limit)) < totalVisits : false,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching patient visit history:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/patient-visit-history/summary - Get summarized visit history
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mrn, hospitalId } = body;

    if (!mrn || !hospitalId) {
      return NextResponse.json({ 
        error: 'Patient MRN and Hospital ID are required' 
      }, { status: 400 });
    }

    // Find patient
    const patient = await prisma.patient.findFirst({
      where: {
        mrn: mrn,
        hospitalId: hospitalId,
        isActive: true,
      },
    });
console.log('Patient found:', patient);
    if (!patient) {
      return NextResponse.json({ 
        error: 'Patient not found with the provided MRN' 
      }, { status: 404 });
    }

    // Get summarized visit data (last 10 visits with basic info)
    const recentVisits = await prisma.visit.findMany({
      where: {
        patientId: patient.id,
        hospitalId: hospitalId,
      },
      select: {
        id: true,
        visitNumber: true,
        type: true,
        status: true,
        chiefComplaint: true,
        createdAt: true,
        completedAt: true,
        assignedTo: {
          select: { name: true, role: true },
        },
        specialty: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get latest vitals
    const latestVitals = await prisma.vitals.findFirst({
      where: {
        visit: {
          patientId: patient.id,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { name: true, role: true },
        },
      },
    });

    // Get active problems count
    const activeProblemsCount = await prisma.problem.count({
      where: {
        patientId: patient.id,
        status: 'ACTIVE',
      },
    });

    // Get total visits count
    const totalVisitsCount = await prisma.visit.count({
      where: {
        patientId: patient.id,
        hospitalId: hospitalId,
      },
    });

    const summary = {
      success: true,
      patient: {
        id: patient.id,
        mrn: patient.mrn,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        status: patient.status,
      },
      summary: {
        totalVisits: totalVisitsCount,
        activeProblems: activeProblemsCount,
        lastVisitDate: recentVisits.length > 0 ? recentVisits[0].createdAt : null,
        latestVitals: latestVitals,
      },
      recentVisits: recentVisits,
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Error fetching patient visit summary:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
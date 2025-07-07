// app/api/emergency-visit-notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/emergency-visit-notes - Get visit data with all related information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const visitId = searchParams.get('visitId');
    const hospitalId = searchParams.get('hospitalId');
    const patientId = searchParams.get('patientId');

    if (!hospitalId) {
      return NextResponse.json({ error: 'Hospital ID is required' }, { status: 400 });
    }

    let visitData = null;

    // If visitId is provided, get existing visit data
    if (visitId) {
      visitData = await prisma.visit.findUnique({
        where: { id: visitId },
        include: {
          patient: {
            include: {
              medicalHistory: true,
              problems: {
                where: { status: 'ACTIVE' },
                include: {
                  createdBy: {
                    select: { id: true, name: true, role: true },
                  },
                },
              },
            },
          },
          assignedTo: {
            select: { id: true, name: true, role: true },
          },
          specialty: true,
          vitals: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Get latest vitals
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
        },
      });

      if (!visitData) {
        return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
      }
    }

    // Get all patients for the dropdown (if no specific patient)
    const patients = await prisma.patient.findMany({
      where: { 
        hospitalId,
        isActive: true,
        ...(patientId && { id: patientId })
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
        arrivalTime: true,
        priority: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get specialties for dropdown
    const specialties = await prisma.specialty.findMany({
      where: { hospitalId, isActive: true },
      orderBy: { name: 'asc' },
    });

    // Get users for assignment dropdown
    const users = await prisma.user.findMany({
      where: { 
        hospitalId, 
        isActive: true,
        role: { in: ['DOCTOR', 'NURSE'] }
      },
      select: {
        id: true,
        name: true,
        role: true,
        employeeId: true,
      },
      orderBy: { name: 'asc' },
    });

    const response = {
      visit: visitData,
      patients,
      specialties,
      users,
      // Helper data for dropdowns
      patientTypes: ['EMERGENCY', 'CLINIC'],
      priorities: ['Critical', 'Urgent', 'Routine'],
      visitStatuses: ['SCHEDULED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED'],
      problemStatuses: ['ACTIVE', 'RESOLVED', 'CHRONIC', 'INACTIVE'],
      consciousnessLevels: ['Alert', 'Verbal', 'Pain', 'Unresponsive'],
      genders: ['M', 'F', 'O'],
      maritalStatuses: ['Single', 'Married', 'Divorced', 'Widowed'],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching emergency visit data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// Shared logic for saving emergency visit notes (used by POST and PUT)
async function saveEmergencyVisitNotes(body: any) {
  const {
    // Visit data
    visitId,
    hospitalId,
    patientId,
    createdById,
    assignedToId,
    specialtyId,
    visitType = 'EMERGENCY',
    // Patient data (if creating new patient)
    patientData,
    // Chief complaint and visit details
    chiefComplaint,
    isTraumaCase,
    // History of present illness
    presentIllnessHistory,
    // Examination findings
    examinationFindings,
    // Vital signs
    vitals,
    // Assessment and plan
    assessmentAndPlan,
    // Problems list
    problems,
    // Progress notes
    progressNotes,
    // Disposition
    disposition,
    // File attachments
    attachments,
  } = body;
console.log('Saving emergency visit notes with body:', body);
  if (!hospitalId || !createdById) {
    return { error: 'Hospital ID and Created By ID are required', status: 400 };
  }

  // --- NON-TRANSACTIONAL LOGIC (safe for API routes) ---
  let currentPatientId = patientId;

  // Create or update patient if patient data is provided
  if (patientData && !patientId) {
    // Generate unique MRN
    const patientCount = await prisma.patient.count({ where: { hospitalId } });
    const mrn = `MRN${Date.now()}-${patientCount + 1}`;

    const newPatient = await prisma.patient.create({
      data: {
        mrn,
        hospitalId,
        createdById,
        patientType: 'EMERGENCY',
        arrivalTime: new Date(),
        priority: 'Routine',
        status: 'Waiting',
        ...patientData,
      },
    });
    currentPatientId = newPatient.id;
  } else if (patientData && patientId) {
    // Only allow fields that exist in the Prisma Patient model
    const allowedPatientFields = [
      'firstName', 'lastName', 'mrn', 'dateOfBirth', 'gender', 'address', 'phone', 'email',
      'emergencyContact', 'emergencyPhone', 'insuranceNumber', 'insuranceProvider', 'occupation',
      'maritalStatus', 'patientType', 'specialtyId', 'arrivalTime', 'priority', 'status', 'isActive'
    ];
    const filteredPatientData = Object.fromEntries(
      Object.entries(patientData).filter(([key]) => allowedPatientFields.includes(key))
    );
    await prisma.patient.update({
      where: { id: patientId },
      data: filteredPatientData,
    });
  }

  if (!currentPatientId) {
    throw new Error('Patient ID is required');
  }

  let currentVisitId = visitId;

  // Create or update visit
  if (visitId) {
    // Update existing visit
    await prisma.visit.update({
      where: { id: visitId },
      data: {
        chiefComplaint,
        assignedToId,
        specialtyId,
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      },
    });
  } else {
    // Create new visit
    const visitCount = await prisma.visit.count({ where: { hospitalId } });
    const visitNumber = `V${Date.now()}-${visitCount + 1}`;

    const newVisit = await prisma.visit.create({
      data: {
        visitNumber,
        hospitalId,
        patientId: currentPatientId,
        createdById,
        assignedToId,
        specialtyId,
        type: visitType,
        chiefComplaint,
        status: 'IN_PROGRESS',
        checkedInAt: new Date(),
      },
    });
    currentVisitId = newVisit.id;
  }

  // Save vitals if provided
  if (vitals && Object.keys(vitals).length > 0) {
    // Calculate BMI if weight and height are provided
    let bmi = null;
    if (vitals.weight && vitals.height) {
      const heightInMeters = vitals.height / 100;
      bmi = vitals.weight / (heightInMeters * heightInMeters);
    }

    // Map incoming vitals fields to Prisma schema
    const mappedVitals = {
      temperature: vitals.temperature,
      bloodPressureSys: vitals.bloodPressureSystolic,
      bloodPressureDia: vitals.bloodPressureDiastolic,
      heartRate: vitals.heartRate,
      respiratoryRate: vitals.respiratoryRate,
      oxygenSaturation: vitals.oxygenSaturation,
      weight: vitals.weight,
      height: vitals.height,
      bmi,
      painScore: vitals.painScore,
      notes: vitals.notes,
      // Only include fields that exist in the Prisma model
    };

    await prisma.vitals.create({
      data: {
        visitId: currentVisitId,
        hospitalId,
        createdById,
        ...mappedVitals,
      },
    });
  }

  // Save clinical notes for different sections
  const clinicalNotesToSave = [];

  if (presentIllnessHistory) {
    clinicalNotesToSave.push({
      title: 'History of Present Illness',
      content: presentIllnessHistory,
      noteType: 'History',
    });
  }

  if (examinationFindings) {
    clinicalNotesToSave.push({
      title: 'Examination Findings',
      content: examinationFindings,
      noteType: 'Examination',
    });
  }

  if (assessmentAndPlan) {
    clinicalNotesToSave.push({
      title: 'Assessment and Plan',
      content: assessmentAndPlan,
      noteType: 'Assessment',
    });
  }

  // Create clinical notes
  for (const note of clinicalNotesToSave) {
    await prisma.clinicalNote.create({
      data: {
        visitId: currentVisitId,
        hospitalId,
        createdById,
        attachments: attachments || [],
        ...note,
      },
    });
  }

  // Save problems
  if (problems && problems.length > 0) {
    for (const problem of problems) {
      await prisma.problem.create({
        data: {
          patientId: currentPatientId,
          hospitalId,
          createdById,
          title: problem.title,
          description: problem.description,
          severity: problem.severity,
          status: problem.status || 'ACTIVE',
          onsetDate: problem.onsetDate ? new Date(problem.onsetDate) : undefined,
        },
      });
    }
  }

  // Save progress notes
  if (progressNotes && progressNotes.length > 0) {
    for (const note of progressNotes) {
      await prisma.progressNote.create({
        data: {
          visitId: currentVisitId,
          hospitalId,
          createdById,
          content: note.content,
          noteType: note.noteType || 'Progress Update',
          isPrivate: note.isPrivate || false,
          attachments: note.attachments || [],
        },
      });
    }
  }

  // Update patient disposition if provided
  if (disposition) {
    await prisma.patient.update({
      where: { id: currentPatientId },
      data: {
        status: disposition === 'discharge' ? 'Completed' : 'In Progress',
      },
    });

    // Update visit status based on disposition
    await prisma.visit.update({
      where: { id: currentVisitId },
      data: {
        status: disposition === 'discharge' ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: disposition === 'discharge' ? new Date() : undefined,
      },
    });
  }

  // Add trauma case flag if specified
  if (isTraumaCase) {
    await prisma.clinicalNote.create({
      data: {
        visitId: currentVisitId,
        hospitalId,
        createdById,
        title: 'Trauma Case',
        content: 'This case has been flagged as a trauma case.',
        noteType: 'Alert',
        attachments: [],
      },
    });
  }

  // Fetch the complete updated visit data
  const updatedVisit = await prisma.visit.findUnique({
    where: { id: currentVisitId },
    include: {
      patient: {
        include: {
          medicalHistory: true,
          problems: {
            where: { status: 'ACTIVE' },
            include: {
              createdBy: {
                select: { id: true, name: true, role: true },
              },
            },
          },
        },
      },
      assignedTo: {
        select: { id: true, name: true, role: true },
      },
      specialty: true,
      vitals: {
        orderBy: { createdAt: 'desc' },
        take: 1,
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
    },
  });

  return {
    success: true,
    message: 'Emergency visit notes saved successfully',
    data: updatedVisit,
    status: 201,
  };
}

// POST /api/emergency-visit-notes - Save complete emergency visit notes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await saveEmergencyVisitNotes(body);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
    }, { status: result.status });
  } catch (error: any) {
    console.error('Error saving emergency visit notes:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/emergency-visit-notes - Update existing emergency visit notes
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitId } = body;

    if (!visitId) {
      return NextResponse.json(
        { error: 'Visit ID is required for updates' },
        { status: 400 }
      );
    }

    // Check if visit exists
    const existingVisit = await prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!existingVisit) {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      );
    }

    // Use shared logic for update
    const result = await saveEmergencyVisitNotes(body);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
    }, { status: result.status });
  } catch (error: any) {
    console.error('Error updating emergency visit notes:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/emergency-visit-notes - Delete visit (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const visitId = searchParams.get('visitId');

    if (!visitId) {
      return NextResponse.json(
        { error: 'Visit ID is required' },
        { status: 400 }
      );
    }

    // Update visit status to cancelled instead of hard delete
    await prisma.visit.update({
      where: { id: visitId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Visit cancelled successfully',
    });

  } catch (error) {
    console.error('Error deleting visit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
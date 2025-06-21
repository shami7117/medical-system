// prisma/seed.ts
import { PrismaClient, UserRole, VisitType, VisitStatus, ResultType, ProblemStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ==============================================
  // STEP 1: Create Hospital (Step 1 of Registration)
  // ==============================================
  
  console.log('🏥 Creating hospitals...');
  
  const hospital1 = await prisma.hospital.upsert({
    where: { id: 'segal-hospital-001' },
    update: {},
    create: {
      id: 'segal-hospital-001',
      name: 'Segal Hospital',
      address: '123 Medical Center Drive, Healthcare City, HC 12345',
      phone: '+1 (555) 123-4567',
      email: 'info@segalhospital.com',
      website: 'https://segalhospital.com',
      registrationStep: 2, // Completed basic info, ready for admin setup
      isActive: true,
    },
  });

  const hospital2 = await prisma.hospital.upsert({
    where: { id: 'metro-general-002' },
    update: {},
    create: {
      id: 'metro-general-002',
      name: 'Metro General Hospital',
      address: '456 Central Avenue, Metro City, MC 67890',
      phone: '+1 (555) 987-6543',
      email: 'contact@metrogeneral.org',
      website: 'https://metrogeneral.org',
      registrationStep: 3, // Fully completed registration
      isActive: true,
    },
  });

  // ==============================================
  // STEP 2: Create Admin Users (Step 2 of Registration)
  // ==============================================
  
  console.log('👨‍💼 Creating admin users...');
  
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  
  const admin1 = await prisma.user.upsert({
    where: { email_hospitalId: { email: 'admin@segalhospital.com', hospitalId: hospital1.id } },
    update: {},
    create: {
      id: 'admin-segal-001',
      name: 'Dr. Sarah Johnson',
      email: 'admin@segalhospital.com',
      passwordHash: adminPassword,
      employeeId: 'EMP001',
      phone: '+1 (555) 123-4501',
      hospitalId: hospital1.id,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email_hospitalId: { email: 'admin@metrogeneral.org', hospitalId: hospital2.id } },
    update: {},
    create: {
      id: 'admin-metro-001',
      name: 'Dr. Michael Chen',
      email: 'admin@metrogeneral.org',
      passwordHash: adminPassword,
      employeeId: 'EMP001',
      phone: '+1 (555) 987-6501',
      hospitalId: hospital2.id,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  // ==============================================
  // STEP 3: Create Staff Members (Doctors, Nurses, Receptionists)
  // ==============================================
  
  console.log('👩‍⚕️ Creating hospital staff...');
  
  const staffPassword = await bcrypt.hash('Staff123!', 12);
  
  // Segal Hospital Staff
  const segalStaff = await Promise.all([
    // Doctors
    prisma.user.upsert({
      where: { email_hospitalId: { email: 'dr.smith@segalhospital.com', hospitalId: hospital1.id } },
      update: {},
      create: {
        name: 'Dr. Robert Smith',
        email: 'dr.smith@segalhospital.com',
        passwordHash: staffPassword,
        employeeId: 'DOC001',
        phone: '+1 (555) 123-4502',
        hospitalId: hospital1.id,
        role: UserRole.DOCTOR,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email_hospitalId: { email: 'dr.patel@segalhospital.com', hospitalId: hospital1.id } },
      update: {},
      create: {
        name: 'Dr. Priya Patel',
        email: 'dr.patel@segalhospital.com',
        passwordHash: staffPassword,
        employeeId: 'DOC002',
        phone: '+1 (555) 123-4503',
        hospitalId: hospital1.id,
        role: UserRole.DOCTOR,
        isActive: true,
      },
    }),
    // Nurses
    prisma.user.upsert({
      where: { email_hospitalId: { email: 'nurse.williams@segalhospital.com', hospitalId: hospital1.id } },
      update: {},
      create: {
        name: 'Nurse Jennifer Williams',
        email: 'nurse.williams@segalhospital.com',
        passwordHash: staffPassword,
        employeeId: 'NUR001',
        phone: '+1 (555) 123-4504',
        hospitalId: hospital1.id,
        role: UserRole.NURSE,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email_hospitalId: { email: 'nurse.davis@segalhospital.com', hospitalId: hospital1.id } },
      update: {},
      create: {
        name: 'Nurse Mark Davis',
        email: 'nurse.davis@segalhospital.com',
        passwordHash: staffPassword,
        employeeId: 'NUR002',
        phone: '+1 (555) 123-4505',
        hospitalId: hospital1.id,
        role: UserRole.NURSE,
        isActive: true,
      },
    }),
    // Receptionist
    prisma.user.upsert({
      where: { email_hospitalId: { email: 'reception@segalhospital.com', hospitalId: hospital1.id } },
      update: {},
      create: {
        name: 'Lisa Rodriguez',
        email: 'reception@segalhospital.com',
        passwordHash: staffPassword,
        employeeId: 'REC001',
        phone: '+1 (555) 123-4506',
        hospitalId: hospital1.id,
        role: UserRole.RECEPTIONIST,
        isActive: true,
      },
    }),
  ]);

  // Metro General Staff
  const metroStaff = await Promise.all([
    // Doctors
    prisma.user.upsert({
      where: { email_hospitalId: { email: 'dr.wilson@metrogeneral.org', hospitalId: hospital2.id } },
      update: {},
      create: {
        name: 'Dr. Emily Wilson',
        email: 'dr.wilson@metrogeneral.org',
        passwordHash: staffPassword,
        employeeId: 'DOC001',
        phone: '+1 (555) 987-6502',
        hospitalId: hospital2.id,
        role: UserRole.DOCTOR,
        isActive: true,
      },
    }),
    // Nurses
    prisma.user.upsert({
      where: { email_hospitalId: { email: 'nurse.taylor@metrogeneral.org', hospitalId: hospital2.id } },
      update: {},
      create: {
        name: 'Nurse David Taylor',
        email: 'nurse.taylor@metrogeneral.org',
        passwordHash: staffPassword,
        employeeId: 'NUR001',
        phone: '+1 (555) 987-6503',
        hospitalId: hospital2.id,
        role: UserRole.NURSE,
        isActive: true,
      },
    }),
    // Receptionist
    prisma.user.upsert({
      where: { email_hospitalId: { email: 'reception@metrogeneral.org', hospitalId: hospital2.id } },
      update: {},
      create: {
        name: 'Maria Gonzalez',
        email: 'reception@metrogeneral.org',
        passwordHash: staffPassword,
        employeeId: 'REC001',
        phone: '+1 (555) 987-6504',
        hospitalId: hospital2.id,
        role: UserRole.RECEPTIONIST,
        isActive: true,
      },
    }),
  ]);

  // ==============================================
  // STEP 4: Create Specialties
  // ==============================================
  
  console.log('🩺 Creating medical specialties...');
  
  const segalSpecialties = await Promise.all([
    prisma.specialty.upsert({
      where: { name_hospitalId: { name: 'General Medicine', hospitalId: hospital1.id } },
      update: {},
      create: {
        name: 'General Medicine',
        description: 'Primary care and general medical conditions',
        hospitalId: hospital1.id,
        isActive: true,
      },
    }),
    prisma.specialty.upsert({
      where: { name_hospitalId: { name: 'Emergency Medicine', hospitalId: hospital1.id } },
      update: {},
      create: {
        name: 'Emergency Medicine',
        description: 'Emergency and urgent care',
        hospitalId: hospital1.id,
        isActive: true,
      },
    }),
    prisma.specialty.upsert({
      where: { name_hospitalId: { name: 'Cardiology', hospitalId: hospital1.id } },
      update: {},
      create: {
        name: 'Cardiology',
        description: 'Heart and cardiovascular system',
        hospitalId: hospital1.id,
        isActive: true,
      },
    }),
    prisma.specialty.upsert({
      where: { name_hospitalId: { name: 'Pediatrics', hospitalId: hospital1.id } },
      update: {},
      create: {
        name: 'Pediatrics',
        description: 'Medical care for children',
        hospitalId: hospital1.id,
        isActive: true,
      },
    }),
  ]);

  // ==============================================
  // STEP 5: Create Sample Patients
  // ==============================================
  
  console.log('🏥 Creating sample patients...');
  
  const segalPatients = await Promise.all([
    prisma.patient.upsert({
      where: { mrn_hospitalId: { mrn: 'MRN001001', hospitalId: hospital1.id } },
      update: {},
      create: {
        mrn: 'MRN001001',
        firstName: 'John',
        lastName: 'Anderson',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'M',
        phone: '+1 (555) 111-2233',
        email: 'john.anderson@email.com',
        address: '789 Oak Street, Healthcare City, HC 12345',
        emergencyContact: 'Jane Anderson (Wife)',
        emergencyPhone: '+1 (555) 111-2234',
        insuranceNumber: 'INS123456789',
        insuranceProvider: 'HealthCare Plus',
        occupation: 'Software Engineer',
        maritalStatus: 'Married',
        hospitalId: hospital1.id,
        createdById: segalStaff[4].id, // Receptionist
        isActive: true,
      },
    }),
    prisma.patient.upsert({
      where: { mrn_hospitalId: { mrn: 'MRN001002', hospitalId: hospital1.id } },
      update: {},
      create: {
        mrn: 'MRN001002',
        firstName: 'Maria',
        lastName: 'Garcia',
        dateOfBirth: new Date('1992-07-22'),
        gender: 'F',
        phone: '+1 (555) 222-3344',
        email: 'maria.garcia@email.com',
        address: '456 Pine Avenue, Healthcare City, HC 12345',
        emergencyContact: 'Carlos Garcia (Brother)',
        emergencyPhone: '+1 (555) 222-3345',
        insuranceNumber: 'INS987654321',
        insuranceProvider: 'MediCare Pro',
        occupation: 'Teacher',
        maritalStatus: 'Single',
        hospitalId: hospital1.id,
        createdById: segalStaff[4].id, // Receptionist
        isActive: true,
      },
    }),
    prisma.patient.upsert({
      where: { mrn_hospitalId: { mrn: 'MRN001003', hospitalId: hospital1.id } },
      update: {},
      create: {
        mrn: 'MRN001003',
        firstName: 'Robert',
        lastName: 'Johnson',
        dateOfBirth: new Date('1978-11-08'),
        gender: 'M',
        phone: '+1 (555) 333-4455',
        email: 'robert.johnson@email.com',
        address: '321 Elm Drive, Healthcare City, HC 12345',
        emergencyContact: 'Susan Johnson (Wife)',
        emergencyPhone: '+1 (555) 333-4456',
        insuranceNumber: 'INS456789123',
        insuranceProvider: 'Family Health',
        occupation: 'Accountant',
        maritalStatus: 'Married',
        hospitalId: hospital1.id,
        createdById: segalStaff[4].id, // Receptionist
        isActive: true,
      },
    }),
  ]);

  // ==============================================
  // STEP 6: Create Medical History for Patients
  // ==============================================
  
  console.log('📋 Creating medical histories...');
  
  await Promise.all([
    prisma.medicalHistory.upsert({
      where: { id: 'med-hist-001' },
      update: {},
      create: {
        id: 'med-hist-001',
        allergies: ['Penicillin', 'Shellfish'],
        pastConditions: ['Hypertension', 'Type 2 Diabetes'],
        currentMedications: ['Metformin 500mg', 'Lisinopril 10mg'],
        surgicalHistory: ['Appendectomy (2010)'],
        familyHistory: ['Father: Heart Disease', 'Mother: Diabetes'],
        socialHistory: 'Non-smoker, occasional alcohol use',
        patientId: segalPatients[0].id,
      },
    }),
    prisma.medicalHistory.upsert({
      where: { id: 'med-hist-002' },
      update: {},
      create: {
        id: 'med-hist-002',
        allergies: ['Latex'],
        pastConditions: ['Asthma'],
        currentMedications: ['Albuterol Inhaler'],
        surgicalHistory: [],
        familyHistory: ['Mother: Asthma', 'Sister: Allergies'],
        socialHistory: 'Non-smoker, exercises regularly',
        patientId: segalPatients[1].id,
      },
    }),
  ]);

  // ==============================================
  // STEP 7: Create Sample Visits
  // ==============================================
  
  console.log('🚑 Creating sample visits...');
  
  const visits = await Promise.all([
    prisma.visit.upsert({
      where: { visitNumber_hospitalId: { visitNumber: 'VIS001001', hospitalId: hospital1.id } },
      update: {},
      create: {
        visitNumber: 'VIS001001',
        type: VisitType.CLINIC,
        status: VisitStatus.COMPLETED,
        chiefComplaint: 'Regular checkup and blood pressure monitoring',
        scheduledAt: new Date('2024-01-15T10:00:00Z'),
        checkedInAt: new Date('2024-01-15T10:05:00Z'),
        completedAt: new Date('2024-01-15T11:30:00Z'),
        hospitalId: hospital1.id,
        patientId: segalPatients[0].id,
        createdById: segalStaff[4].id, // Receptionist
        assignedToId: segalStaff[0].id, // Dr. Smith
        specialtyId: segalSpecialties[0].id, // General Medicine
      },
    }),
    prisma.visit.upsert({
      where: { visitNumber_hospitalId: { visitNumber: 'VIS001002', hospitalId: hospital1.id } },
      update: {},
      create: {
        visitNumber: 'VIS001002',
        type: VisitType.EMERGENCY,
        status: VisitStatus.COMPLETED,
        chiefComplaint: 'Severe asthma attack, difficulty breathing',
        scheduledAt: new Date('2024-01-20T14:30:00Z'),
        checkedInAt: new Date('2024-01-20T14:32:00Z'),
        completedAt: new Date('2024-01-20T16:45:00Z'),
        hospitalId: hospital1.id,
        patientId: segalPatients[1].id,
        createdById: segalStaff[4].id, // Receptionist
        assignedToId: segalStaff[1].id, // Dr. Patel
        specialtyId: segalSpecialties[1].id, // Emergency Medicine
      },
    }),
    prisma.visit.upsert({
      where: { visitNumber_hospitalId: { visitNumber: 'VIS001003', hospitalId: hospital1.id } },
      update: {},
      create: {
        visitNumber: 'VIS001003',
        type: VisitType.FOLLOWUP,
        status: VisitStatus.SCHEDULED,
        chiefComplaint: 'Follow-up for diabetes management',
        scheduledAt: new Date('2024-06-15T09:00:00Z'),
        hospitalId: hospital1.id,
        patientId: segalPatients[0].id,
        createdById: segalStaff[4].id, // Receptionist
        assignedToId: segalStaff[0].id, // Dr. Smith
        specialtyId: segalSpecialties[0].id, // General Medicine
      },
    }),
  ]);

  // ==============================================
  // STEP 8: Create Vitals for Completed Visits
  // ==============================================
  
  console.log('🩺 Creating vital signs...');
  
  await Promise.all([
    prisma.vitals.create({
      data: {
        temperature: 98.6,
        bloodPressureSys: 140,
        bloodPressureDia: 85,
        heartRate: 78,
        respiratoryRate: 16,
        oxygenSaturation: 98.5,
        weight: 82.5,
        height: 177.8,
        bmi: 26.1,
        painScore: 2,
        notes: 'Slightly elevated BP, consistent with patient history',
        hospitalId: hospital1.id,
        visitId: visits[0].id,
        createdById: segalStaff[2].id, // Nurse Williams
      },
    }),
    prisma.vitals.create({
      data: {
        temperature: 99.1,
        bloodPressureSys: 120,
        bloodPressureDia: 75,
        heartRate: 110,
        respiratoryRate: 22,
        oxygenSaturation: 92.0,
        weight: 65.2,
        height: 162.5,
        bmi: 24.7,
        painScore: 6,
        notes: 'Elevated heart rate and respiratory rate due to asthma exacerbation',
        hospitalId: hospital1.id,
        visitId: visits[1].id,
        createdById: segalStaff[3].id, // Nurse Davis
      },
    }),
  ]);

  // ==============================================
  // STEP 9: Create Clinical Notes
  // ==============================================
  
  console.log('📝 Creating clinical notes...');
  
  await Promise.all([
    prisma.clinicalNote.create({
      data: {
        title: 'Routine Diabetes Follow-up',
        content: `
## Assessment
Patient presents for routine diabetes follow-up. HbA1c levels have improved since last visit (7.2% down from 8.1%). 
Blood pressure remains slightly elevated at 140/85 but stable.

## Plan
- Continue current Metformin dosage
- Increase Lisinopril to 15mg daily
- Schedule follow-up in 3 months
- Patient education on dietary modifications reinforced
- Referral to nutritionist recommended

## Next Steps
- Lab work in 6 weeks (HbA1c, lipid panel)
- Blood pressure monitoring at home
- Weight management program enrollment
        `,
        noteType: 'Assessment and Plan',
        attachments: [],
        hospitalId: hospital1.id,
        visitId: visits[0].id,
        createdById: segalStaff[0].id, // Dr. Smith
      },
    }),
    prisma.clinicalNote.create({
      data: {
        title: 'Emergency Asthma Exacerbation',
        content: `
## Presentation
28-year-old female presents with acute severe asthma exacerbation. Patient reports sudden onset of dyspnea, 
wheezing, and chest tightness approximately 2 hours prior to arrival.

## Physical Examination
- Respiratory distress evident
- Audible wheezing on inspiration and expiration
- Use of accessory muscles
- O2 sat 92% on room air

## Treatment Provided
- Nebulized albuterol 2.5mg x3 treatments
- Methylprednisolone 125mg IV
- Oxygen therapy
- Peak flow improved from 180 to 320 L/min

## Disposition
Patient responded well to treatment. Discharged home with prednisone taper and rescue inhaler refill.
        `,
        noteType: 'Emergency Assessment',
        attachments: [],
        hospitalId: hospital1.id,
        visitId: visits[1].id,
        createdById: segalStaff[1].id, // Dr. Patel
      },
    }),
  ]);

  // ==============================================
  // STEP 10: Create Progress Notes
  // ==============================================
  
  console.log('📋 Creating progress notes...');
  
  await Promise.all([
    prisma.progressNote.create({
      data: {
        content: 'Patient vital signs stable. Blood pressure medication compliance discussed. Patient reports taking medications as prescribed. No adverse effects noted.',
        noteType: 'Nursing Assessment',
        isPrivate: false,
        attachments: [],
        hospitalId: hospital1.id,
        visitId: visits[0].id,
        createdById: segalStaff[2].id, // Nurse Williams
      },
    }),
    prisma.progressNote.create({
      data: {
        content: 'Patient showing significant improvement after nebulizer treatments. Respiratory rate decreased to 18/min. Patient able to speak in full sentences. O2 saturation improved to 96% on room air.',
        noteType: 'Treatment Response',
        isPrivate: false,
        attachments: [],
        hospitalId: hospital1.id,
        visitId: visits[1].id,
        createdById: segalStaff[3].id, // Nurse Davis
      },
    }),
  ]);

  // ==============================================
  // STEP 11: Create Prescriptions
  // ==============================================
  
  console.log('💊 Creating prescriptions...');
  
  await Promise.all([
    prisma.prescription.create({
      data: {
        medicationName: 'Lisinopril',
        dosage: '15mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take in the morning with or without food. Monitor blood pressure.',
        quantity: 30,
        refills: 5,
        status: 'ACTIVE',
        startDate: new Date('2024-01-15'),
        hospitalId: hospital1.id,
        visitId: visits[0].id,
        createdById: segalStaff[0].id, // Dr. Smith
      },
    }),
    prisma.prescription.create({
      data: {
        medicationName: 'Prednisone',
        dosage: '40mg',
        frequency: 'Once daily for 3 days, then 20mg daily for 3 days, then 10mg daily for 3 days',
        duration: '9 days total',
        instructions: 'Take with food to reduce stomach upset. Complete the full course as directed.',
        quantity: 18,
        refills: 0,
        status: 'ACTIVE',
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-01-29'),
        hospitalId: hospital1.id,
        visitId: visits[1].id,
        createdById: segalStaff[1].id, // Dr. Patel
      },
    }),
    prisma.prescription.create({
      data: {
        medicationName: 'Albuterol Inhaler',
        dosage: '90mcg',
        frequency: '2 puffs every 4-6 hours as needed',
        duration: 'As needed',
        instructions: 'Use for acute shortness of breath or wheezing. Shake well before use.',
        quantity: 1,
        refills: 3,
        status: 'ACTIVE',
        startDate: new Date('2024-01-20'),
        hospitalId: hospital1.id,
        visitId: visits[1].id,
        createdById: segalStaff[1].id, // Dr. Patel
      },
    }),
  ]);

  // ==============================================
  // STEP 12: Create Sample Results
  // ==============================================
  
  console.log('🧪 Creating lab results...');
  
  await Promise.all([
    prisma.result.create({
      data: {
        title: 'HbA1c and Lipid Panel',
        type: ResultType.LAB,
        status: 'COMPLETED',
        description: 'Diabetes monitoring lab work',
        findings: `
HbA1c: 7.2% (Target: <7.0%)
Glucose (fasting): 142 mg/dL (High)
Total Cholesterol: 185 mg/dL (Normal)
LDL: 110 mg/dL (Borderline High)
HDL: 45 mg/dL (Low)
Triglycerides: 150 mg/dL (Normal)
        `,
        files: ['lab-reports/hba1c-20240115.pdf'],
        isAbnormal: true,
        criticalFlag: false,
        hospitalId: hospital1.id,
        visitId: visits[0].id,
        createdById: segalStaff[0].id, // Dr. Smith
        reviewedById: segalStaff[0].id,
        reviewedAt: new Date('2024-01-15T12:00:00Z'),
      },
    }),
    prisma.result.create({
      data: {
        title: 'Chest X-Ray',
        type: ResultType.RADIOLOGY,
        status: 'COMPLETED',
        description: 'Emergency chest imaging for respiratory distress',
        findings: `
FINDINGS:
- Lungs are hyperinflated consistent with acute asthma exacerbation
- No acute infiltrates or pneumothorax
- Heart size is normal
- No pleural effusion

IMPRESSION:
Hyperinflated lungs consistent with acute asthma exacerbation. No acute cardiopulmonary process.
        `,
        files: ['radiology/chest-xray-20240120.jpg'],
        isAbnormal: true,
        criticalFlag: false,
        hospitalId: hospital1.id,
        visitId: visits[1].id,
        createdById: segalStaff[1].id, // Dr. Patel
        reviewedById: segalStaff[1].id,
        reviewedAt: new Date('2024-01-20T15:30:00Z'),
      },
    }),
  ]);

  // ==============================================
  // STEP 13: Create Problems
  // ==============================================
  
  console.log('🩹 Creating patient problems...');
  
  await Promise.all([
    prisma.problem.create({
      data: {
        title: 'Type 2 Diabetes Mellitus',
        description: 'Well-controlled diabetes with recent improvement in HbA1c levels',
        status: ProblemStatus.ACTIVE,
        severity: 'Moderate',
        onsetDate: new Date('2020-03-01'),
        hospitalId: hospital1.id,
        patientId: segalPatients[0].id,
        createdById: segalStaff[0].id, // Dr. Smith
      },
    }),
    prisma.problem.create({
      data: {
        title: 'Essential Hypertension',
        description: 'Hypertension requiring medication management',
        status: ProblemStatus.ACTIVE,
        severity: 'Mild',
        onsetDate: new Date('2019-06-15'),
        hospitalId: hospital1.id,
        patientId: segalPatients[0].id,
        createdById: segalStaff[0].id, // Dr. Smith
      },
    }),
    prisma.problem.create({
      data: {
        title: 'Bronchial Asthma',
        description: 'Intermittent asthma with occasional exacerbations',
        status: ProblemStatus.ACTIVE,
        severity: 'Moderate',
        onsetDate: new Date('2018-01-10'),
        hospitalId: hospital1.id,
        patientId: segalPatients[1].id,
        createdById: segalStaff[1].id, // Dr. Patel
      },
    }),
  ]);

  // ==============================================
  // STEP 14: Create Audit Logs
  // ==============================================
  
  console.log('📊 Creating audit logs...');
  
  await Promise.all([
    prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        entity: 'User',
        entityId: admin1.id,
        newValues: { loginTime: new Date() },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        hospitalId: hospital1.id,
        userId: admin1.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Patient',
        entityId: segalPatients[0].id,
        newValues: { 
          mrn: segalPatients[0].mrn,
          name: `${segalPatients[0].firstName} ${segalPatients[0].lastName}`,
        },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        hospitalId: hospital1.id,
        userId: segalStaff[4].id, // Receptionist
      },
    }),
    prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Visit',
        entityId: visits[0].id,
        newValues: { 
          visitNumber: visits[0].visitNumber,
          patientId: visits[0].patientId,
          type: visits[0].type,
        },
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        hospitalId: hospital1.id,
        userId: segalStaff[0].id, // Dr. Smith
      },
    }),
  ]);

  // ==============================================
  // FINAL STEP: Update Hospital Registration Status
  // ==============================================
  
  console.log('✅ Completing hospital registration...');
  
  await prisma.hospital.update({
    where: { id: hospital1.id },
    data: {
      registrationStep: 3, // Registration complete
      isActive: true,
    },
  });

  console.log('🎉 Database seeded successfully!');
  console.log('\n📋 Seed Summary:');
  console.log(`✅ Created 2 hospitals:`);
  console.log(`   - ${hospital1.name} (ID: ${hospital1.id})`);
  console.log(`   - ${hospital2.name} (ID: ${hospital2.id})`);
  console.log(`✅ Created ${2 + segalStaff.length + metroStaff.length} users (2 admins + ${segalStaff.length + metroStaff.length} staff)`);
  console.log(`✅ Created ${segalSpecialties.length} specialties`);
  console.log(`✅ Created ${segalPatients.length} patients with medical histories`);
  console.log(`✅ Created ${visits.length} visits with complete clinical data`);
  console.log(`✅ Generated comprehensive clinical documentation`);
  console.log('\n🔐 Login Credentials:');
  console.log(`Admin (${hospital1.name}): admin@segalhospital.com / Admin123!`);
  console.log(`Admin (${hospital2.name}): admin@metrogeneral.org / Admin123!`);
  console.log(`Staff: dr.smith@segalhospital.com / Staff123!`);
  console.log(`Staff: nurse.williams@segalhospital.com / Staff123!`);
  console.log(`Staff: reception@segalhospital.com / Staff123!`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
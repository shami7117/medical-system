// app/api/team-members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';
import { validateAdmin } from '@/lib/auth';

const prisma = new PrismaClient();

// Generate random password
function generatePassword(length: number = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  try {
    // Validate admin authorization
    const adminUser = await validateAdmin(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      role,
      employeeId,
      phone
    } = body;

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required fields." },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be one of: ADMIN, DOCTOR, NURSE, RECEPTIONIST" },
        { status: 400 }
      );
    }

    // Check if user already exists in this hospital
    const existingUser = await prisma.user.findUnique({
      where: {
        email_hospitalId: {
          email: email,
          hospitalId: adminUser.hospitalId
        }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists in your hospital." },
        { status: 409 }
      );
    }

    // Generate password and hash it
    const plainPassword = generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 12);

    // Get hospital details for email
    const hospital = await prisma.hospital.findUnique({
      where: { id: adminUser.hospitalId },
      select: { name: true, email: true, phone: true, address: true }
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found." },
        { status: 404 }
      );
    }

    // Create new team member
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        employeeId,
        phone,
        hospitalId: adminUser.hospitalId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    });

    // Send welcome email
    try {
      await sendWelcomeEmail({
        to: email,
        userName: name,
        userEmail: email,
        password: plainPassword,
        role: role,
        hospitalName: hospital.name,
        hospitalContact: hospital.phone || '',
        employeeId: employeeId || ''
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue execution - user is created but email failed
    }

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'User',
        entityId: newUser.id,
        newValues: {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        },
        hospitalId: adminUser.hospitalId,
        userId: adminUser.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      message: "Team member created successfully. Welcome email sent.",
      user: newUser
    });

  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}

// GET - List all team members for the hospital
export async function GET(request: NextRequest) {
  try {
    const adminUser = await validateAdmin(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      hospitalId: adminUser.hospitalId
    };

    if (role && role !== 'all') {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          employeeId: true,
          phone: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
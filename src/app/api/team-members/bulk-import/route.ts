// app/api/team-members/bulk-import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { validateAdmin } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

const prisma = new PrismaClient();

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
    const adminUser = await validateAdmin(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { users } = body;

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: "Users array is required." },
        { status: 400 }
      );
    }

    const validRoles = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'];
    const results = [];
    const hospital = await prisma.hospital.findUnique({
      where: { id: adminUser.hospitalId },
      select: { name: true }
    });

    for (const userData of users) {
      try {
        const { name, email, role, employeeId, phone } = userData;

        // Validate required fields
        if (!name || !email || !role) {
          results.push({
            email,
            success: false,
            error: "Name, email, and role are required."
          });
          continue;
        }

        // Validate role
        if (!validRoles.includes(role)) {
          results.push({
            email,
            success: false,
            error: "Invalid role."
          });
          continue;
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: {
            email_hospitalId: {
              email: email,
              hospitalId: adminUser.hospitalId
            }
          }
        });

        if (existingUser) {
          results.push({
            email,
            success: false,
            error: "User already exists."
          });
          continue;
        }

        // Create user
        const plainPassword = generatePassword();
        const passwordHash = await bcrypt.hash(plainPassword, 12);

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
            hospitalName: hospital?.name || 'Hospital',
            hospitalContact: '',
            employeeId: employeeId || ''
          });
        } catch (emailError) {
          console.error(`Failed to send email to ${email}:`, emailError);
        }

        results.push({
          email,
          success: true,
          userId: newUser.id
        });

      } catch (error) {
        results.push({
          email: userData.email || 'unknown',
          success: false,
          error: "Failed to create user."
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Bulk import completed. ${successful} successful, ${failed} failed.`,
      results
    });

  } catch (error) {
    console.error('Error in bulk import:', error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
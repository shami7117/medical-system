// app/api/team-members/[id]/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { validateAdmin } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

const prisma = new PrismaClient();

function generatePassword(length: number = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const adminUser = await validateAdmin(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: {
        id: id,
        hospitalId: adminUser.hospitalId
      },
      include: {
        hospital: {
          select: { name: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Team member not found." },
        { status: 404 }
      );
    }

    // Generate new password
    const newPassword = generatePassword();
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: id },
      data: { passwordHash }
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail({
        to: user.email,
        userName: user.name,
        newPassword: newPassword,
        hospitalName: user.hospital.name
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'User',
        entityId: id,
        newValues: { passwordReset: true },
        hospitalId: adminUser.hospitalId,
        userId: adminUser.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. New password sent to user's email."
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
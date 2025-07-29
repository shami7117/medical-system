// app/api/team-members/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { validateAdmin } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

const prisma = new PrismaClient();

// GET single team member
export async function GET(
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

    const user = await prisma.user.findUnique({
      where: {
        id: id,
        hospitalId: adminUser.hospitalId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Team member not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// PUT - Update team member
export async function PUT(
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

    const body = await request.json();
    const { name, email, role, employeeId, phone, isActive } = body;

    // Validate role if provided
    if (role) {
      const validRoles = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: "Invalid role." },
          { status: 400 }
        );
      }
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: id,
        hospitalId: adminUser.hospitalId
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Team member not found." },
        { status: 404 }
      );
    }

    // Check email uniqueness if email is being changed
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: {
          email_hospitalId: {
            email: email,
            hospitalId: adminUser.hospitalId
          }
        }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists." },
          { status: 409 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(employeeId !== undefined && { employeeId }),
        ...(phone !== undefined && { phone }),
        ...(isActive !== undefined && { isActive })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        phone: true,
        isActive: true,
        updatedAt: true
      }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'User',
        entityId: id,
        oldValues: {
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          isActive: existingUser.isActive
        },
        newValues: {
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isActive: updatedUser.isActive
        },
        hospitalId: adminUser.hospitalId,
        userId: adminUser.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      message: "Team member updated successfully.",
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate team member (soft delete)
export async function DELETE(
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: id,
        hospitalId: adminUser.hospitalId
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Team member not found." },
        { status: 404 }
      );
    }

    // Prevent admin from deleting themselves
    if (id === adminUser.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id: id },
      data: { isActive: false }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'User',
        entityId: id,
        oldValues: { isActive: true },
        newValues: { isActive: false },
        hospitalId: adminUser.hospitalId,
        userId: adminUser.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      message: "Team member deactivated successfully."
    });

  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

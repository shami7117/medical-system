// lib/auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JWTPayload {
  userId: string;
  hospitalId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function validateAdmin(request: NextRequest) {
  try {
    // Try to get token from Authorization header
    let token: string | undefined;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Try to get token from cookies
      const cookieToken = request.cookies.get('token');
      if (cookieToken) {
        token = cookieToken.value;
      }
    }

    if (!token) {
      return null;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        hospitalId: true,
        isActive: true
      }
    });

    // Check if user exists and is admin
    if (!user || user.role !== 'ADMIN') {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth validation error:', error);
    return null;
  }
}

export async function validateUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        hospitalId: true,
        isActive: true
      }
    });

    return user;
  } catch (error) {
    console.error('Auth validation error:', error);
    return null;
  }
}
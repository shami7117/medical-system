// lib/jwt.ts - Edge Runtime Compatible JWT Functions
import { SignJWT, jwtVerify } from 'jose'

export interface JWTPayload {
  userId: string
  hospitalId: string
  role: string
  email: string
}

const JWT_SECRET_STRING = process.env.JWT_SECRET || ''
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING)
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export async function signJWT(payload: JWTPayload): Promise<string> {
  if (!JWT_SECRET_STRING) {
    throw new Error('JWT_SECRET is not set')
  }
  
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET)
  
  return jwt
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    if (!JWT_SECRET_STRING) {
      console.error('JWT_SECRET is not set for verification')
      return null
    }
    
    const { payload } = await jwtVerify(token, JWT_SECRET)
    // Cast to unknown first to avoid type error, then to JWTPayload
    return payload as unknown as JWTPayload
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

type UserRole = 'PATIENT' | 'DOCTOR' | 'PHARMACY' | 'ADMIN'

interface TokenPayload {
  userId: string
  role: UserRole
  iat?: number
  exp?: number
}

export function getTokenFromAuthHeader(authHeader: string | null): string | null {
  if (!authHeader) return null

  // Check for Bearer token
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return authHeader
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('JWT_SECRET or NEXTAUTH_SECRET is not defined')
      return null
    }

    const payload = jwt.verify(token, secret) as TokenPayload
    return payload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export function generateToken(userId: string, role: UserRole): string {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET or NEXTAUTH_SECRET is not defined')
  }

  return jwt.sign(
    { userId, role },
    secret,
    { expiresIn: '24h' }
  )
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
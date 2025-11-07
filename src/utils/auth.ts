import { User } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'your-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function generateToken(user: User): string {
  const secret = JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }

  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, secret, { expiresIn: '24h' })
}

export function verifyToken(token: string): JWTPayload {
  const secret = JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload
    return decoded
  } catch {
    throw new Error('Invalid or expired token')
  }
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

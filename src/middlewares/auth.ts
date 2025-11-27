import { JWTPayload, verifyToken } from '#src/utils/auth.js'
import { NextFunction, Request, Response } from 'express'

// Extend Express Request to include user
declare module 'express' {
  interface Request {
    user?: JWTPayload
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1] // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' })
    return
  }

  try {
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' })
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role,
      })
      return
    }

    next()
  }
}

// Convenience middleware for common roles
export const requireAdmin = requireRole(['ADMIN'])
export const requireEmployee = requireRole(['EMPLOYEE'])
export const requireAdminOrEmployee = requireRole(['ADMIN', 'EMPLOYEE'])

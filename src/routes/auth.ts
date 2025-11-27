import { authenticateToken } from '#src/middlewares/auth.js'
import { generateToken, verifyPassword } from '#src/utils/auth.js'
import { PrismaClient } from '@prisma/client'
import { Request, Response, Router } from 'express'

const router = Router()
const prisma = new PrismaClient()

interface LoginRequest {
  email: string
  password: string
}

router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = req.body as LoginRequest
    const { email, password } = body

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    // Generate JWT token
    const token = generateToken(user)

    // Return token and user info (without password)
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

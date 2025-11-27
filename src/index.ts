import { authenticateToken, requireAdmin } from '#src/middlewares/auth.js'
import { middleware } from '#src/middlewares/middleware.js'
import authRoutes from '#src/routes/auth.js'
import express from 'express'

const app = express()
const PORT = process.env.PORT ?? '3000'

app.use(express.json())
app.use(middleware)

// Auth routes
app.use('/api/auth', authRoutes)

// Protected routes for testing
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'This is a protected route - authentication successful!',
  })
})

app.get('/api/admin-only', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    message: 'This route requires admin role - access granted!',
  })
})

// Public route
app.get('/', (_, res) => {
  res.json('Hi!')
  console.log('Response sent')
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})

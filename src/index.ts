import { middleware } from '@/middlewares/middleware.js'
import express from 'express'

const app = express()
const PORT = '3000'

app.use(express.json())
app.get('/', middleware)

app.get('/', (_, res) => {
  res.json('Hi!')
  console.log('Response sent')
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})

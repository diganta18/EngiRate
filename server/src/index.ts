import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { rateLimit } from 'express-rate-limit'

import authRouter from './routes/auth'
import subjectsRouter from './routes/subjects'
import ratingsRouter from './routes/ratings'
import reviewsRouter from './routes/reviews'
import chartsRouter from './routes/charts'
import usersRouter from './routes/users'
import reportsRouter from './routes/reports'
import adminRouter from './routes/admin'
import eventsRouter from './routes/events'
import archetypesRouter from './routes/archetypes'
import creditsRouter from './routes/credits'
import compareRouter from './routes/compare'
import listsRouter from './routes/lists'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// Rate limiting
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 })
const rateLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 })
const reviewLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 })

app.use('/api/auth', authLimiter, authRouter)
app.use('/api/subjects', subjectsRouter)
app.use('/api/subjects', archetypesRouter)
app.use('/api/subjects', creditsRouter)
app.use('/api/credits', creditsRouter)
app.use('/api/compare', compareRouter)
app.use('/api/lists', listsRouter)
app.use('/api/ratings', rateLimiter, ratingsRouter)
app.use('/api/reviews', reviewLimiter, reviewsRouter)
app.use('/api/charts', chartsRouter)
app.use('/api/users', usersRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/admin', adminRouter)
app.use('/api/events', eventsRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'EngiRate API is live' })
})

app.listen(PORT, () => {
  console.log(`🎬 EngiRate server running on port ${PORT}`)
})

export default app

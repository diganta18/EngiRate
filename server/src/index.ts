import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'

import { ENV } from './lib/env'
import { prisma } from './lib/prisma'

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
import forecastRouter from './routes/forecast'
import resourcesRouter from './routes/resources'

const app = express()
const PORT = ENV.PORT

// Security headers with helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

// CORS configuration
app.use(cors({
  origin: ENV.CLIENT_URL,
  credentials: true,
}))

app.use(express.json())
app.use(cookieParser())

// Rate limiting middleware
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, message: { error: 'Too many authentication attempts' } })
const rateLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: 'Rating rate limit exceeded' } })
const reviewLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 15, message: { error: 'Review submission limit exceeded' } })
const forecastLimiter = rateLimit({ windowMs: 60 * 1000, max: 25, message: { error: 'Forecast simulation rate limit exceeded' } })

// Route mounting
app.use('/api/auth', authLimiter, authRouter)
app.use('/api/subjects', subjectsRouter)
app.use('/api/subjects', archetypesRouter)
app.use('/api/subjects', creditsRouter)
app.use('/api/credits', creditsRouter)
app.use('/api/compare', compareRouter)
app.use('/api/lists', listsRouter)
app.use('/api/forecast', forecastLimiter, forecastRouter)
app.use('/api/subjects', resourcesRouter)
app.use('/api/resources', resourcesRouter)
app.use('/api/ratings', rateLimiter, ratingsRouter)
app.use('/api/reviews', reviewLimiter, reviewsRouter)
app.use('/api/charts', chartsRouter)
app.use('/api/users', usersRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/admin', adminRouter)
app.use('/api/events', eventsRouter)

// Health check with active database connectivity verification
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', database: 'connected', message: 'EngiRate API is live & hardened' })
  } catch (err: any) {
    res.status(503).json({ status: 'degraded', database: 'disconnected', error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`🎬 EngiRate server running on port ${PORT} [Mode: ${ENV.NODE_ENV}]`)
})

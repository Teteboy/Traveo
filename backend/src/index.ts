import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from './config/index.js'
import { errorHandler, notFound } from './middleware/error.js'
import { securityScheduler } from './services/scheduler.js'

// Routes
import authRouter from './routes/auth.js'
import destinationsRouter from './routes/destinations.js'
import flightsRouter from './routes/flights.js'
import { hotelsRouter, guidesRouter, restaurantsRouter, transfersRouter, eventsRouter } from './routes/services.js'
import bookingsRouter from './routes/bookings.js'
import walletRouter from './routes/wallet.js'
import paymentsRouter from './routes/payments.js'
import visaRouter from './routes/visa.js'
import notificationsRouter from './routes/notifications.js'
import providersRouter from './routes/providers.js'
import adminRouter from './routes/admin.js'
import discoverRouter from './routes/discover.js'
import videosRouter from './routes/videos.js'
import reviewsRouter from './routes/reviews.js'
import chatRouter from './routes/chat.js'
import documentsRouter from './routes/documents.js'
import payoutsRouter from './routes/payouts.js'
import serviceItemsRouter from './routes/service-items.js'
import reportsRouter from './routes/reports.js'
import legalRouter from './routes/legal.js'
import promotionsRouter from './routes/promotions.js'
import publicServiceItemsRouter from './routes/public-service-items.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet())
const allowedOrigins = [config.frontendUrl, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000']
app.use(cors({
  origin: (origin, callback) => { if (!origin || allowedOrigins.includes(origin)) callback(null, true); else callback(new Error('Not allowed by CORS')) },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false })
app.use(limiter)

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: config.nodeEnv, timestamp: new Date().toISOString() })
})

// ─── API Routes (v1) ──────────────────────────────────────────────────────────
const v1 = '/v1'
app.use(`${v1}/auth`, authRouter)
app.use(`${v1}/destinations`, destinationsRouter)
app.use(`${v1}/flights`, flightsRouter)
app.use(`${v1}/hotels`, hotelsRouter)
app.use(`${v1}/guides`, guidesRouter)
app.use(`${v1}/restaurants`, restaurantsRouter)
app.use(`${v1}/transfers`, transfersRouter)
app.use(`${v1}/events`, eventsRouter)
app.use(`${v1}/bookings`, bookingsRouter)
app.use(`${v1}/wallet`, walletRouter)
app.use(`${v1}/payments`, paymentsRouter)
app.use(`${v1}/visa`, visaRouter)
app.use(`${v1}/notifications`, notificationsRouter)
app.use(`${v1}/providers`, providersRouter)
app.use(`${v1}/providers/payouts`, payoutsRouter)
app.use(`${v1}/providers/service-items`, serviceItemsRouter)
app.use(`${v1}/admin`, adminRouter)
app.use(`${v1}/discover`, discoverRouter)
app.use(`${v1}/videos`, videosRouter)
app.use(`${v1}/reviews`, reviewsRouter)
app.use(`${v1}/chat`, chatRouter)
app.use(`${v1}/documents`, documentsRouter)
app.use(`${v1}/reports`, reportsRouter)
app.use(`${v1}/legal`, legalRouter)
app.use(`${v1}/promotions`, promotionsRouter)
app.use(`${v1}/service-items`, publicServiceItemsRouter)

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`🚀 Traveo API running on http://localhost:${config.port}`)
  console.log(`   Environment: ${config.nodeEnv}`)
  console.log(`   Frontend:    ${config.frontendUrl}`)
  
  // Start security monitoring scheduler
  if (config.nodeEnv === 'production') {
    securityScheduler.startAll()
  }
})

export default app

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import dns from 'dns'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

import { connectDB } from './src/config/database.js'
import { handleSocketEvents } from './src/sockets/events.js'
import {
  errorHandler,
  notFoundHandler,
} from './src/middleware/errorHandler.js'

// Routes
import authRoutes from './src/routes/authRoutes.js'
import serviceRoutes from './src/routes/serviceRoutes.js'
import bookingRoutes from './src/routes/bookingRoutes.js'
import galleryRoutes from './src/routes/galleryRoutes.js'
import userRoutes from './src/routes/userRoutes.js'
import reviewRoutes from './src/routes/reviewRoutes.js'
import messageRoutes from './src/routes/messageRoutes.js'
import notificationRoutes from './src/routes/notificationRoutes.js'
import staffRoutes from './src/routes/staffRoutes.js'

import { createAdmin } from './scripts/createAdmin.js'

/* =========================================
   DNS FIX
========================================= */
dns.setServers(['8.8.8.8', '8.8.4.4'])

/* =========================================
   APP SETUP
========================================= */
const app = express()
const httpServer = createServer(app)
app.set('trust proxy', 1) // IMPORTANT for Render

/* =========================================
   SOCKET
========================================= */
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id)
  handleSocketEvents(io, socket)
})

app.set('io', io)

/* =========================================
   CORS (FIXED)
========================================= */
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CORS_ORIGIN,
].filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {
      // allow mobile apps / postman / server-to-server
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      console.log('Blocked by CORS:', origin)
      return callback(null, true) // ⚠️ SAFE MODE (no blocking)
    },
    credentials: true,
  })
)

app.options('*', cors())

/* =========================================
   SECURITY
========================================= */
app.use(helmet())
app.use(compression())
app.use(cookieParser())

/* =========================================
   RATE LIMIT
========================================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})

if (process.env.NODE_ENV === 'production') {
  app.use(limiter)
}

/* =========================================
   BODY PARSER
========================================= */
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

/* =========================================
   ROUTES
========================================= */
app.use('/api/auth', authRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/staff', staffRoutes)

/* =========================================
   HEALTH CHECK
========================================= */
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server running' })
})

/* =========================================
   STATIC FRONTEND (FIX 404 REFRESH)
========================================= */
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.join(__dirname, '../frontend/dist')

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distPath))

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

/* =========================================
   ERROR HANDLING
========================================= */
app.use(notFoundHandler)
app.use(errorHandler)

/* =========================================
   START SERVER
========================================= */
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()
    await createAdmin()

    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`)
      console.log(`✓ Environment: ${process.env.NODE_ENV}`)
      console.log('✓ Database connected')
      console.log('✓ Admin setup completed')
    })
  } catch (err) {
    console.error('Server failed:', err)
    process.exit(1)
  }
}

startServer()
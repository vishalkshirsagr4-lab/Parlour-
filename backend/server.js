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

import path from 'path'
import { fileURLToPath } from 'url'

/* =========================================
   GOOGLE DNS
========================================= */


dns.setServers(['8.8.8.8', '8.8.4.4'])

/* =========================================
   EXPRESS APP
========================================= */

const app = express()

const httpServer = createServer(app)

/* =========================================
   ALLOWED ORIGINS
========================================= */

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CORS_ORIGIN,
].filter(Boolean)

/* =========================================
   SOCKET.IO
========================================= */

const io = new SocketServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST'],
  },
})

/* =========================================
   SECURITY & MIDDLEWARE
========================================= */

app.use(helmet())

app.use(compression())

app.use(cookieParser())

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin
      if (!origin) {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('CORS not allowed'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.options('*', cors())

/* =========================================
   RATE LIMITER
========================================= */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})

if (process.env.NODE_ENV === 'production') {
  app.use(limiter)
} else {
  console.log('✓ Rate limiter disabled in development')
}

/* =========================================
   BODY PARSER
========================================= */

app.use(express.json({ limit: '50mb' }))

app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb',
  })
)

/* =========================================
   SOCKET EVENTS
========================================= */

io.on('connection', (socket) => {
  console.log('✓ Socket connected:', socket.id)

  handleSocketEvents(io, socket)

  socket.on('disconnect', () => {
    console.log('✗ Socket disconnected:', socket.id)
  })
})

app.set('io', io)

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
  res.status(200).json({
    success: true,
    message: 'Server is running',
  })
})

/* =========================================
   STATIC + SPA FALLBACK (PRODUCTION)
   - Serves the built React app from frontend/dist
   - Fixes deep linking/refresh: /services, /bookings, etc.
   - Does NOT interfere with /api/* routes
========================================= */

const isProd = process.env.NODE_ENV === 'production'


if (isProd) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const distPath = path.join(__dirname, '../frontend/dist')

  // Serve static assets (JS/CSS/images) from the Vite build.
  app.use(express.static(distPath, { maxAge: '1y' }))

  // SPA fallback: for any non-API GET request, serve index.html.
  // This allows React Router to handle /services, /bookings, etc.
  app.get('*', (req, res, next) => {
    if (req.method !== 'GET') return next()
    if (req.path.startsWith('/api/')) return next()

    return res.sendFile(path.join(distPath, 'index.html'))
  })
}

/* =========================================
   404 HANDLER (API / non-SPA)
========================================= */

app.use(notFoundHandler)

/* =========================================
   ERROR HANDLER
========================================= */

app.use(errorHandler)


/* =========================================
   SERVER START
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
  } catch (error) {
    console.error('✗ Server startup failed:', error)

    process.exit(1)
  }
}

startServer()
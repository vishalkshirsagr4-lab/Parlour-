import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

let transporter = null
let useConsoleFallback = false
const isProduction =
  process.env.NODE_ENV === 'production' ||
  Boolean(process.env.RENDER)

const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com'
  const port = Number(process.env.EMAIL_PORT || 587)
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD

  if (!user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  })
}

export const verifyEmailTransport = async () => {
  transporter = createTransporter()

  if (!transporter) {
    const msg = 'EMAIL_USER or EMAIL_PASSWORD not set. Email disabled.'
    console.error(msg)
    if (isProduction) {
      // In production / Render, fail fast so env can be configured correctly
      throw new Error(msg)
    }

    useConsoleFallback = true
    return
  }

  try {
    await transporter.verify()
    console.log('✓ Email transporter verified')
  } catch (err) {
    console.error('✗ Email transporter verification failed:', err.message || err)
    if (isProduction) {
      throw err
    }
    // dev fallback: use console logging
    useConsoleFallback = true
  }
}

const logEmailToFile = (to, subject, html) => {
  try {
    const logsDir = path.join(process.cwd(), 'backend', 'logs')
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true })
    const logFile = path.join(logsDir, 'emails.log')
    const entry = `\n---\nTO: ${to}\nSUBJECT: ${subject}\nDATE: ${new Date().toISOString()}\n${html}\n`
    fs.appendFileSync(logFile, entry)
  } catch (err) {
    console.error('Failed to write email log:', err)
  }
}

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@parlour.app',
    to: email,
    subject: 'Parlour - OTP Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>OTP Verification</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="color: #FF69B4; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  }

  if (useConsoleFallback || !transporter) {
    const message = `Email transport unavailable for OTP email to ${email}`
    console.error('OTP email fallback:', message)

    if (isProduction) {
      throw new Error(message)
    }

    logEmailToFile(email, mailOptions.subject, mailOptions.html)
    return
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('✓ OTP email sent to:', email)
  } catch (error) {
    console.error('✗ Error sending OTP email:', error)
    if (isProduction) throw error
    // dev fallback
    logEmailToFile(email, mailOptions.subject, mailOptions.html)
  }
}

export const sendBookingConfirmation = async (email, bookingDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@parlour.app',
    to: email,
    subject: 'Booking Confirmation - Parlour',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Confirmed!</h2>
        <p>Thank you for booking with us.</p>
        <p><strong>Service:</strong> ${bookingDetails.serviceName}</p>
        <p><strong>Date:</strong> ${bookingDetails.date}</p>
        <p><strong>Time:</strong> ${bookingDetails.time}</p>
        <p><strong>Status:</strong> ${bookingDetails.status}</p>
      </div>
    `,
  }

  if (useConsoleFallback || !transporter) {
    console.log('EMAIL FALLBACK — Booking to', email)
    logEmailToFile(email, mailOptions.subject, mailOptions.html)
    return
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('✓ Booking confirmation email sent')
  } catch (error) {
    console.error('✗ Error sending booking confirmation:', error)
    if (process.env.NODE_ENV === 'production') throw error
    logEmailToFile(email, mailOptions.subject, mailOptions.html)
  }
}

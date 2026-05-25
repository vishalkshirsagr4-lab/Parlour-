import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

let transporter = null
let useConsoleFallback = false
let fallbackReason = ''
const isProduction =
  process.env.NODE_ENV === 'production' ||
  Boolean(process.env.RENDER)

const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com'
  const port = Number(process.env.EMAIL_PORT || 587)
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD
  const connTimeout = Number(process.env.EMAIL_CONN_TIMEOUT_MS || 10000)
  const socketTimeout = Number(process.env.EMAIL_SOCKET_TIMEOUT_MS || 10000)

  if (!user || !pass) {
    fallbackReason = 'Missing EMAIL_USER or EMAIL_PASSWORD environment variables.'
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: connTimeout,
    socketTimeout,
  })
}

export const verifyEmailTransport = async () => {
  transporter = createTransporter()

  if (!transporter) {
    fallbackReason ||= 'EMAIL_USER or EMAIL_PASSWORD not set. Emails are disabled and will use fallback logging.'
    console.warn('✗ Email transport unavailable:', fallbackReason)
    useConsoleFallback = true
    return
  }

  try {
    await transporter.verify()
    console.log('✓ Email transporter verified')
  } catch (err) {
    fallbackReason = err.message || String(err)
    console.error('✗ Email transporter verification failed:', fallbackReason)
    console.warn('Continuing startup with email fallback. Set valid SMTP env vars to enable email delivery.')
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
    const message = `Email transport unavailable for OTP email to ${email}. Reason: ${fallbackReason}`
    console.warn('OTP email fallback:', message)
    // Try SendGrid HTTP API fallback if configured
    if (process.env.SENDGRID_API_KEY) {
      try {
        await trySendViaSendGrid(email, mailOptions.subject, mailOptions.html)
        console.log('✓ OTP email sent via SendGrid fallback to:', email)
        return
      } catch (sgErr) {
        console.error('✗ SendGrid fallback failed:', sgErr?.message || sgErr)
      }
    }

    logEmailToFile(email, mailOptions.subject, mailOptions.html)
    return
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('✓ OTP email sent to:', email)
  } catch (error) {
    console.error('✗ Error sending OTP email:', error?.message || error)
    // On send failure, attempt SendGrid HTTP fallback if available
    if (process.env.SENDGRID_API_KEY) {
      try {
        await trySendViaSendGrid(email, mailOptions.subject, mailOptions.html)
        console.log('✓ OTP email sent via SendGrid fallback to:', email)
        return
      } catch (sgErr) {
        console.error('✗ SendGrid fallback failed:', sgErr?.message || sgErr)
      }
    }

    // Log to file and continue; do not throw — callers expect sendOTP not to crash the request
    logEmailToFile(email, mailOptions.subject, mailOptions.html)
  }
}

const trySendViaSendGrid = async (to, subject, html) => {
  const apiKey = process.env.SENDGRID_API_KEY
  const from = process.env.SENDGRID_FROM || process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@parlour.app'
  if (!apiKey) throw new Error('SENDGRID_API_KEY not configured')

  const body = {
    personalizations: [{ to: [{ email: to }], subject }],
    from: { email: from },
    content: [{ type: 'text/html', value: html }],
  }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`SendGrid API error ${res.status}: ${text}`)
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
    console.warn('Booking confirmation email fallback for', email)
    logEmailToFile(email, mailOptions.subject, mailOptions.html)
    return
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('✓ Booking confirmation email sent')
  } catch (error) {
    console.error('✗ Error sending booking confirmation:', error)
    console.warn('Booking confirmation email fallback enabled. Errors will be logged instead of blocking requests.')
    logEmailToFile(email, mailOptions.subject, mailOptions.html)
  }
}

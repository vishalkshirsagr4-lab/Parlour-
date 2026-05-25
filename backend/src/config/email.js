import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

let transporter = null
let useConsoleFallback = false
let fallbackReason = ''

const createTransporter = () => {
  const host = process.env.EMAIL_HOST
  const port = Number(process.env.EMAIL_PORT)
  const secure = process.env.EMAIL_SECURE === 'true'

  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD

  if (!host || !port || !user || !pass) {
    fallbackReason =
      'Missing email environment variables.'
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,

    auth: {
      user,
      pass,
    },

    connectionTimeout: 20000,
    socketTimeout: 20000,
  })
}

export const verifyEmailTransport = async () => {
  transporter = createTransporter()

  if (!transporter) {
    console.warn('✗ Email transport unavailable:', fallbackReason)
    useConsoleFallback = true
    return
  }

  try {
    await transporter.verify()

    console.log('✓ Email transporter verified')
    console.log('✓ SMTP Host:', process.env.EMAIL_HOST)
  } catch (err) {
    fallbackReason = err?.message || String(err)

    console.error(
      '✗ Email transporter verification failed:',
      fallbackReason
    )

    console.warn(
      'Continuing startup with email fallback.'
    )

    useConsoleFallback = true
  }
}

const logEmailToFile = (to, subject, html) => {
  try {
    const logsDir = path.join(process.cwd(), 'logs')

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }

    const logFile = path.join(logsDir, 'emails.log')

    const entry = `
---
TO: ${to}
SUBJECT: ${subject}
DATE: ${new Date().toISOString()}

${html}
`

    fs.appendFileSync(logFile, entry)
  } catch (err) {
    console.error('✗ Failed to write email log:', err)
  }
}

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from:
      process.env.EMAIL_FROM ||
      process.env.EMAIL_USER ||
      'no-reply@parlour.app',

    to: email,

    subject: 'Parlour - OTP Verification',

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>OTP Verification</h2>

        <p>Your One-Time Password (OTP) is:</p>

        <h1 style="color: #FF69B4; letter-spacing: 5px;">
          ${otp}
        </h1>

        <p>This OTP is valid for 10 minutes.</p>

        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  }

  if (useConsoleFallback || !transporter) {
    console.warn(
      `OTP email fallback: Email transport unavailable for ${email}. Reason: ${fallbackReason}`
    )

    logEmailToFile(email, mailOptions.subject, mailOptions.html)

    return
  }

  try {
    await transporter.sendMail(mailOptions)

    console.log('✓ OTP email sent to:', email)
  } catch (error) {
    console.error(
      '✗ Error sending OTP email:',
      error?.message || error
    )

    logEmailToFile(email, mailOptions.subject, mailOptions.html)
  }
}

export const sendBookingConfirmation = async (
  email,
  bookingDetails
) => {
  const mailOptions = {
    from:
      process.env.EMAIL_FROM ||
      process.env.EMAIL_USER ||
      'no-reply@parlour.app',

    to: email,

    subject: 'Booking Confirmation - Parlour',

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Confirmed!</h2>

        <p>Thank you for booking with us.</p>

        <p>
          <strong>Service:</strong>
          ${bookingDetails.serviceName}
        </p>

        <p>
          <strong>Date:</strong>
          ${bookingDetails.date}
        </p>

        <p>
          <strong>Time:</strong>
          ${bookingDetails.time}
        </p>

        <p>
          <strong>Status:</strong>
          ${bookingDetails.status}
        </p>
      </div>
    `,
  }

  if (useConsoleFallback || !transporter) {
    console.warn(
      `Booking confirmation email fallback for ${email}`
    )

    logEmailToFile(email, mailOptions.subject, mailOptions.html)

    return
  }

  try {
    await transporter.sendMail(mailOptions)

    console.log('✓ Booking confirmation email sent')
  } catch (error) {
    console.error(
      '✗ Error sending booking confirmation:',
      error?.message || error
    )

    logEmailToFile(email, mailOptions.subject, mailOptions.html)
  }
      }

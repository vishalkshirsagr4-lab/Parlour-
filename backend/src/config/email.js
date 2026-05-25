import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

let transporter = null

const createTransporter = () => {
  const host = process.env.EMAIL_HOST
  const port = Number(process.env.EMAIL_PORT)
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD

  if (!host || !port || !user || !pass) {
    console.error(
      '✗ Missing email environment variables'
    )

    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false,

    auth: {
      user,
      pass,
    },

    tls: {
      rejectUnauthorized: false,
    },

    pool: true,
    maxConnections: 1,
    maxMessages: 50,

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  })
}

export const verifyEmailTransport = async () => {
  try {
    transporter = createTransporter()

    if (!transporter) {
      return
    }

    console.log('✓ Email transporter created')
    console.log(
      '✓ SMTP Host:',
      process.env.EMAIL_HOST
    )
  } catch (error) {
    console.error(
      '✗ Email transporter error:',
      error?.message || error
    )
  }
}

const logEmailToFile = (to, subject, html) => {
  try {
    const logsDir = path.join(process.cwd(), 'logs')

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, {
        recursive: true,
      })
    }

    const logFile = path.join(
      logsDir,
      'emails.log'
    )

    const entry = `
---
TO: ${to}
SUBJECT: ${subject}
DATE: ${new Date().toISOString()}

${html}
`

    fs.appendFileSync(logFile, entry)
  } catch (err) {
    console.error(
      '✗ Failed to write email log:',
      err
    )
  }
}

export const sendOTP = async (
  email,
  otp
) => {
  if (!transporter) {
    console.error(
      '✗ Transporter not initialized'
    )

    return
  }

  const mailOptions = {
    from:
      process.env.EMAIL_FROM ||
      process.env.EMAIL_USER,

    to: email,

    subject: 'Parlour - OTP Verification',

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>OTP Verification</h2>

        <p>Your OTP is:</p>

        <h1 style="color: #FF69B4; letter-spacing: 5px;">
          ${otp}
        </h1>

        <p>This OTP is valid for 10 minutes.</p>
      </div>
    `,
  }

  try {
    const info = await transporter.sendMail(
      mailOptions
    )

    console.log(
      '✓ OTP email sent:',
      info.messageId
    )
  } catch (error) {
    console.error(
      '✗ Error sending OTP:',
      error?.message || error
    )

    logEmailToFile(
      email,
      mailOptions.subject,
      mailOptions.html
    )
  }
}

export const sendBookingConfirmation =
  async (email, bookingDetails) => {
    if (!transporter) {
      console.error(
        '✗ Transporter not initialized'
      )

      return
    }

    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        process.env.EMAIL_USER,

      to: email,

      subject:
        'Booking Confirmation - Parlour',

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

    try {
      const info =
        await transporter.sendMail(
          mailOptions
        )

      console.log(
        '✓ Booking email sent:',
        info.messageId
      )
    } catch (error) {
      console.error(
        '✗ Error sending booking confirmation:',
        error?.message || error
      )

      logEmailToFile(
        email,
        mailOptions.subject,
        mailOptions.html
      )
    }
      }

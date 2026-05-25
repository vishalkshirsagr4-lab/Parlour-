import fs from 'fs'
import path from 'path'

// --------------------
// LOG EMAIL (fallback)
// --------------------
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

// --------------------
// SEND OTP (BREVO API)
// --------------------
export const sendOTP = async (email, otp) => {
  try {
    const response = await fetch(
      'https://api.brevo.com/v3/smtp/email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: {
            name: 'Parlour',
            email: process.env.EMAIL_FROM,
          },
          to: [{ email }],
          subject: 'Parlour - OTP Verification',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>OTP Verification</h2>
              <p>Your OTP is:</p>
              <h1 style="color: #FF69B4; letter-spacing: 5px;">${otp}</h1>
              <p>This OTP is valid for 10 minutes.</p>
            </div>
          `,
        }),
      }
    )

    const data = await response.json()

    console.log('✓ OTP sent:', data.messageId || data)
  } catch (error) {
    console.error('✗ OTP Error:', error.message)

    logEmailToFile(email, 'OTP Verification', `OTP: ${otp}`)
  }
}

// --------------------
// BOOKING EMAIL
// --------------------
export const sendBookingConfirmation = async (email, bookingDetails) => {
  try {
    const response = await fetch(
      'https://api.brevo.com/v3/smtp/email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: {
            name: 'Parlour',
            email: process.env.EMAIL_FROM,
          },
          to: [{ email }],
          subject: 'Booking Confirmation - Parlour',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Booking Confirmed!</h2>
              <p>Thank you for booking with us.</p>

              <p><strong>Service:</strong> ${bookingDetails.serviceName}</p>
              <p><strong>Date:</strong> ${bookingDetails.date}</p>
              <p><strong>Time:</strong> ${bookingDetails.time}</p>
              <p><strong>Status:</strong> ${bookingDetails.status}</p>
            </div>
          `,
        }),
      }
    )

    const data = await response.json()

    console.log('✓ Booking email sent:', data.messageId || data)
  } catch (error) {
    console.error('✗ Booking email error:', error.message)

    logEmailToFile(
      email,
      'Booking Confirmation',
      JSON.stringify(bookingDetails)
    )
  }
}

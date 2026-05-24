import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
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
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✓ OTP email sent to:', email);
  } catch (error) {
    console.error('✗ Error sending OTP email:', error);
    throw error;
  }
};

export const sendBookingConfirmation = async (email, bookingDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
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
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✓ Booking confirmation email sent');
  } catch (error) {
    console.error('✗ Error sending booking confirmation:', error);
    throw error;
  }
};

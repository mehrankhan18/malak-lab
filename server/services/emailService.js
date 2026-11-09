// Email & Notification Service
const nodemailer = require('nodemailer');

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_PORT must be a valid port number.');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: SMTP_SECURE ? SMTP_SECURE.toLowerCase() === 'true' : port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    return { success: false, error: 'Email recipient is not available.' };
  }

  try {
    const transporter = createTransporter();
    if (!transporter) {
      return { success: false, error: 'SMTP email delivery is not configured.' };
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error('[Email] Delivery failed:', error.message);
    return { success: false, error: 'SMTP email delivery failed.' };
  }
};

const sendOtpEmail = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: 'Your MALAK Lab sign-in code',
    text: `Your MALAK Lab verification code is ${otp}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
    html: `<p>Your MALAK Lab verification code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">${otp}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>`,
  });
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  return sendEmail({
    to: email,
    subject: 'Reset your MALAK Lab password',
    text: `Use this link to reset your MALAK Lab password: ${resetUrl}\n\nThis link expires in 30 minutes and can only be used once. If you did not request a reset, ignore this email.`,
    html: `<p>We received a request to reset your MALAK Lab password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 30 minutes and can only be used once. If you did not request a reset, ignore this email.</p>`,
  });
};

const sendBookingConfirmationEmail = async (booking, patient) => {
  if (!patient.email) {
    return { success: false, error: 'Patient email address is not available.' };
  }

  return await sendEmail({
    to: patient.email,
    subject: `Booking Confirmed #${booking.bookingId} - MALAK Lab Science Hub`,
    html: `<h3>Your Laboratory Appointment is Confirmed!</h3><p>Booking ID: <strong>${booking.bookingId}</strong></p><p>Appointment Date: ${new Date(booking.appointmentDate).toDateString()}</p>`,
  });
};

const sendReportReadyEmail = async (report, patient) => {
  if (!patient.email) {
    return { success: false, error: 'Patient email address is not available.' };
  }

  return await sendEmail({
    to: patient.email,
    subject: `Your Lab Report is Ready: ${report.testName} (ID: ${report.reportId})`,
    html: `<h3>Your Diagnostic Report Is Ready</h3><p>Dear ${patient.fullName}, your report for <strong>${report.testName}</strong> is ready. Please sign in to the customer portal or contact MALAK Lab Science Hub for assistance at 0328 5027351.</p>`,
  });
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendReportReadyEmail,
};

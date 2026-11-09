/**
 * SMS Notification Service
 *
 * Production integration: Set the following in .env to enable real SMS sending:
 *   SMS_PROVIDER=twilio           (or vonage, aws_sns)
 *   TWILIO_ACCOUNT_SID=...
 *   TWILIO_AUTH_TOKEN=...
 *   TWILIO_FROM_NUMBER=+<country-code><number>
 *
 * When these keys are absent the service operates in LOG_ONLY mode,
 * which is safe for development and will not throw errors.
 */

const { maskPhone } = require('../utils/formatters');

/** Core SMS dispatcher */
const sendSms = async ({ to, body }) => {
  // --- Production gateway integration (Twilio example) ---
  if (
    process.env.SMS_PROVIDER === 'twilio' &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  ) {
    try {
      // Dynamic require so Twilio is only needed when configured
      // npm install twilio  (add to package.json when activating)
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const message = await client.messages.create({
        body,
        from: process.env.TWILIO_FROM_NUMBER,
        to,
      });
      console.log(`[SMSService] Sent via Twilio to ${maskPhone(to)}.`);
      return { success: true, sid: message.sid };
    } catch (err) {
      console.error('[SMSService] Twilio error:', err.message);
      return { success: false, error: err.message };
    }
  }

  console.warn(`[SMSService] SMS not sent to ${maskPhone(to)}: no provider configured.`);
  return {
    success: false,
    note: 'SMS not sent — no provider configured. Set SMS_PROVIDER in .env to enable.',
  };
};

/** Send booking confirmation SMS */
const sendBookingConfirmationSms = async (booking, patientDetails) => {
  const phone = patientDetails?.phone;
  if (!phone) return;

  const msg =
    `MALAK Lab: Your booking is confirmed.\n` +
    `Ref: ${booking.bookingId}\n` +
    `Date: ${new Date(booking.appointmentDate).toDateString()}\n` +
    `Slot: ${booking.timeSlot}\n` +
    `Mode: ${booking.collectionType === 'home_collection' ? 'Home collection' : 'Branch visit'}\n` +
    `For help, call 0328 5027351.`;

  return await sendSms({ to: phone, body: msg });
};

/** Send report-ready SMS */
const sendReportReadySms = async (report, patientInfo) => {
  const phone = patientInfo?.phone;
  if (!phone) return;

  const msg =
    `MALAK Lab: Your report for "${report.testName}" ` +
    `(Report ID: ${report.reportId}) is ready. Call 0328 5027351 for help.`;

  return await sendSms({ to: phone, body: msg });
};

/** Send OTP via SMS (for passwordless login) */
const sendOtpSms = async (phone, otp) => {
  if (!phone) return;

  const msg =
    `MALAK Lab verification code: ${otp}\n` +
    `This code expires in 10 minutes. Do not share it with anyone.`;

  return await sendSms({ to: phone, body: msg });
};

/** Send appointment reminder SMS (24h before) */
const sendAppointmentReminderSms = async (booking, patientDetails) => {
  const phone = patientDetails?.phone;
  if (!phone) return;

  const msg =
    `MALAK Lab reminder: Your appointment is tomorrow.\n` +
    `Booking: ${booking.bookingId} at ${booking.timeSlot}.\n` +
    `${booking.collectionType === 'home_collection' ? 'Please confirm your home collection details with the lab.' : 'Please visit your selected branch.'}\n` +
    `Call 0328 5027351 for help.`;

  return await sendSms({ to: phone, body: msg });
};

module.exports = {
  sendSms,
  sendBookingConfirmationSms,
  sendReportReadySms,
  sendOtpSms,
  sendAppointmentReminderSms,
};

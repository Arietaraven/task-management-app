import nodemailer from 'nodemailer';

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 465,
    secure: true, // Required for port 465 with Resend
    auth: {
      user: 'resend',
      pass: process.env.SMTP_PASS,
    },
  });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: 'Task Manager <onboarding@resend.dev>',
    to,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });
};
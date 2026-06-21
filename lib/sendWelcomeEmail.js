import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail({
  toEmail,
  userID,
  defaultPassword,
  appUrl,
}) {
  const setupUrl = `${appUrl}/Main/Profile?setup=true`;

  await transporter.sendMail({
    from: `"NSTREN System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Your NSTREN Account Has Been Created",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: auto; padding: 24px;">
        <h2 style="color: #1d4ed8;">Welcome to NSTREN</h2>
        <p style="color: #6b7280;">Your account has been created by an administrator.</p>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 140px;">User ID</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${userID}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Default Password</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px; color: #dc2626;">${defaultPassword}</td>
            </tr>
          </table>
        </div>
        <p style="font-size: 14px; color: #374151;">On your first login, you will be asked to:</p>
        <ul style="font-size: 14px; color: #374151; padding-left: 20px; line-height: 1.8;">
          <li>Set a new password</li>
          <li>Upload your e-signature</li>
        </ul>
        <a href="${setupUrl}"
           style="display: inline-block; margin-top: 16px; padding: 10px 24px;
                  background: #1d4ed8; color: white; border-radius: 8px;
                  text-decoration: none; font-size: 14px; font-weight: 500;">
          Login & Activate Account
        </a>
        <p style="margin-top: 32px; font-size: 12px; color: #9ca3af;">
          If you did not expect this email, please contact your administrator immediately.
        </p>
      </div>
    `,
  });
}

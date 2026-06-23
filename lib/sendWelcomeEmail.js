"use server";
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
  appUrl = process.env.NEXT_PUBLIC_APP_URL,
}) {
  const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/Main/Profile?setup=true`;

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
// PR
export async function sendPurchaseForwardedEmail({
  toEmail,
  requestNo,
  forwardedBy,
  forwardedByRole,
  forwardedTo,
  appUrl = process.env.NEXT_PUBLIC_APP_URL,
}) {
  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/Main`;

  await transporter.sendMail({
    from: `"NSTREN System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Purchase Requisition Forwarded ${requestNo ? " - " + requestNo : ""}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;">
        <h2 style="color:#2563eb;">Purchase Requisition Forwarded</h2>

        <p>Purchase Requisition has been forwarded for further processing.</p>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px;border-radius:8px;">
          <p><strong>Request No:</strong> ${requestNo}</p>
          <p><strong>Forwarded By:</strong> ${forwardedBy} (${forwardedByRole})</p>
          <p><strong>Forwarded To:</strong> ${forwardedTo}</p>
        </div>

        <a href="${viewUrl}"
          style="display:inline-block;margin-top:20px;padding:10px 24px;
                 background:#2563eb;color:white;text-decoration:none;
                 border-radius:8px;">
          View Request
        </a>
      </div>
    `,
  });
}
export async function sendPurchaseApprovedEmail({
  toEmail,
  requestNo,
  approvedBy,
  approvedByRole,
  appUrl = process.env.NEXT_PUBLIC_APP_URL,
}) {
  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URLrl}/Main`;

  await transporter.sendMail({
    from: `"NSTREN System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Purchase Requisition Approved - ${requestNo}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;">
        <h2 style="color:#16a34a;">Purchase Requisition Approved</h2>

        <p>Purchase Requisition has been approved.</p>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px;border-radius:8px;">
          <p><strong>Request No:</strong> ${requestNo}</p>
          <p><strong>Approved By:</strong> ${approvedBy} (${approvedByRole})</p>
        </div>

        <a href="${viewUrl}"
          style="display:inline-block;margin-top:20px;padding:10px 24px;
                 background:#16a34a;color:white;text-decoration:none;
                 border-radius:8px;">
          View Request
        </a>
      </div>
    `,
  });
}

export async function sendPurchaseRejectedEmail({
  toEmail,
  requestNo,
  rejectedBy,
  rejectedByRole,
  reason,
  appUrl = process.env.NEXT_PUBLIC_APP_URL,
}) {
  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/Main`;

  await transporter.sendMail({
    from: `"NSTREN System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Purchase Requisition Request to Revise- ${requestNo}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;">
        <h2 style="color:#dc2626;">Purchase Requisition Rejected</h2>

        <p>Your Purchase Requisition has been rejected.</p>

        <div style="background:#fef2f2;border:1px solid #fecaca;padding:16px;border-radius:8px;">
          <p><strong>Request No:</strong> ${requestNo}</p>
          <p><strong>Rejected By:</strong> ${rejectedBy} (${rejectedByRole})</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>

        <a href="${viewUrl}"
          style="display:inline-block;margin-top:20px;padding:10px 24px;
                 background:#dc2626;color:white;text-decoration:none;
                 border-radius:8px;">
          View Request
        </a>
      </div>
    `,
  });
}

//Vouchers
export async function sendVoucherApprovedEmail({
  toEmail,
  voucherNo,
  approvedBy,
  approvedByRole,
  appUrl = process.env.NEXT_PUBLIC_APP_URL,
}) {
  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URLl}/Main`;

  await transporter.sendMail({
    from: `"NSTREN System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Approved Voucher List - ${voucherNo}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;">
        <h2 style="color:#16a34a;">Voucher Approved</h2>

        <p>Voucher has been approved.</p>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px;border-radius:8px;">
          <p><strong>Voucher No:</strong> ${voucherNo}</p>
          <p><strong>Approved By:</strong> ${approvedBy} (${approvedByRole})</p>
        </div>

        <a href="${viewUrl}"
          style="display:inline-block;margin-top:20px;padding:10px 24px;
                 background:#16a34a;color:white;text-decoration:none;
                 border-radius:8px;">
          View Voucher
        </a>
      </div>
    `,
  });
}
export async function sendVoucherForwardedEmail({
  toEmail,
  voucherNo,
  forwardedBy,
  forwardedByRole,
  forwardedTo,
  appUrl = process.env.NEXT_PUBLIC_APP_URL,
}) {
  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/Main`;

  await transporter.sendMail({
    from: `"NSTREN System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Forwarded Voucher List - ${voucherNo}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;">
        <h2 style="color:#2563eb;">Voucher Forwarded</h2>

        <p>Voucher has been forwarded for further processing.</p>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px;border-radius:8px;">
          <p><strong>Voucher List No:</strong> ${voucherNo}</p>
          <p><strong>Forwarded By:</strong> ${forwardedBy} (${forwardedByRole})</p>
          <p><strong>Forwarded To:</strong> ${forwardedTo}</p>
        </div>

        <a href="${viewUrl}"
          style="display:inline-block;margin-top:20px;padding:10px 24px;
                 background:#2563eb;color:white;text-decoration:none;
                 border-radius:8px;">
          View Voucher
        </a>
      </div>
    `,
  });
}
export async function sendVoucherRejectedEmail({
  toEmail,
  voucherNo,
  rejectedBy,
  rejectedByRole,
  reason,
  appUrl = process.env.NEXT_PUBLIC_APP_URL,
}) {
  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/Main`;

  await transporter.sendMail({
    from: `"NSTREN System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Voucher Rejected - ${voucherNo}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;">
        <h2 style="color:#dc2626;">Voucher Rejected</h2>

        <p>Your Voucher has been rejected.</p>

        <div style="background:#fef2f2;border:1px solid #fecaca;padding:16px;border-radius:8px;">
          <p><strong>Voucher No:</strong> ${voucherNo}</p>
          <p><strong>Rejected By:</strong> ${rejectedBy} (${rejectedByRole})</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>

        <a href="${viewUrl}"
          style="display:inline-block;margin-top:20px;padding:10px 24px;
                 background:#dc2626;color:white;text-decoration:none;
                 border-radius:8px;">
          View Voucher
        </a>
      </div>
    `,
  });
}

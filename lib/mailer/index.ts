import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"DBULK - Digiworld Infotech" <${process.env.EMAIL_USERNAME}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

export function getOTPEmailTemplate(otp: string, type: 'verification' | 'password_reset'): string {
  const title = type === 'verification' ? 'Verify Your Email' : 'Reset Your Password';
  const message = type === 'verification' 
    ? 'Thank you for signing up with DBULK. Please use the following OTP to verify your email address.'
    : 'We received a request to reset your password. Please use the following OTP to proceed.';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Google Sans', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 28px; font-weight: bold;">D</span>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #111111;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 20px 40px; text-align: center;">
              <p style="margin: 0; font-size: 16px; color: #666666; line-height: 1.6;">
                ${message}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; display: inline-block;">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #25D366;">${otp}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px 40px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #999999;">
                This OTP will expire in <strong>5 minutes</strong>.<br>
                If you didn't request this, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                © 2025 DBULK by Digiworld Infotech. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getSecurityAlertEmailTemplate(action: string, ipAddress: string, userAgent: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Google Sans', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 28px; font-weight: bold;">D</span>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #111111;">Security Alert</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 20px 40px; text-align: center;">
              <p style="margin: 0; font-size: 16px; color: #666666; line-height: 1.6;">
                We detected a new ${action} to your DBULK account.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">
                  <strong>IP Address:</strong> ${ipAddress}
                </p>
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">
                  <strong>Device:</strong> ${userAgent}
                </p>
                <p style="margin: 0; font-size: 14px; color: #666666;">
                  <strong>Time:</strong> ${new Date().toLocaleString()}
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px 40px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #999999;">
                If this wasn't you, please secure your account immediately by changing your password.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                © 2025 DBULK by Digiworld Infotech. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendOTPEmail(email: string, otp: string, type: 'verification' | 'password_reset'): Promise<boolean> {
  const subject = type === 'verification' ? 'Verify Your Email - DBULK' : 'Reset Your Password - DBULK';
  return sendEmail({
    to: email,
    subject,
    html: getOTPEmailTemplate(otp, type),
  });
}

export async function sendSecurityAlertEmail(email: string, action: string, ipAddress: string, userAgent: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Security Alert: New ${action} - DBULK`,
    html: getSecurityAlertEmailTemplate(action, ipAddress, userAgent),
  });
}

const LOGO_URL = "https://onetimeonetime.com/logo.png";
const SITE_URL = "https://onetimeonetime.com";

export function getEmailFooter(): string {
  return `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; color: #666; font-size: 14px;">
      <p style="margin-bottom: 10px;">
        <a href="${SITE_URL}" style="display: inline-block;">
          <img src="${LOGO_URL}" alt="OneTimeOneTime" style="max-width: 150px; height: auto;" />
        </a>
      </p>
      <p style="margin: 5px 0;">(443) 453-8614</p>
      <p style="margin: 5px 0;">
        <a href="mailto:info@onetimeonetime.com" style="color: #666;">info@onetimeonetime.com</a>
      </p>
    </div>
  `;
}

export function wrapEmailTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${SITE_URL}" style="display: inline-block;">
            <img src="${LOGO_URL}" alt="OneTimeOneTime" style="max-width: 180px; height: auto;" />
          </a>
        </div>
        <div style="background: #fff; padding: 20px;">
          ${content}
        </div>
        ${getEmailFooter()}
      </body>
    </html>
  `;
}

export function getPasswordResetEmail(resetLink: string): string {
  return wrapEmailTemplate(`
    <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
    <p>You requested to reset your password. Click the button below to set a new password:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        Reset Password
      </a>
    </p>
    <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
    <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
  `);
}

export function getBulkEmail(subject: string, messageBody: string): string {
  return wrapEmailTemplate(`
    <div style="white-space: pre-wrap;">${messageBody}</div>
  `);
}

export const FROM_EMAIL = "noreply@onetimeonetime.com";

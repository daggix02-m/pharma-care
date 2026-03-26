import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { action } from '../_generated/server';

// Email templates
const createAdminNotificationEmail = (data: {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  dashboardUrl: string;
}) => ({
  subject: 'New Contact Message - PharmaCare Platform',
  html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .message-box { background: #f3f4f6; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PharmaCare Platform</h1>
    </div>
    <div class="content">
      <h2>New Contact Message Received</h2>
      <p>Hello Admin,</p>
      <p>You've received a new message from the contact form.</p>
      
      <div style="margin: 20px 0;">
        <strong>From:</strong> ${data.firstName} ${data.lastName} (${data.email})<br>
        <strong>Time:</strong> ${new Date().toLocaleString()}
      </div>
      
      <div class="message-box">
        <strong>Message:</strong><br>
        ${data.message.substring(0, 200)}${data.message.length > 200 ? '...' : ''}
      </div>
      
      <a href="${data.dashboardUrl}" class="button">View Full Message</a>
      
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
        This is an automated notification from your PharmaCare platform.
      </p>
    </div>
    <div class="footer">
      <p>© 2024 PharmaCare Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `,
});

const createUserReplyEmail = (data: {
  firstName: string;
  adminReply: string;
  originalMessage: string;
}) => ({
  subject: 'Re: Your Message to PharmaCare',
  html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 3px solid #2563eb; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .original-message { background: #f3f4f6; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; font-size: 14px; }
    .reply-box { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #dbeafe; }
    .reply-box h3 { color: #1e40af; margin-top: 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
    .footer a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">PharmaCare</div>
    </div>
    <div class="content">
      <h2>Hello ${data.firstName},</h2>
      <p>Thank you for reaching out to us. We've reviewed your message and here is our response:</p>
      
      <div class="reply-box">
        <h3>Our Response:</h3>
        <p style="white-space: pre-wrap;">${data.adminReply}</p>
      </div>
      
      <div class="original-message">
        <strong>Your Original Message:</strong><br>
        <p style="white-space: pre-wrap; margin: 10px 0 0 0;">${data.originalMessage}</p>
      </div>
      
      <p>If you have any further questions, please don't hesitate to contact us again through our website.</p>
      
      <p>Best regards,<br>
      <strong>The PharmaCare Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated response. Please do not reply directly to this email.</p>
      <p>© 2024 PharmaCare Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `,
});

// Send email using Resend API
export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    apiKey: v.string(),
    testMode: v.boolean(),
  },
  handler: async (ctx, args) => {
    // In test mode, just log the email
    if (args.testMode) {
      console.log('[TEST MODE] Would send email:');
      console.log('  To:', args.to);
      console.log('  Subject:', args.subject);
      console.log('  Length:', args.html.length, 'characters');
      return { success: true, testMode: true };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${args.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'PharmaCare <noreply@pharmacare.io>',
          to: args.to,
          subject: args.subject,
          html: args.html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Resend API error: ${error}`);
      }

      const data = await response.json();
      return { success: true, id: data.id };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  },
});

// Send admin notification about new contact message
export const sendAdminNotification = async (
  ctx: any,
  args: {
    adminEmail: string;
    firstName: string;
    lastName: string;
    email: string;
    message: string;
    apiKey: string;
    testMode: boolean;
    dashboardUrl: string;
  }
) => {
  const emailContent = createAdminNotificationEmail({
    firstName: args.firstName,
    lastName: args.lastName,
    email: args.email,
    message: args.message,
    dashboardUrl: args.dashboardUrl,
  });

  return await ctx.runAction(internal.lib.email.sendEmail, {
    to: args.adminEmail,
    subject: emailContent.subject,
    html: emailContent.html,
    apiKey: args.apiKey,
    testMode: args.testMode,
  });
};

// Send reply to user
export const sendUserReply = async (
  ctx: any,
  args: {
    userEmail: string;
    firstName: string;
    adminReply: string;
    originalMessage: string;
    apiKey: string;
    testMode: boolean;
  }
) => {
  const emailContent = createUserReplyEmail({
    firstName: args.firstName,
    adminReply: args.adminReply,
    originalMessage: args.originalMessage,
  });

  return await ctx.runAction(internal.lib.email.sendEmail, {
    to: args.userEmail,
    subject: emailContent.subject,
    html: emailContent.html,
    apiKey: args.apiKey,
    testMode: args.testMode,
  });
};

// Test email function
export const sendTestEmail = action({
  args: {
    to: v.string(),
    apiKey: v.string(),
    testMode: v.boolean(),
  },
  handler: async (ctx, args) => {
    const testHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PharmaCare Platform</h1>
    </div>
    <div class="content">
      <h2>Test Email</h2>
      <p>This is a test email from your PharmaCare platform.</p>
      <p>If you're receiving this, your email configuration is working correctly!</p>
      <p><strong>Test Mode:</strong> ${args.testMode ? 'ON' : 'OFF'}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <div class="footer">
      <p>© 2024 PharmaCare Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    return await ctx.runAction(internal.lib.email.sendEmail, {
      to: args.to,
      subject: 'Test Email - PharmaCare Platform',
      html: testHtml,
      apiKey: args.apiKey,
      testMode: args.testMode,
    });
  },
});

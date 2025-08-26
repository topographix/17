import nodemailer from 'nodemailer';

// Create a test account for email transport (ethereal.email)
let transporter: nodemailer.Transporter;

async function createTransporter() {
  // Create test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  const testAccount = await nodemailer.createTestAccount();

  // Create reusable transporter object using the default SMTP transport
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  console.log('Test email account created:', testAccount.user);
  console.log('Preview URL will be available in console logs when emails are sent');
}

// Initialize the transporter
createTransporter().catch(console.error);

/**
 * Send a verification email to the user
 */
export async function sendVerificationEmail(email: string, verificationToken: string, username: string) {
  if (!transporter) {
    await createTransporter();
  }

  const appUrl = process.env.APP_URL || 'https://redvelvet.replit.app';
  const verificationLink = `${appUrl}/api/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: '"RedVelvet Team" <noreply@redvelvet.ai>',
    to: email,
    subject: 'RedVelvet - Verify Your Email',
    text: `Hello ${username},\n\nWelcome to RedVelvet! Please verify your email by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nBest regards,\nThe RedVelvet Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e91e63; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #e91e63;">RedVelvet</h1>
        </div>
        <p>Hello <strong>${username}</strong>,</p>
        <p>Welcome to RedVelvet! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p>Or copy and paste the following link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Best regards,<br>The RedVelvet Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    
    // Preview only available when sending through Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
    return {
      success: true,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Send a password reset email to the user
 */
export async function sendPasswordResetEmail(email: string, resetToken: string, username: string) {
  if (!transporter) {
    await createTransporter();
  }

  const appUrl = process.env.APP_URL || 'https://redvelvet.replit.app';
  const resetLink = `${appUrl}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: '"RedVelvet Team" <noreply@redvelvet.ai>',
    to: email,
    subject: 'RedVelvet - Reset Your Password',
    text: `Hello ${username},\n\nWe received a request to reset your password. Please click the link below to reset it:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.\n\nBest regards,\nThe RedVelvet Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e91e63; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #e91e63;">RedVelvet</h1>
        </div>
        <p>Hello <strong>${username}</strong>,</p>
        <p>We received a request to reset your password. Please click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>Or copy and paste the following link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>Best regards,<br>The RedVelvet Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    
    // Preview only available when sending through Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
    return {
      success: true,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error
    };
  }
}
// lib/email.ts
import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

interface WelcomeEmailData {
  to: string;
  userName: string;
  userEmail: string;
  password: string;
  role: string;
  hospitalName: string;
  hospitalContact: string;
  employeeId: string;
}

interface PasswordResetEmailData {
  to: string;
  userName: string;
  newPassword: string;
  hospitalName: string;
}

// Welcome email template
const getWelcomeEmailTemplate = (data: WelcomeEmailData) => {
  const roleDisplayNames = {
    ADMIN: 'Administrator',
    DOCTOR: 'Doctor',
    NURSE: 'Nurse',
    RECEPTIONIST: 'Receptionist'
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${data.hospitalName}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 10px 10px 0 0;
                margin: -30px -30px 20px -30px;
            }
            .credentials {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
            }
            .credential-item {
                margin: 10px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .credential-label {
                font-weight: bold;
                color: #495057;
            }
            .credential-value {
                font-family: 'Courier New', monospace;
                background-color: #e9ecef;
                padding: 5px 10px;
                border-radius: 3px;
                color: #212529;
            }
            .login-button {
                display: inline-block;
                background-color: #28a745;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                text-align: center;
            }
            .login-button:hover {
                background-color: #218838;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                font-size: 14px;
                color: #6c757d;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to ${data.hospitalName}!</h1>
                <p>Your account has been created successfully</p>
            </div>
            
            <h2>Hello ${data.userName},</h2>
            
            <p>Welcome to the ${data.hospitalName} team! Your account has been created and you can now access our Hospital Management System.</p>
            
            <div class="credentials">
                <h3>Your Login Credentials</h3>
                <div class="credential-item">
                    <span class="credential-label">Email:</span>
                    <span class="credential-value">${data.userEmail}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Password:</span>
                    <span class="credential-value">${data.password}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Role:</span>
                    <span class="credential-value">${roleDisplayNames[data.role as keyof typeof roleDisplayNames] || data.role}</span>
                </div>
                ${data.employeeId ? `
                <div class="credential-item">
                    <span class="credential-label">Employee ID:</span>
                    <span class="credential-value">${data.employeeId}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="warning">
                <strong>🔒 Security Notice:</strong>
                <p>For security reasons, please change your password after your first login. Keep your credentials secure and do not share them with anyone.</p>
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://your-hospital-system.com'}/login" class="login-button">
                    Login to Your Account
                </a>
            </div>
            
            <h3>Getting Started</h3>
            <ul>
                <li>Login using the credentials provided above</li>
                <li>Complete your profile information</li>
                <li>Change your password for security</li>
                <li>Familiarize yourself with the system features</li>
            </ul>
            
            <h3>Need Help?</h3>
            <p>If you have any questions or need assistance getting started, please contact:</p>
            <ul>
                <li><strong>Hospital IT Support:</strong> ${data.hospitalContact || 'Contact your administrator'}</li>
                <li><strong>System Administrator:</strong> admin@${data.hospitalName.toLowerCase().replace(/\s+/g, '')}.com</li>
            </ul>
            
            <div class="footer">
                <p>This email was sent from ${data.hospitalName} Hospital Management System.</p>
                <p>Please do not reply to this automated email.</p>
                <p><small>© ${new Date().getFullYear()} ${data.hospitalName}. All rights reserved.</small></p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Password reset email template
const getPasswordResetEmailTemplate = (data: PasswordResetEmailData) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - ${data.hospitalName}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
                color: white;
                padding: 20px;
                border-radius: 10px 10px 0 0;
                margin: -30px -30px 20px -30px;
            }
            .password-box {
                background-color: #f8f9fa;
                border: 2px solid #28a745;
                border-radius: 5px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
            }
            .new-password {
                font-family: 'Courier New', monospace;
                font-size: 24px;
                font-weight: bold;
                color: #28a745;
                background-color: white;
                padding: 10px;
                border-radius: 5px;
                border: 1px solid #dee2e6;
                display: inline-block;
                margin: 10px 0;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                font-size: 14px;
                color: #6c757d;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔑 Password Reset</h1>
                <p>Your password has been reset</p>
            </div>
            
            <h2>Hello ${data.userName},</h2>
            
            <p>Your password for the ${data.hospitalName} Hospital Management System has been reset by your administrator.</p>
            
            <div class="password-box">
                <h3>Your New Password</h3>
                <div class="new-password">${data.newPassword}</div>
                <p><small>Click to select and copy</small></p>
            </div>
            
            <div class="warning">
                <strong>🔒 Important Security Notice:</strong>
                <p>Please change this password immediately after logging in. This temporary password should not be shared with anyone.</p>
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
                <li>Login using your email and the new password above</li>
                <li>Navigate to your profile settings</li>
                <li>Change your password to something secure and memorable</li>
                <li>Enable two-factor authentication if available</li>
            </ol>
            
            <div class="footer">
                <p>This password reset was performed by your system administrator.</p>
                <p>If you did not request this reset, please contact your IT support immediately.</p>
                <p><small>© ${new Date().getFullYear()} ${data.hospitalName}. All rights reserved.</small></p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send welcome email function
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"${data.hospitalName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: data.to,
    subject: `Welcome to ${data.hospitalName} - Your Account is Ready!`,
    html: getWelcomeEmailTemplate(data),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

// Send password reset email function
export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"${data.hospitalName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: data.to,
    subject: `Password Reset - ${data.hospitalName}`,
    html: getPasswordResetEmailTemplate(data),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}





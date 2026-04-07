const getPasswordResetEmail = (name, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Reset Your Password - E-Shop</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                .warning { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; color: #92400e; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Reset Your Password</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name},</h2>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    
                    <a href="${resetUrl}" class="button">Reset Password</a>
                    
                    <div class="warning">
                        <strong>⚠️ This link will expire in 1 hour</strong>
                    </div>
                    
                    <p>If you didn't request this, please ignore this email or contact support.</p>
                    
                    <hr>
                    <p style="font-size: 12px; color: #999;">Or copy this link: ${resetUrl}</p>
                </div>
                <div class="footer">
                    <p>E-Shop | Your One-Stop Online Store</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = getPasswordResetEmail;
const dotenv = require('dotenv');
dotenv.config();

const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'MISSING');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    
    try {
        await transporter.verify();
        console.log('✅ Email credentials are VALID!');
        
        // Send a test email
        const info = await transporter.sendMail({
            from: `"Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: 'Test Email from E-Shop',
            text: 'If you receive this, your email configuration is working!',
        });
        console.log('✅ Test email sent:', info.messageId);
    } catch (error) {
        console.error('❌ Email error:', error.message);
    }
}

testEmail();
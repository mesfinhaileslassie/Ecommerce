const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

let transporter = null;
let emailEnabled = false;

// Check credentials after dotenv loads
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailHost = process.env.EMAIL_HOST;
const disableEmails = process.env.DISABLE_EMAILS === 'true';

console.log('📧 Email Configuration Status:');
console.log(`   EMAIL_USER: ${emailUser ? '✅ Configured' : '❌ Missing'}`);
console.log(`   EMAIL_PASS: ${emailPass ? '✅ Configured' : '❌ Missing'}`);
console.log(`   EMAIL_HOST: ${emailHost ? '✅ Configured' : '❌ Missing'}`);
console.log(`   DISABLE_EMAILS: ${disableEmails ? '🚫 Yes (simulation mode)' : '✅ No (real emails)'}`);

// Only enable if all credentials exist and emails are not disabled
if (emailUser && emailPass && emailHost && !disableEmails) {
    try {
        transporter = nodemailer.createTransport({
            host: emailHost,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: emailUser,
                pass: emailPass,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        // Verify connection asynchronously
        transporter.verify((error, success) => {
            if (error) {
                console.error('❌ Email verification failed:', error.message);
                console.log('📧 Falling back to simulation mode.');
                emailEnabled = false;
            } else {
                console.log('✅ Email server ready! Real emails will be sent.');
                emailEnabled = true;
            }
        });
    } catch (error) {
        console.error('❌ Email setup error:', error.message);
        emailEnabled = false;
    }
} else {
    const missing = [];
    if (!emailUser) missing.push('EMAIL_USER');
    if (!emailPass) missing.push('EMAIL_PASS');
    if (!emailHost) missing.push('EMAIL_HOST');
    
    if (missing.length > 0) {
        console.log(`📧 Missing credentials: ${missing.join(', ')}`);
    }
    if (disableEmails) {
        console.log('📧 Emails are disabled via DISABLE_EMAILS=true');
    }
    console.log('📧 Running in simulation mode (emails will be logged, not sent).');
    emailEnabled = false;
}

// Send email function
const sendEmail = async (to, subject, html, text = null) => {
    if (!emailEnabled || !transporter) {
        console.log(`📧 [SIMULATION] Would send email to: ${to}`);
        console.log(`   Subject: ${subject}`);
        return { success: true, messageId: 'simulated', simulated: true };
    }
    
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || `"E-Shop" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text || html.replace(/<[^>]*>/g, ''),
            html: html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 ✅ Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending error:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };
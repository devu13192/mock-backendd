// Test script to verify email configuration
require('dotenv/config');
const nodemailer = require('nodemailer');

console.log('Testing email configuration...');
console.log('SMTP_USER:', process.env.SMTP_USER ? 'Set' : 'NOT SET');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'Set' : 'NOT SET');

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Email configuration is missing!');
    console.log('Please create a .env file in the backend directory with:');
    console.log('SMTP_USER=your-gmail@gmail.com');
    console.log('SMTP_PASS=your-app-password');
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Test email sending
async function testEmail() {
    try {
        console.log('Sending test email...');
        const result = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER, // Send to self for testing
            subject: 'EIRA Email Test',
            text: 'This is a test email to verify email configuration is working correctly.'
        });
        
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', result.messageId);
    } catch (error) {
        console.error('❌ Failed to send test email:', error.message);
        
        if (error.code === 'EAUTH') {
            console.log('\n🔧 Authentication failed. Common solutions:');
            console.log('1. Make sure you\'re using an App Password, not your regular Gmail password');
            console.log('2. Enable 2-Factor Authentication on your Gmail account');
            console.log('3. Generate a new App Password: Google Account → Security → App passwords');
        }
    }
}

testEmail();

const nodemailer = require('nodemailer');
require('dotenv').config();

// Check if email configuration is available
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Email configuration missing. Please set SMTP_USER and SMTP_PASS in your .env file');
    process.exit(1);
}

const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function testEmailTemplates() {
    const testEmail = process.env.SMTP_USER; // Send to yourself for testing
    
    console.log('🧪 Testing Email Templates...\n');
    
    // Test 1: Welcome Email
    console.log('1️⃣ Testing Welcome Email...');
    try {
        await transporter.sendMail({
            from: `"EIRA Platform" <${process.env.SMTP_USER}>`,
            to: testEmail,
            subject: 'Welcome to EIRA Interview Platform - TEST',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to EIRA</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #2196f3, #1976d2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 20px 0; border-radius: 5px; }
                    .features { background: #f3e5f5; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎉 Welcome to EIRA!</h1>
                    <p>Interview Preparation Platform</p>
                </div>
                
                <div class="content">
                    <h2>Hello Test User,</h2>
                    
                    <div class="info-box">
                        <h3>✅ Account Created Successfully!</h3>
                        <p><strong>Your EIRA account has been created and you are now logged in.</strong></p>
                    </div>
                    
                    <h3>🚀 Get Started with EIRA:</h3>
                    <ul>
                        <li>Take mock interviews with AI feedback</li>
                        <li>Track your progress and improvement</li>
                        <li>Access interview preparation materials</li>
                        <li>Get personalized recommendations</li>
                    </ul>
                    
                    <div class="features">
                        <h3>💡 Pro Tips for Success:</h3>
                        <ul>
                            <li>Start with basic interviews to build confidence</li>
                            <li>Review feedback carefully to improve</li>
                            <li>Practice regularly for best results</li>
                            <li>Track your progress over time</li>
                        </ul>
                    </div>
                    
                    <p><strong>Ready to excel in your interviews?</strong> Start practicing now and take your interview skills to the next level!</p>
                    
                    <div class="footer">
                        <p>Happy Learning!<br>The EIRA Team</p>
                        <p>This is a TEST email. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            `
        });
        console.log('✅ Welcome email sent successfully!\n');
    } catch (error) {
        console.log('❌ Welcome email failed:', error.message, '\n');
    }
    
    // Test 2: Deactivation Email
    console.log('2️⃣ Testing Deactivation Email...');
    try {
        await transporter.sendMail({
            from: `"EIRA Platform" <${process.env.SMTP_USER}>`,
            to: testEmail,
            subject: 'Account Deactivated - EIRA Interview Platform - TEST',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Account Deactivated</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .alert-box { background: #ffebee; border-left: 4px solid #f44336; padding: 20px; margin: 20px 0; border-radius: 5px; }
                    .contact-info { background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🚫 Account Deactivated</h1>
                    <p>EIRA Interview Platform</p>
                </div>
                
                <div class="content">
                    <h2>Hello Test User,</h2>
                    
                    <div class="alert-box">
                        <h3>⚠️ Important Notice</h3>
                        <p><strong>Your account has been deactivated by an administrator.</strong></p>
                    </div>
                    
                    <h3>What this means:</h3>
                    <ul>
                        <li>You cannot log in to the EIRA platform</li>
                        <li>Your account data is preserved and secure</li>
                        <li>You will not be able to access interviews or assessments</li>
                        <li>This action was taken by an administrator</li>
                    </ul>
                    
                    <h3>Next Steps:</h3>
                    <ul>
                        <li>Contact our support team for more information</li>
                        <li>Wait for administrator to reactivate your account</li>
                        <li>Check your email for any follow-up communications</li>
                    </ul>
                    
                    <div class="contact-info">
                        <h3>📞 Need Help?</h3>
                        <p>If you have questions about this deactivation, please contact us:</p>
                        <p><strong>Email:</strong> support@eira.com</p>
                        <p><strong>Subject:</strong> Account Deactivation Inquiry</p>
                    </div>
                    
                    <p>We apologize for any inconvenience this may cause.</p>
                    
                    <div class="footer">
                        <p>Best regards,<br>The EIRA Team</p>
                        <p>This is a TEST email. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            `
        });
        console.log('✅ Deactivation email sent successfully!\n');
    } catch (error) {
        console.log('❌ Deactivation email failed:', error.message, '\n');
    }
    
    // Test 3: Activation Email
    console.log('3️⃣ Testing Activation Email...');
    try {
        await transporter.sendMail({
            from: `"EIRA Platform" <${process.env.SMTP_USER}>`,
            to: testEmail,
            subject: 'Account Reactivated - EIRA Interview Platform - TEST',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Account Reactivated</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #4caf50, #45a049); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .success-box { background: #e8f5e8; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 5px; }
                    .features { background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎉 Account Reactivated</h1>
                    <p>EIRA Interview Platform</p>
                </div>
                
                <div class="content">
                    <h2>Hello Test User,</h2>
                    
                    <div class="success-box">
                        <h3>✅ Great News!</h3>
                        <p><strong>Your account has been reactivated by an administrator.</strong></p>
                    </div>
                    
                    <h3>You can now:</h3>
                    <ul>
                        <li>Log in to the EIRA platform</li>
                        <li>Access all your previous data and progress</li>
                        <li>Continue with interviews and assessments</li>
                        <li>Use all platform features</li>
                    </ul>
                    
                    <div class="features">
                        <h3>🚀 What's Available:</h3>
                        <ul>
                            <li>Mock interviews with AI feedback</li>
                            <li>Progress tracking and analytics</li>
                            <li>Interview preparation materials</li>
                            <li>Performance insights and recommendations</li>
                        </ul>
                    </div>
                    
                    <p><strong>Ready to get started?</strong> Simply log in with your existing credentials and continue your interview preparation journey!</p>
                    
                    <div class="footer">
                        <p>Welcome back!<br>The EIRA Team</p>
                        <p>This is a TEST email. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            `
        });
        console.log('✅ Activation email sent successfully!\n');
    } catch (error) {
        console.log('❌ Activation email failed:', error.message, '\n');
    }
    
    console.log('🎉 Email template testing completed!');
    console.log('📧 Check your inbox for the test emails.');
    console.log('💡 If you received all emails, your email system is working correctly!');
}

// Run the test
testEmailTemplates().catch(console.error);

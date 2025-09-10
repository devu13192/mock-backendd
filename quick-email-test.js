const nodemailer = require('nodemailer');

console.log('🧪 Testing email connection...');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kudevupriya@gmail.com',
        pass: 'skobhmavhafnstnz'
    }
});

// Test connection
transporter.verify((err, success) => {
    if (err) {
        console.log('❌ Email connection failed:');
        console.log('Error:', err.message);
        console.log('Code:', err.code);
        
        if (err.code === 'EAUTH') {
            console.log('\n🔧 SOLUTION:');
            console.log('1. Go to: https://myaccount.google.com/apppasswords');
            console.log('2. Generate a new App Password for "Mail"');
            console.log('3. Replace the password in the code');
            console.log('4. Make sure 2FA is enabled on your Gmail account');
        }
    } else {
        console.log('✅ Email connection successful!');
        console.log('📧 Sending test email...');
        
        // Send test email
        transporter.sendMail({
            from: '"EIRA Test" <kudevupriya@gmail.com>',
            to: 'kudevupriya@gmail.com',
            subject: 'Test Email - EIRA System',
            text: 'This is a test email from EIRA system. If you receive this, the email system is working!',
            html: '<h1>✅ EIRA Email System Working!</h1><p>This is a test email from EIRA system.</p>'
        }, (error, info) => {
            if (error) {
                console.log('❌ Failed to send email:', error.message);
            } else {
                console.log('✅ Test email sent successfully!');
                console.log('📧 Check your inbox at kudevupriya@gmail.com');
            }
        });
    }
});

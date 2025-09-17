const MentorSchema = require("../models/mentorSchema.js")
const nodemailer = require('nodemailer')

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER || 'kudevupriya@gmail.com',
        pass: process.env.SMTP_PASS || 'skobhmavhafnstnz'
    }
})

async function sendMentorCredentialsEmail({ toEmail, mentorName, credentials }){
    if(!toEmail) {
        console.log('No email provided for mentor credentials notification')
        return
    }
    
    const subject = 'Welcome to CopyPro - Your Mentor Account Credentials'
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to CopyPro - Mentor Account</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .credentials { background: #f3e5f5; padding: 15px; border-radius: 5px; margin: 10px 0; font-family: monospace; }
            .features { background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎓 Welcome to CopyPro!</h1>
            <p>Interview Preparation Platform - Mentor Portal</p>
        </div>
        
        <div class="content">
            <h2>Hello ${mentorName},</h2>
            
            <div class="credentials-box">
                <h3>✅ Your Mentor Account Has Been Created!</h3>
                <p><strong>Welcome to the CopyPro mentor community!</strong> You have been successfully registered as a mentor on our platform.</p>
            </div>
            
            <div class="credentials">
                <h3>🔐 Your Login Credentials:</h3>
                <p><strong>Email:</strong> ${credentials.email}</p>
                <p><strong>Password:</strong> ${credentials.password}</p>
            </div>
            
            <div class="warning">
                <h3>⚠️ Important Security Notice:</h3>
                <p>Please keep your login credentials secure and do not share them with anyone. We recommend changing your password after your first login for security purposes.</p>
            </div>
            
            <h3>🚀 What You Can Do as a Mentor:</h3>
            <ul>
                <li>Access the mentor dashboard to view student progress</li>
                <li>Review and provide feedback on student interviews</li>
                <li>Create and manage interview questions</li>
                <li>Track student performance and improvement</li>
                <li>Communicate with students and provide guidance</li>
            </ul>
            
            <div class="features">
                <h3>💡 Getting Started:</h3>
                <ul>
                    <li>Log in using the credentials provided above</li>
                    <li>Complete your mentor profile setup</li>
                    <li>Explore the mentor dashboard features</li>
                    <li>Review the mentor guidelines and best practices</li>
                    <li>Start connecting with students and providing guidance</li>
                </ul>
            </div>
            
            <p><strong>Ready to make a difference?</strong> Log in now and start helping students excel in their interview preparation journey!</p>
            
            <div class="footer">
                <p>Best regards,<br>The CopyPro Team</p>
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>If you have any questions, please contact our support team.</p>
            </div>
        </div>
    </body>
    </html>
    `
    
    const text = `Welcome to CopyPro - Your Mentor Account Credentials

Hello ${mentorName},

YOUR MENTOR ACCOUNT HAS BEEN CREATED!

Welcome to the CopyPro mentor community! You have been successfully registered as a mentor on our platform.

YOUR LOGIN CREDENTIALS:
Email: ${credentials.email}
Password: ${credentials.password}

IMPORTANT SECURITY NOTICE:
Please keep your login credentials secure and do not share them with anyone. We recommend changing your password after your first login for security purposes.

WHAT YOU CAN DO AS A MENTOR:
- Access the mentor dashboard to view student progress
- Review and provide feedback on student interviews
- Create and manage interview questions
- Track student performance and improvement
- Communicate with students and provide guidance

GETTING STARTED:
- Log in using the credentials provided above
- Complete your mentor profile setup
- Explore the mentor dashboard features
- Review the mentor guidelines and best practices
- Start connecting with students and providing guidance

Ready to make a difference? Log in now and start helping students excel in their interview preparation journey!

Best regards,
The CopyPro Team

This is an automated message. Please do not reply to this email.
If you have any questions, please contact our support team.`
    
    try{ 
        console.log(`📧 Sending email from: ${process.env.SMTP_USER || 'kudevupriya@gmail.com'}`)
        console.log(`📧 Sending email to: ${toEmail}`)
        
        const mailOptions = {
            from: `"CopyPro Platform" <${process.env.SMTP_USER || 'kudevupriya@gmail.com'}>`, 
            to: toEmail, 
            subject, 
            text,
            html
        };
        
        console.log(`📧 Mail options:`, { from: mailOptions.from, to: mailOptions.to, subject: mailOptions.subject });
        
        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Mentor credentials email sent successfully to ${toEmail}`, result.messageId)
        return { success: true, message: 'Mentor credentials email sent', messageId: result.messageId }
    }catch(error){
        console.error('❌ Failed to send mentor credentials email:', error)
        console.error('❌ Error details:', {
            code: error.code,
            command: error.command,
            response: error.response
        })
        return { success: false, error: error.message, details: error }
    }
}

exports.addMentor = async (req, res) => {
    try {
        const { name, email, phone, description } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({ 
                message: 'Missing required fields: name and email are required' 
            });
        }

        // Check if mentor with this email already exists
        const existingMentor = await MentorSchema.findOne({ email: email.toLowerCase() });
        if (existingMentor) {
            return res.status(409).json({ 
                message: 'A mentor with this email address already exists' 
            });
        }

        // Create new mentor
        const newMentor = new MentorSchema({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone ? phone.trim() : '',
            description: description ? description.trim() : '',
            status: 'active',
            credentials: {
                email: 'edwinjoevarghese2026@mca.ajce.in',
                password: '@godwingeo23'
            }
        });

        const savedMentor = await newMentor.save();

        // Send credentials email
        console.log(`📧 Attempting to send email to: ${email}`);
        const emailResult = await sendMentorCredentialsEmail({
            toEmail: email,
            mentorName: name,
            credentials: {
                email: 'edwinjoevarghese2026@mca.ajce.in',
                password: '@godwingeo23'
            }
        });

        // Log email result
        console.log(`📧 Email result:`, emailResult);
        if (emailResult && !emailResult.success) {
            console.log(`⚠️ Mentor created but email failed: ${emailResult.error}`);
        } else if (emailResult && emailResult.success) {
            console.log(`✅ Email sent successfully to ${email}`);
        }

        res.status(201).json({
            message: 'Mentor added successfully',
            mentor: savedMentor,
            emailSent: emailResult ? emailResult.success : false
        });

    } catch (error) {
        console.error('Error adding mentor:', error);
        res.status(500).json({ 
            message: 'Failed to add mentor',
            error: error.message 
        });
    }
};

exports.listMentors = async (req, res) => {
    try {
        const mentors = await MentorSchema.find({})
            .sort({ createdAt: -1 })
            .select('-credentials.password'); // Exclude password from response
        
        res.json(mentors);
    } catch (error) {
        console.error('Error fetching mentors:', error);
        res.status(500).json({ 
            message: 'Failed to fetch mentors',
            error: error.message 
        });
    }
};

exports.getMentor = async (req, res) => {
    try {
        const { id } = req.params;
        const mentor = await MentorSchema.findById(id)
            .select('-credentials.password'); // Exclude password from response
        
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }
        
        res.json(mentor);
    } catch (error) {
        console.error('Error fetching mentor:', error);
        res.status(500).json({ 
            message: 'Failed to fetch mentor',
            error: error.message 
        });
    }
};

exports.updateMentor = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove credentials from update data if present
        delete updateData.credentials;

        const updatedMentor = await MentorSchema.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).select('-credentials.password');

        if (!updatedMentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        res.json({
            message: 'Mentor updated successfully',
            mentor: updatedMentor
        });

    } catch (error) {
        console.error('Error updating mentor:', error);
        res.status(500).json({ 
            message: 'Failed to update mentor',
            error: error.message 
        });
    }
};

exports.deleteMentor = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMentor = await MentorSchema.findByIdAndDelete(id);

        if (!deletedMentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        res.json({
            message: 'Mentor deleted successfully',
            mentor: deletedMentor
        });

    } catch (error) {
        console.error('Error deleting mentor:', error);
        res.status(500).json({ 
            message: 'Failed to delete mentor',
            error: error.message 
        });
    }
};

exports.updateMentorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive', 'pending'].includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status. Must be active, inactive, or pending' 
            });
        }

        const updatedMentor = await MentorSchema.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
        ).select('-credentials.password');

        if (!updatedMentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        res.json({
            message: 'Mentor status updated successfully',
            mentor: updatedMentor
        });

    } catch (error) {
        console.error('Error updating mentor status:', error);
        res.status(500).json({ 
            message: 'Failed to update mentor status',
            error: error.message 
        });
    }
};

// Test email endpoint
exports.testEmail = async (req, res) => {
    try {
        console.log('🧪 Testing email configuration...');
        
        // Test transporter connection
        await transporter.verify();
        console.log('✅ Email transporter verified successfully');
        
        // Send test email
        const testResult = await sendMentorCredentialsEmail({
            toEmail: 'kudevupriya@gmail.com', // Send to admin email for testing
            mentorName: 'Test Mentor',
            credentials: {
                email: 'edwinjoevarghese2026@mca.ajce.in',
                password: '@godwingeo23'
            }
        });
        
        res.json({
            message: 'Email test completed',
            result: testResult,
            transporterVerified: true
        });
        
    } catch (error) {
        console.error('❌ Email test failed:', error);
        res.status(500).json({
            message: 'Email test failed',
            error: error.message,
            details: error
        });
    }
};

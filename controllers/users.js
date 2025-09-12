
const UserSchema = require("../models/userSchema.js")
const mongoose = require("mongoose")
const nodemailer = require('nodemailer')
const cloudinary = require('cloudinary').v2

// Email configuration with fallback values
console.log('📧 Email system initialized with fallback credentials')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER || 'kudevupriya@gmail.com',
        pass: process.env.SMTP_PASS || 'skobhmavhafnstnz'
    }
})
// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dbocasupv',
    api_key: process.env.CLOUDINARY_API_KEY || '829761961339449',
    api_secret: process.env.CLOUDINARY_API_SECRET || '8n-9K4Oi2osFx8RK4eh_q_RYYlQ'
})

async function sendLoginEmail({ toEmail, isNew, userName = '' }){
    if(!toEmail) {
        console.log('No email provided for login notification')
        return
    }
    
    const subject = isNew ? 'Welcome to EIRA Interview Platform' : 'Login Notification - EIRA'
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isNew ? 'Welcome to EIRA' : 'Login Notification'}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2196f3, #1976d2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .features { background: #f3e5f5; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${isNew ? '🎉 Welcome to EIRA!' : '🔐 Login Notification'}</h1>
            <p>Interview Preparation Platform</p>
        </div>
        
        <div class="content">
            <h2>Hello${userName ? ` ${userName}` : ''},</h2>
            
            <div class="info-box">
                <h3>${isNew ? '✅ Account Created Successfully!' : '✅ Login Successful'}</h3>
                <p><strong>${isNew ? 'Your EIRA account has been created and you are now logged in.' : 'You have successfully logged into your EIRA account.'}</strong></p>
            </div>
            
            ${isNew ? `
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
            ` : `
            <h3>📊 Continue Your Journey:</h3>
            <ul>
                <li>Check your latest progress and scores</li>
                <li>Take new interviews to improve</li>
                <li>Review previous feedback</li>
                <li>Explore new interview topics</li>
            </ul>
            `}
            
            <p><strong>Ready to excel in your interviews?</strong> Start practicing now and take your interview skills to the next level!</p>
            
            <div class="footer">
                <p>Happy Learning!<br>The EIRA Team</p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `
    
    const text = `${isNew ? 'Welcome to EIRA Interview Platform' : 'Login Notification - EIRA'}

Hello${userName ? ` ${userName}` : ''},

${isNew ? 'ACCOUNT CREATED SUCCESSFULLY!' : 'LOGIN SUCCESSFUL'}

${isNew ? 'Your EIRA account has been created and you are now logged in.' : 'You have successfully logged into your EIRA account.'}

${isNew ? `
Get Started with EIRA:
- Take mock interviews with AI feedback
- Track your progress and improvement
- Access interview preparation materials
- Get personalized recommendations

Pro Tips for Success:
- Start with basic interviews to build confidence
- Review feedback carefully to improve
- Practice regularly for best results
- Track your progress over time
` : `
Continue Your Journey:
- Check your latest progress and scores
- Take new interviews to improve
- Review previous feedback
- Explore new interview topics
`}

Ready to excel in your interviews? Start practicing now and take your interview skills to the next level!

Happy Learning!
The EIRA Team

This is an automated message. Please do not reply to this email.`
    
    try{ 
        await transporter.sendMail({ 
            from: `"EIRA Platform" <${process.env.SMTP_USER}>`, 
            to: toEmail, 
            subject, 
            text,
            html
        })
        console.log(`✅ ${isNew ? 'Welcome' : 'Login'} email sent successfully to ${toEmail}`)
        return { success: true, message: `${isNew ? 'Welcome' : 'Login'} email sent` }
    }catch(error){
        console.error(`❌ Failed to send ${isNew ? 'welcome' : 'login'} email:`, error)
        return { success: false, error: error.message }
    }
}

async function sendDeactivationEmail({ toEmail, userName = '' }){
    if(!toEmail) {
        console.log('No email provided for deactivation notification')
        return
    }
    
    const subject = 'Account Deactivated - EIRA Interview Platform'
    const html = `
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
            .button { display: inline-block; background: #2196f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚫 Account Deactivated</h1>
            <p>EIRA Interview Platform</p>
        </div>
        
        <div class="content">
            <h2>Hello${userName ? ` ${userName}` : ''},</h2>
            
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
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `
    
    const text = `Account Deactivated - EIRA Interview Platform

Hello${userName ? ` ${userName}` : ''},

IMPORTANT NOTICE: Your account has been deactivated by an administrator.

What this means:
- You cannot log in to the EIRA platform
- Your account data is preserved and secure
- You will not be able to access interviews or assessments
- This action was taken by an administrator

Next Steps:
- Contact our support team for more information
- Wait for administrator to reactivate your account
- Check your email for any follow-up communications

Need Help?
If you have questions about this deactivation, please contact us:
Email: support@eira.com
Subject: Account Deactivation Inquiry

We apologize for any inconvenience this may cause.

Best regards,
The EIRA Team

This is an automated message. Please do not reply to this email.`
    
    try{ 
        await transporter.sendMail({ 
            from: `"EIRA Platform" <${process.env.SMTP_USER}>`, 
            to: toEmail, 
            subject, 
            text,
            html
        })
        console.log(`✅ Deactivation email sent successfully to ${toEmail}`)
        return { success: true, message: 'Deactivation email sent' }
    }catch(error){
        console.error('❌ Failed to send deactivation email:', error)
        return { success: false, error: error.message }
    }
}

async function sendActivationEmail({ toEmail, userName = '' }){
    if(!toEmail) {
        console.log('No email provided for activation notification')
        return
    }
    
    const subject = 'Account Reactivated - EIRA Interview Platform'
    const html = `
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
            .button { display: inline-block; background: #2196f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎉 Account Reactivated</h1>
            <p>EIRA Interview Platform</p>
        </div>
        
        <div class="content">
            <h2>Hello${userName ? ` ${userName}` : ''},</h2>
            
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
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `
    
    const text = `Account Reactivated - EIRA Interview Platform

Hello${userName ? ` ${userName}` : ''},

GREAT NEWS! Your account has been reactivated by an administrator.

You can now:
- Log in to the EIRA platform
- Access all your previous data and progress
- Continue with interviews and assessments
- Use all platform features

What's Available:
- Mock interviews with AI feedback
- Progress tracking and analytics
- Interview preparation materials
- Performance insights and recommendations

Ready to get started? Simply log in with your existing credentials and continue your interview preparation journey!

Welcome back!
The EIRA Team

This is an automated message. Please do not reply to this email.`
    
    try{ 
        await transporter.sendMail({ 
            from: `"EIRA Platform" <${process.env.SMTP_USER}>`, 
            to: toEmail, 
            subject, 
            text,
            html
        })
        console.log(`✅ Activation email sent successfully to ${toEmail}`)
        return { success: true, message: 'Activation email sent' }
    }catch(error){
        console.error('❌ Failed to send activation email:', error)
        return { success: false, error: error.message }
    }
}


exports.getUser = async (req,res) =>{
    const id = req.params.id
    try {
        const user = await UserSchema.findOne({id:id})
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        
        // Include active status in response
        const responseData = {
            ...user.toObject(),
            active: user.active !== false,
            deactivated: user.active === false
        }
        
        res.json(responseData)
    } catch (err) {
        res.status(500).json({ message: "Error fetching user" })
    }
}

exports.listUsers = async (req, res) => {
    try{
        // Exclude admin emails and invalid/placeholder emails from users list
        const adminEmails = ['devupriyaku2026@gmail.com', 'devupriyaku2026@mca.ajce.in', 'kudevupriya@gmail.com']
        const invalidEmails = ['delete', 'test', 'placeholder', '']
        
        const docs = await UserSchema.find({
            email: { 
                $nin: [...adminEmails, ...invalidEmails],
                $ne: null,
                $exists: true
            },
            id: { $nin: invalidEmails }
        }).sort({createdAt:-1}).lean()
        res.json(docs)
    }catch(err){
        res.status(500).json({message:'Failed to fetch users'})
    }
}
exports.addUser = async(req,res) =>{
    const id = req.params.id
    const { email } = req.body || {}
    try{
        const existing = await UserSchema.findOne({ id })
        
        // Check if user is deactivated
        if (existing && !existing.active) {
            return res.status(403).json({ 
                message: 'Blocked by admin. Contact support.',
                deactivated: true 
            })
        }
        
        const updated = await UserSchema.findOneAndUpdate(
            { id },
            { 
                $setOnInsert: { id, createdAt: new Date(), score: 0, active: true },
                $set: { email: email || '' }
            },
            { new: true, upsert: true }
        )
        await sendLoginEmail({ 
            toEmail: email || existing?.email, 
            isNew: !existing,
            userName: (email || existing?.email)?.split('@')[0] || ''
        })
        
        // Ensure active status is always included in response
        const responseData = {
            ...updated.toObject(),
            active: updated.active !== false, // Ensure boolean value
            deactivated: updated.active === false
        }
        
        return res.status(200).json(responseData)
    }catch(error){
        return res.status(500).json({ message: error.message })
    }
}

exports.addInterview= async (req,res) =>{
    const id = req.params.id
    const interviewId = req.body
    UserSchema.findOneAndUpdate({id:id}, { interviews: {...interviews,interviewId}},
                            function (err, docs) {
    if (err){
        console.log(err)
    }
    else{
        console.log("Updated User : ", docs);
    }
});
}
exports.updateScore= async (req,res) =>{
    const id = req.params.id
    const {score} = req.body
    UserSchema.findOneAndUpdate({id:id}, { $inc:{'score':score} },{new:true}).then((response)=>{
        res.send(response)
    }).catch((err)=>{
        res.send(err)
    });
}

// Update user's profile photo URL (accepts direct URL or Cloudinary upload via multer)
exports.setPhotoURL = async (req, res) => {
    const id = req.params.id
    const { photoURL } = req.body || {}
    try{
        let finalUrl = photoURL || ''

        // If a file is attached (via multer), upload buffer to Cloudinary
        if (req.file && req.file.buffer) {
            const buffer = req.file.buffer
            const folder = `avatars/${id}`
            const uploadPromise = () => new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder, resource_type: 'image' },
                    (error, result) => {
                        if (error) return reject(error)
                        return resolve(result)
                    }
                )
                stream.end(buffer)
            })
            const result = await uploadPromise()
            finalUrl = result?.secure_url || result?.url || ''
        }

        const updated = await UserSchema.findOneAndUpdate(
            { id },
            { $set: { photoURL: finalUrl || '' } },
            { new: true }
        )
        if(!updated){
            return res.status(404).json({ message: 'User not found' })
        }
        // Ensure active flags in response for consistency
        const responseData = {
            ...updated.toObject(),
            active: updated.active !== false,
            deactivated: updated.active === false
        }
        return res.json({ ...responseData, photoURL: updated.photoURL })
    }catch(err){
        console.error('Cloudinary upload/update error:', err)
        return res.status(500).json({ message: 'Failed to update photoURL' })
    }
}

exports.setActive = async (req, res) => {
    const id = req.params.id
    const { active } = req.body
    try{
        const user = await UserSchema.findOne({id:id})
        if (!user) {
            return res.status(404).json({message:'User not found'})
        }
        
        const isActivating = !!active === true && user.active === false
        const isDeactivating = !!active === false && user.active === true

        console.log(`User ${id} status change: active=${active}, current active=${user.active}, email=${user.email}`)
        console.log(`isActivating: ${isActivating}, isDeactivating: ${isDeactivating}`)

        const updated = await UserSchema.findOneAndUpdate({id:id}, { $set: { active: !!active } }, { new: true })

        // Send deactivation/activation emails depending on action
        let emailResult = null
        if (isDeactivating && user.email) {
            console.log(`📧 Sending deactivation email to ${user.email}`)
            emailResult = await sendDeactivationEmail({ 
                toEmail: user.email, 
                userName: user.email.split('@')[0] // Extract name from email
            })
        } else if (isActivating && user.email) {
            console.log(`📧 Sending activation email to ${user.email}`)
            emailResult = await sendActivationEmail({ 
                toEmail: user.email, 
                userName: user.email.split('@')[0] // Extract name from email
            })
        } else if (!user.email) {
            console.log(`⚠️ No email found for user ${id}, skipping email notification`)
        }
        
        // Log email result
        if (emailResult) {
            if (emailResult.success) {
                console.log(`✅ Email notification sent successfully`)
            } else {
                console.log(`❌ Email notification failed: ${emailResult.error}`)
            }
        }
        
        res.json(updated)
    }catch(err){
        console.error('Error in setActive:', err)
        res.status(500).json({message:'Failed to update status'})
    }
}
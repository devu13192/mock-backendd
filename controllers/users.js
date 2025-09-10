
const UserSchema = require("../models/userSchema.js")
const mongoose = require("mongoose")
const nodemailer = require('nodemailer')

// Check if email configuration is available
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('WARNING: Email configuration missing. SMTP_USER and SMTP_PASS environment variables are required for email notifications.')
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

async function sendLoginEmail({ toEmail, isNew }){
    if(!toEmail) {
        console.log('No email provided for login notification')
        return
    }
    const subject = isNew ? 'Welcome to EIRA' : 'Login Notification'
    const text = isNew ? 'Your account has been created successfully.' : 'You have successfully logged in.'
    try{ 
        await transporter.sendMail({ from: process.env.SMTP_USER, to: toEmail, subject, text })
        console.log(`Login email sent successfully to ${toEmail}`)
    }catch(error){
        console.error('Failed to send login email:', error)
    }
}

async function sendDeactivationEmail({ toEmail }){
    if(!toEmail) {
        console.log('No email provided for deactivation notification')
        return
    }
    const subject = 'Account Deactivated - EIRA'
    const text = 'Your account has been deactivated by an administrator. You will not be able to login until your account is reactivated. Please contact support if you have any questions.'
    try{ 
        await transporter.sendMail({ 
            from: process.env.SMTP_USER, 
            to: toEmail, 
            subject, 
            text 
        })
        console.log(`Deactivation email sent successfully to ${toEmail}`)
    }catch(error){
        console.error('Failed to send deactivation email:', error)
    }
}

async function sendActivationEmail({ toEmail }){
    if(!toEmail) {
        console.log('No email provided for activation notification')
        return
    }
    const subject = 'Account Reactivated - EIRA'
    const text = 'Good news! Your account has been reactivated by an administrator. You can now log in and continue using EIRA.'
    try{ 
        await transporter.sendMail({ 
            from: process.env.SMTP_USER, 
            to: toEmail, 
            subject, 
            text 
        })
        console.log(`Activation email sent successfully to ${toEmail}`)
    }catch(error){
        console.error('Failed to send activation email:', error)
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
        await sendLoginEmail({ toEmail: email || existing?.email, isNew: !existing })
        
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
        if (isDeactivating && user.email) {
            console.log(`Sending deactivation email to ${user.email}`)
            await sendDeactivationEmail({ toEmail: user.email })
        } else if (isActivating && user.email) {
            console.log(`Sending activation email to ${user.email}`)
            await sendActivationEmail({ toEmail: user.email })
        } else if (!user.email) {
            console.log(`No email found for user ${id}, skipping email notification`)
        }
        
        res.json(updated)
    }catch(err){
        console.error('Error in setActive:', err)
        res.status(500).json({message:'Failed to update status'})
    }
}
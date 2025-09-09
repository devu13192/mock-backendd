
const UserSchema = require("../models/userSchema.js")
const mongoose = require("mongoose")
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

async function sendLoginEmail({ toEmail, isNew }){
    if(!toEmail) return
    const subject = isNew ? 'Welcome to EIRA' : 'Login Notification'
    const text = isNew ? 'Your account has been created successfully.' : 'You have successfully logged in.'
    try{ await transporter.sendMail({ from: process.env.SMTP_USER, to: toEmail, subject, text }) }catch(_){ }
}

async function sendDeactivationEmail({ toEmail }){
    if(!toEmail) return
    const subject = 'Account Deactivated - EIRA'
    const text = 'Your account has been deactivated by an administrator. You will not be able to login until your account is reactivated. Please contact support if you have any questions.'
    try{ 
        await transporter.sendMail({ 
            from: process.env.SMTP_USER, 
            to: toEmail, 
            subject, 
            text 
        }) 
    }catch(error){
        console.error('Failed to send deactivation email:', error)
    }
}


exports.getUser = async (req,res) =>{
    const id = req.params.id
    await UserSchema.findOne({id:id}).then((docs)=>{
        res.send(docs)
    }).catch((err)=>{
        res.status(404).send("user not found")
    })
}

exports.listUsers = async (req, res) => {
    try{
        // Exclude admin emails from users list
        const adminEmails = ['devupriyaku2026@gmail.com', 'devupriyaku2026@mca.ajce.in', 'kudevupriya@gmail.com']
        const docs = await UserSchema.find({
            email: { $nin: adminEmails }
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
                message: 'Account deactivated. Please contact support.',
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
        return res.status(200).json(updated)
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
        
        const updated = await UserSchema.findOneAndUpdate({id:id}, { $set: { active: !!active } }, { new: true })
        
        // Send deactivation email if user is being deactivated
        if (!active && user.email) {
            await sendDeactivationEmail({ toEmail: user.email })
        }
        
        res.json(updated)
    }catch(err){
        res.status(500).json({message:'Failed to update status'})
    }
}
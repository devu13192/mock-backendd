const AdSchema = require("../models/adSchema.js")
const cloudinary = require('cloudinary').v2

// Cloudinary config (reuse envs if present)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dbocasupv',
    api_key: process.env.CLOUDINARY_API_KEY || '829761961339449',
    api_secret: process.env.CLOUDINARY_API_SECRET || '8n-9K4Oi2osFx8RK4eh_q_RYYlQ'
})

exports.createAd = async (req, res) => {
    try{
        const { title, description, link, imageUrl, createdBy } = req.body || {}
        if (!title || !description) {
            return res.status(400).json({ message: 'title and description are required' })
        }
        const doc = await AdSchema.create({ title: title.trim(), description: description.trim(), link: (link||'').trim(), imageUrl: (imageUrl||'').trim(), createdBy: (createdBy||'').trim() })
        return res.status(201).json(doc)
    }catch(err){
        console.error('createAd error:', err)
        return res.status(500).json({ message: 'Failed to create ad' })
    }
}

exports.listAds = async (_req, res) => {
    try{
        const docs = await AdSchema.find({ active: true }).sort({ createdAt: -1 }).lean()
        return res.json(docs)
    }catch(err){
        return res.status(500).json({ message: 'Failed to fetch ads' })
    }
}

exports.listAllAds = async (_req, res) => {
    try{
        const docs = await AdSchema.find({}).sort({ createdAt: -1 }).lean()
        return res.json(docs)
    }catch(err){
        return res.status(500).json({ message: 'Failed to fetch ads' })
    }
}

exports.updateAd = async (req, res) => {
    try{
        const { id } = req.params
        const update = req.body || {}
        update.updatedAt = new Date()
        const doc = await AdSchema.findByIdAndUpdate(id, update, { new: true })
        if(!doc) return res.status(404).json({ message: 'Ad not found' })
        return res.json(doc)
    }catch(err){
        return res.status(500).json({ message: 'Failed to update ad' })
    }
}

exports.deleteAd = async (req, res) => {
    try{
        const { id } = req.params
        const doc = await AdSchema.findByIdAndDelete(id)
        if(!doc) return res.status(404).json({ message: 'Ad not found' })
        return res.json({ success: true })
    }catch(err){
        return res.status(500).json({ message: 'Failed to delete ad' })
    }
}

exports.uploadImage = async (req, res) => {
    try{
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ message: 'No file uploaded' })
        }
        const folder = `ads/${new Date().getFullYear()}-${new Date().getMonth()+1}`
        const uploadPromise = () => new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder, resource_type: 'image' },
                (error, result) => {
                    if (error) return reject(error)
                    return resolve(result)
                }
            )
            stream.end(req.file.buffer)
        })
        const result = await uploadPromise()
        const url = result?.secure_url || result?.url
        return res.json({ url })
    }catch(err){
        console.error('uploadImage error:', err)
        return res.status(500).json({ message: 'Failed to upload image' })
    }
}



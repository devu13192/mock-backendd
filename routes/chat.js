const express = require('express')
const router = express.Router()
const Message = require('../models/messageSchema')
const { default: mongoose } = require('mongoose')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = 'uploads/chat-files'
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true })
		}
		cb(null, uploadDir)
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
		cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
	}
})

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 10 * 1024 * 1024 // 10MB limit
	},
	fileFilter: (req, file, cb) => {
		// Allow images, audio, PDF, and text files
		const allowedTypes = /jpeg|jpg|png|gif|webp|mp3|wav|ogg|m4a|webm|pdf|doc|docx|txt/
		const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
		const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'audio/webm'
		
		if (mimetype && extname) {
			return cb(null, true)
		} else {
			cb(new Error('File type not supported'))
		}
	}
})

// Get recent messages for a roomId (mentor is single, room can be mentor or user-mentor)
router.get('/history/:roomId', async (req, res) => {
	try {
		const { roomId } = req.params
		const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200)
		const messages = await Message.find({ roomId }).sort({ createdAt: -1 }).limit(limit)
		return res.json(messages.reverse())
	} catch (e) {
		console.error('Fetch history error', e)
		return res.status(500).send('Failed to fetch history')
	}
})

// HTTP fallback to send a message (persists + emits)
router.post('/send', async (req, res) => {
	try {
		const io = req.app.get('io')
		const { roomId, content, senderEmail, recipientEmail } = req.body || {}
		if (!roomId || !content || !senderEmail || !recipientEmail) return res.status(400).send('Missing fields')
		const doc = await Message.create({ roomId, content, senderEmail, recipientEmail })
		if (io) io.to(roomId).emit('message', doc)
        if (io && recipientEmail) {
            const email = String(recipientEmail).toLowerCase()
            io.to(`mentor:${email}`).emit('notify', { roomId, lastContent: content, createdAt: doc.createdAt, from: senderEmail })
        }
		return res.json(doc)
	} catch (e) {
		console.error('HTTP send error', e)
		return res.status(500).send('Failed to send message')
	}
})

// List conversations for a mentor, grouped by roomId with last message
// Usage: GET /chat/conversations?mentorEmail=mentor@example.com
router.get('/conversations', async (req, res) => {
	try {
		const mentorEmail = (req.query.mentorEmail || '').toString().toLowerCase().trim()
		const pipeline = mentorEmail
			? [
				{ $match: { $or: [ { recipientEmail: mentorEmail }, { senderEmail: mentorEmail } ] } },
				{ $sort: { createdAt: -1 } },
				{ $group: {
					_id: '$roomId',
					lastMessage: { $first: '$$ROOT' },
					participants: { $addToSet: '$senderEmail' },
					unread: { $sum: { $cond: [ { $and: [ { $eq: ['$recipientEmail', mentorEmail] }, { $eq: ['$readByMentor', false] } ] }, 1, 0 ] } }
				}}
			]
			: [
				{ $match: { roomId: { $regex: /^dm:/ } } },
				{ $sort: { createdAt: -1 } },
				{ $group: {
					_id: '$roomId',
					lastMessage: { $first: '$$ROOT' },
					participants: { $addToSet: '$senderEmail' }
				}}
			]
		const docs = await Message.aggregate(pipeline)
		const result = docs.map(d => {
			const last = d.lastMessage || {}
			// Infer other participant email for dm:{userEmail} rooms or via participants set
			let otherEmail = ''
			if (mentorEmail) {
				if (last.senderEmail && last.senderEmail.toLowerCase() !== mentorEmail) otherEmail = last.senderEmail
				else if (last.recipientEmail && last.recipientEmail.toLowerCase() !== mentorEmail) otherEmail = last.recipientEmail
			} else if (typeof d._id === 'string' && d._id.startsWith('dm:')) {
				otherEmail = d._id.substring(3)
			}
			else if (Array.isArray(d.participants)) otherEmail = (d.participants.find(e => (e || '').toLowerCase() !== mentorEmail) || '')
			return {
				roomId: d._id,
				otherEmail,
				lastContent: last.content || '',
				lastAt: last.createdAt || null,
				unreadCount: d.unread || 0
			}
		})
		return res.json(result)
	} catch (e) {
		console.error('Conversations error', e)
		return res.status(500).send('Failed to list conversations')
	}
})

// Mark a room as read by mentor
router.post('/read', async (req, res) => {
	try {
		const { roomId, mentorEmail } = req.body || {}
		if (!roomId || !mentorEmail) return res.status(400).send('Missing fields')
		await Message.updateMany({ roomId, recipientEmail: (mentorEmail||'').toLowerCase(), readByMentor: false }, { $set: { readByMentor: true } })
		return res.json({ ok: true })
	} catch (e) {
		console.error('Mark read error', e)
		return res.status(500).send('Failed to mark read')
	}
})

// Upload file for chat
router.post('/upload', upload.single('file'), async (req, res) => {
	try {
		const io = req.app.get('io')
		const { roomId, senderEmail, recipientEmail } = req.body || {}
		
		if (!req.file) {
			return res.status(400).send('No file uploaded')
		}
		
		if (!roomId || !senderEmail || !recipientEmail) {
			// Clean up uploaded file if validation fails
			fs.unlinkSync(req.file.path)
			return res.status(400).send('Missing required fields')
		}
		
		// Create file URL (adjust based on your server setup)
		const fileUrl = `/uploads/chat-files/${req.file.filename}`
		
		// Create message with file info
		const messageData = {
			roomId,
			content: `📎 ${req.file.originalname}`,
			senderEmail,
			recipientEmail,
			fileInfo: {
				fileName: req.file.originalname,
				fileSize: req.file.size,
				fileType: req.file.mimetype,
				fileUrl: fileUrl,
				fileId: req.file.filename
			}
		}
		
		const doc = await Message.create(messageData)
		
		// Emit to room
		if (io) {
			io.to(roomId).emit('message', doc)
			// Notify recipient
			if (recipientEmail) {
				const email = String(recipientEmail).toLowerCase()
				io.to(`mentor:${email}`).emit('notify', { 
					roomId, 
					lastContent: `📎 ${req.file.originalname}`, 
					createdAt: doc.createdAt, 
					from: senderEmail 
				})
			}
		}
		
		return res.json({
			messageId: doc._id,
			fileUrl: fileUrl,
			fileId: req.file.filename
		})
	} catch (e) {
		console.error('File upload error', e)
		// Clean up uploaded file on error
		if (req.file && fs.existsSync(req.file.path)) {
			fs.unlinkSync(req.file.path)
		}
		return res.status(500).send('Failed to upload file')
	}
})

module.exports = router



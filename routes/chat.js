const express = require('express')
const router = express.Router()
const Message = require('../models/messageSchema')
const { default: mongoose } = require('mongoose')

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

module.exports = router



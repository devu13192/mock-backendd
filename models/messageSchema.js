const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
	senderEmail: { type: String, required: true },
	recipientEmail: { type: String, required: true },
	roomId: { type: String, required: true, index: true },
	content: { type: String, required: true },
	createdAt: { type: Date, default: Date.now, index: true },
	readByMentor: { type: Boolean, default: false, index: true },
	fileInfo: {
		fileName: { type: String },
		fileSize: { type: Number },
		fileType: { type: String },
		fileUrl: { type: String },
		fileId: { type: String }
	}
})

module.exports = mongoose.model('Message', MessageSchema)



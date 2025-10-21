const express = require("express")
const fetch = require('node-fetch')
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
const interviewRoutes = require("./routes/interview.js")
const userRoutes = require("./routes/users.js")
const userInterviewRoutes = require("./routes/userInterview.js")
const contactRoutes = require("./routes/contact.js")
const mentorRoutes = require("./routes/mentor.js")
const adRoutes = require("./routes/ad.js")
const chatRoutes = require("./routes/chat.js")
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express()
const cors = require("cors")
app.use(cors())
require('dotenv/config');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use("/interview", interviewRoutes)
app.use("/user", userRoutes)
app.use("/userInterview", userInterviewRoutes)
app.use("/api/contacts", contactRoutes)
app.use("/mentor", mentorRoutes)
app.use("/ads", adRoutes)
app.use("/chat", chatRoutes)

const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Health ping for frontend latency checks
app.get('/ping', (req, res) => {
    return res.status(204).send()
})

// Simple download test that streams N bytes
app.get('/download-test', (req, res) => {
    const sizeParam = parseInt(req.query.size, 10)
    const size = Number.isFinite(sizeParam) && sizeParam > 0 ? sizeParam : (2 * 1024 * 1024)
    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Length', size)
    // Stream chunks to avoid buffering huge memory
    const chunkSize = 64 * 1024
    let sent = 0
    const interval = setInterval(() => {
        if (sent >= size) {
            clearInterval(interval)
            return res.end()
        }
        const remaining = size - sent
        const toSend = Math.min(chunkSize, remaining)
        const buf = Buffer.allocUnsafe(toSend)
        res.write(buf)
        sent += toSend
    }, 0)
})

// Endpoint to proxy OpenAI chat completions used by the user app
app.post('/completions', async (req, res) => {
    try {
        const { message } = req.body || {}
        if (!message || typeof message !== 'string') {
            return res.status(400).send('Invalid request: missing message')
        }

        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" })
        const response = await model.generateContent(message)
        const content = response?.response?.text?.() || ""
        return res.send(content)
    } catch (err) {
        console.error('Error in /completions:', err)
        return res.status(500).send('Internal Server Error')
    }
})

app.get("/", (req, res) => {
    res.send("Hello World")
})






var port = parseInt(process.env.PORT, 10) || 5000
let io = null

function startExpress(desiredPort, attempt = 0) {
    const server = app.listen(desiredPort, () => {
        console.log('Server listening on port', desiredPort)
    })

    // Initialize Socket.IO on the same HTTP server
    const { Server } = require('socket.io')
    io = new Server(server, {
        cors: { origin: '*', methods: ['GET', 'POST'] }
    })
    app.set('io', io)

    const Message = require('./models/messageSchema')
    io.on('connection', (socket) => {
        socket.on('join', ({ roomId, userEmail }) => {
            if (!roomId) return
            socket.join(roomId)
            socket.data = { roomId, userEmail }
            socket.emit('joined', { roomId })
        })

        socket.on('message', async (payload) => {
            try {
                const { roomId, content, senderEmail, recipientEmail } = payload || {}
                if (!roomId || !content || !senderEmail || !recipientEmail) return
                const doc = await Message.create({ roomId, content, senderEmail, recipientEmail, readByMentor: false })
                io.to(roomId).emit('message', doc)
                // Notify mentor channel if recipient is mentor
                if (recipientEmail) {
                    const email = String(recipientEmail).toLowerCase()
                    io.to(`mentor:${email}`).emit('notify', { roomId, lastContent: content, createdAt: doc.createdAt, from: senderEmail })
                }
            } catch (e) {
                console.error('Socket message error', e)
            }
        })

        socket.on('typing', ({ roomId, userEmail, typing }) => {
            if (!roomId) return
            socket.to(roomId).emit('typing', { userEmail, typing: !!typing })
        })
    })
    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE' && attempt < 5) {
            const nextPort = desiredPort + 1
            console.warn(`Port ${desiredPort} in use. Trying ${nextPort}...`)
            startExpress(nextPort, attempt + 1)
        } else {
            throw err
        }
    })
}

mongoose.connect("mongodb+srv://devupriya:devupriya@cluster0.bxhdiuc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        startExpress(port)
    });
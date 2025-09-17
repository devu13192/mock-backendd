const mongoose = require("mongoose")

const mentorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'pending'
    },
    credentials: {
        email: {
            type: String,
            default: 'edwinjoevarghese2026@mca.ajce.in'
        },
        password: {
            type: String,
            default: '@godwingeo23'
        }
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    },
    updatedAt: {
        type: Date,
        default: () => new Date()
    }
});

// Update the updatedAt field before saving
mentorSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const MentorSchema = mongoose.model('MentorSchema', mentorSchema)

module.exports = MentorSchema

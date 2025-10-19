const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 10
  },
  inquiryType: {
    type: String,
    required: true,
    enum: ['general', 'technical', 'enterprise', 'partnership', 'other'],
    default: 'general'
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
    minlength: 20
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'contacted'],
    default: 'new'
  },
  lastEmailAt: {
    type: Date
  },
  lastReplySubject: {
    type: String,
    trim: true,
    maxlength: 200
  },
  lastReplyBody: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  consent: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
contactSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);


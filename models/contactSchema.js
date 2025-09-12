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
    maxlength: 20
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
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['new', 'contacted'],
    default: 'new'
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


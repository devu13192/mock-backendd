const Contact = require('../models/contactSchema');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Reuse existing email setup style
const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'kudevupriya@gmail.com',
    pass: process.env.SMTP_PASS || 'skobhmavhafnstnz'
  }
});

// Enhanced server-side validation functions
const isValidEmail = (email) => {
  const trimmed = email.trim().toLowerCase();
  
  // Basic format check with comprehensive regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) return false;
  
  // Check for minimum length
  if (trimmed.length < 5) return false; // Minimum: a@b.c
  
  // Check for maximum length
  if (trimmed.length > 254) return false; // RFC 5321 limit
  
  // Split email into local and domain parts
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  
  const [localPart, domainPart] = parts;
  
  // Local part validation
  if (localPart.length < 1 || localPart.length > 64) return false; // RFC 5321 limit
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (localPart.includes('..')) return false; // No consecutive dots
  
  // Domain part validation
  if (domainPart.length < 4 || domainPart.length > 253) return false; // Must have at least x.y.z format
  if (domainPart.startsWith('.') || domainPart.endsWith('.')) return false;
  if (domainPart.includes('..')) return false; // No consecutive dots
  
  // Enhanced spam detection
  // Check for excessive repetition in local part
  if (localPart.length > 10) {
    const charCounts = {};
    for (let char of localPart.toLowerCase()) {
      charCounts[char] = (charCounts[char] || 0) + 1;
    }
    const maxCount = Math.max(...Object.values(charCounts));
    if (maxCount > localPart.length * 0.5) return false;
  }
  
  // Check for numeric repetition (like 454444444444444444444444444444444)
  if (/\d{10,}/.test(localPart)) return false;
  
  // Check for keyboard patterns in local part
  const keyboardPatterns = [
    /^[qwertyuiop]+$/i,
    /^[asdfghjkl]+$/i,
    /^[zxcvbnm]+$/i,
    /^[abcdefghijklmnopqrstuvwxyz]+$/i
  ];
  
  if (keyboardPatterns.some(pattern => pattern.test(localPart))) return false;
  
  // Check for common spam domains
  const spamDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
  if (spamDomains.some(domain => domainPart.includes(domain))) return false;
  
  return true;
};

const isValidName = (name) => {
  const trimmed = name.trim();
  
  // Check for minimum length
  if (trimmed.length < 3) return false;
  
  // Check for maximum length
  if (trimmed.length > 50) return false;
  
  // Check for alphabets and spaces only
  if (!/^[a-zA-Z\s]+$/.test(trimmed)) return false;
  
  // Check for minimum two words (first and last name)
  const words = trimmed.split(/\s+/).filter(word => word.length > 0);
  if (words.length < 2) return false;
  
  // Check for meaningful names (reject single letters or very short words)
  const hasValidWords = words.every(word => word.length >= 2);
  if (!hasValidWords) return false;
  
  // Enhanced keyboard pattern detection
  const keyboardPatterns = [
    /^[qwertyuiop]+$/i,
    /^[asdfghjkl]+$/i,
    /^[zxcvbnm]+$/i,
    /^[abcdefghijklmnopqrstuvwxyz]+$/i,
    /^(.)\1+$/i, // repeated characters
    /^[lkjhgfdsa]+$/i, // reverse keyboard patterns
    /^[poiuytrewq]+$/i,
    /^[mnbvcxz]+$/i
  ];
  
  if (keyboardPatterns.some(pattern => pattern.test(trimmed))) return false;
  
  // Check for all uppercase junk text
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) return false;
  
  // Check for excessive repetition in words
  const hasExcessiveRepetition = words.some(word => {
    const charCounts = {};
    for (let char of word.toLowerCase()) {
      charCounts[char] = (charCounts[char] || 0) + 1;
    }
    const maxCount = Math.max(...Object.values(charCounts));
    return maxCount > word.length * 0.6; // More than 60% same character
  });
  
  if (hasExcessiveRepetition) return false;
  
  // Check for realistic name patterns (should have vowels)
  const hasVowels = words.some(word => /[aeiou]/i.test(word));
  if (!hasVowels) return false;
  
  return true;
};

const isValidMessage = (message) => {
  const trimmed = message.trim();
  
  // Check minimum length
  if (trimmed.length < 20) return false;
  
  // Check maximum length
  if (trimmed.length > 2000) return false;
  
  // Enhanced meaningful content validation
  const words = trimmed.split(/\s+/).filter(word => word.length > 0);
  if (words.length < 3) return false;
  
  // Enhanced keyboard pattern detection
  const keyboardPatterns = [
    /^[qwertyuiop\s]+$/i,
    /^[asdfghjkl\s]+$/i,
    /^[zxcvbnm\s]+$/i,
    /^[abcdefghijklmnopqrstuvwxyz\s]+$/i,
    /^(.)\1+$/i, // repeated characters
    /^[lkjhgfdsa\s]+$/i, // reverse keyboard patterns
    /^[poiuytrewq\s]+$/i,
    /^[mnbvcxz\s]+$/i,
    /^[gfdfghjkl';lkjhglokiju\s]+$/i // specific gibberish pattern
  ];
  
  if (keyboardPatterns.some(pattern => pattern.test(trimmed))) return false;
  
  // Check for proper sentence structure (should contain some punctuation or proper words)
  const hasProperWords = words.some(word => word.length >= 3);
  if (!hasProperWords) return false;
  
  // Enhanced repetition detection
  const wordCounts = {};
  words.forEach(word => {
    wordCounts[word.toLowerCase()] = (wordCounts[word.toLowerCase()] || 0) + 1;
  });
  
  const maxRepeats = Math.max(...Object.values(wordCounts));
  if (maxRepeats > words.length * 0.3) return false;
  
  // Check for character repetition within words
  const hasExcessiveCharRepetition = words.some(word => {
    if (word.length < 4) return false;
    const charCounts = {};
    for (let char of word.toLowerCase()) {
      charCounts[char] = (charCounts[char] || 0) + 1;
    }
    const maxCount = Math.max(...Object.values(charCounts));
    return maxCount > word.length * 0.5; // More than 50% same character
  });
  
  if (hasExcessiveCharRepetition) return false;
  
  // Check for realistic sentence structure
  const hasVowels = words.some(word => /[aeiou]/i.test(word));
  if (!hasVowels) return false;
  
  // Check for minimum meaningful content
  const meaningfulWords = words.filter(word => 
    word.length >= 3 && 
    /[aeiou]/i.test(word) && 
    !/^(.)\1+$/.test(word)
  );
  
  if (meaningfulWords.length < 2) return false;
  
  // Check for common spam patterns
  const spamPatterns = [
    /(.)\1{4,}/, // 5 or more consecutive same characters
    /[^a-zA-Z0-9\s.,!?]{3,}/, // 3 or more consecutive special characters
    /\b(.)\1{3,}\b/ // 4 or more consecutive same characters in a word
  ];
  
  if (spamPatterns.some(pattern => pattern.test(trimmed))) return false;
  
  return true;
};

const isValidPhoneNumber = (phone) => {
  if (!phone) return true; // Optional field
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Must be exactly 10 digits
  if (cleaned.length !== 10) return false;
  
  // Must start with 6, 7, 8, or 9
  if (!/^[6789]/.test(cleaned)) return false;
  
  // Enhanced spam and fake number detection
  // Check for repeated digits (spam prevention)
  if (/^(\d)\1{9}$/.test(cleaned)) return false;
  
  // Check for sequential patterns
  const isSequential = /^(0123456789|9876543210)$/.test(cleaned);
  if (isSequential) return false;
  
  // Check for excessive repetition (more than 5 same digits)
  const digitCounts = {};
  for (let digit of cleaned) {
    digitCounts[digit] = (digitCounts[digit] || 0) + 1;
  }
  const maxCount = Math.max(...Object.values(digitCounts));
  if (maxCount > 5) return false;
  
  // Check for unrealistic patterns (like 9555555555, 8888888888)
  const unrealisticPatterns = [
    /^9{10}$/, // All 9s
    /^8{10}$/, // All 8s
    /^7{10}$/, // All 7s
    /^6{10}$/, // All 6s
    /^(\d)\1{4,}$/ // 5 or more consecutive same digits
  ];
  
  if (unrealisticPatterns.some(pattern => pattern.test(cleaned))) return false;
  
  // Check for common fake patterns
  if (cleaned === '1234567890' || cleaned === '9876543210') return false;
  
  return true;
};

// Create a new contact
const createContact = async (req, res) => {
  try {
    const { name, email, phone, inquiryType, message, consent } = req.body;

    // Validate required fields
    if (!name || !email || !inquiryType || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, inquiryType, and message are required'
      });
    }

    if (!consent) {
      return res.status(400).json({
        success: false,
        message: 'Consent is required to submit the contact form'
      });
    }

    // Server-side validation for message content
    if (!isValidMessage(message)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a meaningful message with proper words and sentences. Avoid keyboard patterns, repeated characters, or gibberish.'
      });
    }

    // Server-side validation for phone number
    if (!isValidPhoneNumber(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits starting with 6, 7, 8, or 9.'
      });
    }

    // Server-side validation for name content
    if (!isValidName(name)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid name. Avoid keyboard patterns, repeated characters, or gibberish.'
      });
    }

    // Server-side email validation
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address with proper format.'
      });
    }

    // Create new contact
    const contact = new Contact({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.replace(/\D/g, '') : '', // Clean phone number
      inquiryType,
      message: message.trim(),
      consent
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Contact message sent successfully!',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        inquiryType: contact.inquiryType,
        status: contact.status,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send contact message',
      error: error.message
    });
  }
};

// Get all contacts with sorting
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ status: 1, createdAt: -1 }) // 'new' first, then by createdAt desc
      .select('-__v');

    res.status(200).json({
      success: true,
      data: contacts,
      count: contacts.length
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: error.message
    });
  }
};

// Update contact status
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['new', 'in_progress', 'contacted'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of "new", "in_progress", or "contacted"'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Contact status updated to ${status}`,
      data: contact
    });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status',
      error: error.message
    });
  }
};

// Send reply to a contact and update status
const replyToContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message } = req.body || {};

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    await mailTransporter.sendMail({
      from: `"EIRA Support" <${process.env.SMTP_USER || 'no-reply@eira.local'}>`,
      to: contact.email,
      subject: subject,
      text: message,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827"><p>${message
        .replace(/\n/g, '<br/>')}</p><hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb"/><p style="font-size:12px;color:#6b7280">— EIRA Support</p></div>`
    });

    contact.status = 'contacted';
    contact.lastEmailAt = new Date();
    contact.lastReplySubject = subject;
    contact.lastReplyBody = message;
    await contact.save();

    res.status(200).json({ success: true, message: 'Reply sent and contact updated', data: contact });
  } catch (error) {
    console.error('Error replying to contact:', error);
    res.status(500).json({ success: false, message: 'Failed to send reply', error: error.message });
  }
};

// Delete a single contact
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.status(200).json({ success: true, message: 'Contact deleted', data: { id } });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ success: false, message: 'Failed to delete contact', error: error.message });
  }
};

// Bulk delete contacts
const bulkDeleteContacts = async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids array is required' });
    }
    const result = await Contact.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ success: true, message: `Deleted ${result.deletedCount} contact(s)`, data: { deletedCount: result.deletedCount } });
  } catch (error) {
    console.error('Error bulk deleting contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk delete contacts', error: error.message });
  }
};

// Get contact statistics
const getContactStats = async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const contactedContacts = await Contact.countDocuments({ status: 'contacted' });
    
    // Get contacts from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentContacts = await Contact.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalContacts,
        new: newContacts,
        contacted: contactedContacts,
        recent: recentContacts
      }
    });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics',
      error: error.message
    });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  updateContactStatus,
  getContactStats,
  replyToContact,
  deleteContact,
  bulkDeleteContacts
};


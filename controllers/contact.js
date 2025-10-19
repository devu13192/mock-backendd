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

// Server-side validation functions
const isValidEmail = (email) => {
  const trimmed = email.trim().toLowerCase();
  
  // Basic format check with comprehensive regex
  const emailRegex = /^(?:[a-zA-Z0-9_'^&\/+-])+(?:\.(?:[a-zA-Z0-9_'^&\/+-]+))*@(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/;
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
  
  // Check for invalid characters in local part
  if (!/^[a-zA-Z0-9._'^&\/+-]+$/.test(localPart)) return false;
  
  // Domain part validation
  if (domainPart.length < 4 || domainPart.length > 253) return false; // Must have at least x.y.z format
  if (domainPart.startsWith('.') || domainPart.endsWith('.')) return false;
  if (domainPart.includes('..')) return false; // No consecutive dots
  
  // Check domain has valid TLD
  const domainParts = domainPart.split('.');
  if (domainParts.length < 2) return false; // Must have at least domain.tld
  
  // Check TLD length (2-63 characters)
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || tld.length > 63) return false;
  
  // Check TLD contains only letters
  if (!/^[a-zA-Z]+$/.test(tld)) return false;
  
  // Check for common invalid patterns
  const invalidPatterns = [
    /^[0-9]+@/, // Email starting with only numbers
    /@[0-9]+$/, // Email ending with only numbers
    /^[^a-zA-Z]/, // Email starting with non-letter
    /@[^a-zA-Z0-9]/, // Domain starting with invalid character
    /\.{2,}/, // Multiple consecutive dots
    /^\.|\.$/, // Starting or ending with dot
    /@\.|\.@/, // Dot immediately before or after @
  ];
  
  if (invalidPatterns.some(pattern => pattern.test(trimmed))) return false;
  
  // Check for keyboard patterns in local part (common gibberish patterns)
  // More specific patterns to avoid false positives with legitimate names
  const keyboardPatterns = [
    /^[qwertyuiop]{4,}$/i, // Entire local part is qwerty row
    /^[asdfghjkl]{4,}$/i, // Entire local part is asdf row
    /^[zxcvbnm]{4,}$/i, // Entire local part is zxcv row
    /[qwertyuiop]{6,}/i, // 6+ consecutive qwerty row characters
    /[asdfghjkl]{6,}/i, // 6+ consecutive asdf row characters
    /[zxcvbnm]{6,}/i, // 6+ consecutive zxcv row characters
    /[1234567890]{6,}/, // 6+ consecutive numbers
    /[qwertyuiopasdfghjklzxcvbnm]{12,}/i, // 12+ consecutive keyboard characters
  ];
  
  if (keyboardPatterns.some(pattern => pattern.test(localPart))) return false;
  
  // Check for suspicious patterns (potential spam/gibberish)
  const suspiciousPatterns = [
    /[a-z]{15,}/, // More than 15 consecutive lowercase letters
    /[A-Z]{15,}/, // More than 15 consecutive uppercase letters
    /[0-9]{10,}/, // More than 10 consecutive numbers
    /[a-zA-Z]{20,}/, // More than 20 consecutive letters
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(trimmed))) return false;
  
  return true;
};

const isValidName = (name) => {
  const trimmed = name.trim();
  
  // Check for minimum length
  if (trimmed.length < 3) return false;
  
  // Check for repeated characters (more than 2 consecutive same characters)
  if (/(.)\1{2,}/.test(trimmed)) return false;
  
  // Check for keyboard patterns (common gibberish patterns) - more strict for names
  const keyboardPatterns = [
    /[qwertyuiop]{4,}/i,
    /[asdfghjkl]{4,}/i,
    /[zxcvbnm]{4,}/i,
    /[qwerty]{4,}/i,
    /[asdf]{4,}/i,
    /[zxcv]{4,}/i,
    /[1234567890]{3,}/,
    /[abcdefghijklmnopqrstuvwxyz]{8,}/i,
    /[qwertyuiopasdfghjklzxcvbnm]{10,}/i
  ];
  
  if (keyboardPatterns.some(pattern => pattern.test(trimmed))) return false;
  
  // Check for excessive special characters or symbols
  const specialCharCount = (trimmed.match(/[^a-zA-Z\s'.-]/g) || []).length;
  if (specialCharCount > 0) return false; // Names should only have letters, spaces, apostrophes, dots, and hyphens
  
  // Check for meaningful word patterns (at least 1 word with 2+ characters)
  const words = trimmed.split(/\s+/).filter(word => word.length >= 2);
  if (words.length < 1) return false;
  
  // Check for excessive repetition of same word
  const wordCounts = {};
  words.forEach(word => {
    wordCounts[word.toLowerCase()] = (wordCounts[word.toLowerCase()] || 0) + 1;
  });
  
  const maxWordRepetition = Math.max(...Object.values(wordCounts));
  if (maxWordRepetition > 1) return false; // No repeated words in names
  
  return true;
};

const isValidMessage = (message) => {
  const trimmed = message.trim();
  
  // Check for minimum meaningful content
  if (trimmed.length < 20) return false;
  
  // Check for repeated characters (more than 3 consecutive same characters)
  if (/(.)\1{3,}/.test(trimmed)) return false;
  
  // Check for keyboard patterns (common gibberish patterns)
  const keyboardPatterns = [
    /[qwertyuiop]{4,}/i,
    /[asdfghjkl]{4,}/i,
    /[zxcvbnm]{4,}/i,
    /[qwerty]{4,}/i,
    /[asdf]{4,}/i,
    /[zxcv]{4,}/i,
    /[1234567890]{4,}/,
    /[abcdefghijklmnopqrstuvwxyz]{6,}/i,
    /[qwertyuiopasdfghjklzxcvbnm]{8,}/i
  ];
  
  if (keyboardPatterns.some(pattern => pattern.test(trimmed))) return false;
  
  // Check for excessive special characters or symbols
  const specialCharCount = (trimmed.match(/[^a-zA-Z0-9\s.,!?;:'"()-]/g) || []).length;
  if (specialCharCount > trimmed.length * 0.3) return false;
  
  // Check for meaningful word patterns (at least 3 words with 2+ characters each)
  const words = trimmed.split(/\s+/).filter(word => word.length >= 2);
  if (words.length < 3) return false;
  
  // Check for excessive repetition of same word
  const wordCounts = {};
  words.forEach(word => {
    wordCounts[word.toLowerCase()] = (wordCounts[word.toLowerCase()] || 0) + 1;
  });
  
  const maxWordRepetition = Math.max(...Object.values(wordCounts));
  if (maxWordRepetition > Math.ceil(words.length / 2)) return false;
  
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


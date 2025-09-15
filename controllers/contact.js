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

    // Create new contact
    const contact = new Contact({
      name,
      email,
      phone: phone || '',
      inquiryType,
      message,
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


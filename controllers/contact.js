const Contact = require('../models/contactSchema');

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

    if (!status || !['new', 'contacted'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be either "new" or "contacted"'
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
  getContactStats
};


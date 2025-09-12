const express = require('express');
const router = express.Router();
const {
  createContact,
  getAllContacts,
  updateContactStatus,
  getContactStats
} = require('../controllers/contact');

// Public routes
router.post('/', createContact);

// Admin routes (you might want to add authentication middleware here)
router.get('/', getAllContacts);
router.get('/stats', getContactStats);
router.patch('/:id/status', updateContactStatus);

module.exports = router;


const express = require('express');
const router = express.Router();
const {
  createContact,
  getAllContacts,
  updateContactStatus,
  getContactStats,
  replyToContact,
  deleteContact,
  bulkDeleteContacts
} = require('../controllers/contact');

// Public routes
router.post('/', createContact);

// Admin routes (you might want to add authentication middleware here)
router.get('/', getAllContacts);
router.get('/stats', getContactStats);
router.patch('/:id/status', updateContactStatus);
router.post('/:id/reply', replyToContact);
router.delete('/:id', deleteContact);
router.post('/bulk/delete', bulkDeleteContacts);

module.exports = router;


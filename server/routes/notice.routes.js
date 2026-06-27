const express = require('express');
const router = express.Router();
const { 
  getNotices, 
  getAllNoticesAdmin, 
  createNotice, 
  deleteNotice 
} = require('../controllers/notice.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

router.get('/', protect, getNotices);
router.get('/admin', protect, adminOnly, getAllNoticesAdmin);
router.post('/', protect, adminOnly, createNotice);
router.delete('/:id', protect, adminOnly, deleteNotice);

module.exports = router;

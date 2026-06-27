const express = require('express');
const router = express.Router();
const { 
  initiateCheckout, 
  verifyPayment, 
  uploadBankSlip, 
  getMyPendingPayments, 
  getPendingBankSlips, 
  approveBankSlip, 
  rejectBankSlip 
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');
const { upload } = require('../config/cloudinary');

router.post('/checkout', protect, initiateCheckout);
router.post('/verify', protect, verifyPayment);

// Bank Slip Upload & Verification Pathways
router.post('/bank-slip', protect, upload.single('file'), uploadBankSlip);
router.get('/my-pending', protect, getMyPendingPayments);

// Admin Manual Slips Approval Management
router.get('/admin/pending', protect, adminOnly, getPendingBankSlips);
router.put('/admin/approve/:id', protect, adminOnly, approveBankSlip);
router.put('/admin/reject/:id', protect, adminOnly, rejectBankSlip);

module.exports = router;

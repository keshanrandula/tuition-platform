const Payment = require('../models/Payment');
const User = require('../models/User');
const Week = require('../models/Week');
const VideoSet = require('../models/VideoSet');
const sendEmail = require('../utils/sendEmail');

// @desc    Initiate a content checkout transaction
// @route   POST /api/payments/checkout
// @access  Private
exports.initiateCheckout = async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    const userId = req.user._id;

    let amount = 0;
    let title = '';

    if (itemType === 'week') {
      const week = await Week.findById(itemId);
      if (!week) {
        return res.status(404).json({ success: false, message: 'Week module not found' });
      }
      amount = week.price;
      title = `Weekly Class Module - Week ${week.weekNumber}: ${week.title}`;
    } else if (itemType === 'videoSet') {
      const videoSet = await VideoSet.findById(itemId);
      if (!videoSet) {
        return res.status(404).json({ success: false, message: 'Video set package not found' });
      }
      amount = videoSet.price;
      title = `Video Package Set - ${videoSet.title}`;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid item type' });
    }

    // Generate unique mock payment reference
    const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const payment = await Payment.create({
      user: userId,
      itemType,
      itemId,
      itemTypeModel: itemType === 'week' ? 'Week' : 'VideoSet',
      amount,
      transactionId,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      payment: {
        _id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        title,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error('Checkout initialization error:', error);
    res.status(500).json({ success: false, message: 'Server error during payment setup' });
  }
};

// @desc    Verify transaction status and unlock course content
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId, status } = req.body;
    const userId = req.user._id;

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment transaction record not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Transaction has already been processed' });
    }

    payment.status = status === 'completed' ? 'completed' : 'failed';
    await payment.save();

    if (payment.status === 'completed') {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      let contentName = '';

      // Unlock content for the user
      if (payment.itemType === 'week') {
        const week = await Week.findById(payment.itemId);
        contentName = week ? `Week ${week.weekNumber}: ${week.title}` : 'Weekly Module';
        
        if (!user.purchasedWeeks.includes(payment.itemId.toString())) {
          user.purchasedWeeks.push(payment.itemId);
        }
      } else if (payment.itemType === 'videoSet') {
        const videoSet = await VideoSet.findById(payment.itemId);
        contentName = videoSet ? videoSet.title : 'Video Set Package';

        if (!user.purchasedVideoSets.includes(payment.itemId.toString())) {
          user.purchasedVideoSets.push(payment.itemId);
        }
      }

      await user.save();

      // Dispatch receipt email in background
      sendEmail({
        to: user.email,
        subject: `Payment Confirmed: Access Unlocked for ${contentName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #6366f1; text-align: center;">Payment Receipt & Confirmation</h2>
            <p>Dear ${user.name},</p>
            <p>Thank you for your purchase! We have successfully received your payment. Access to the purchased module has been unlocked on your dashboard.</p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0; color: #4b5563;"><strong>Purchased Item:</strong></td>
                  <td style="padding: 5px 0; text-align: right;">${contentName}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #4b5563;"><strong>Transaction ID:</strong></td>
                  <td style="padding: 5px 0; text-align: right; font-family: monospace;">${payment.transactionId}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #4b5563;"><strong>Amount Paid:</strong></td>
                  <td style="padding: 5px 0; text-align: right; color: #10b981; font-weight: bold;">$${payment.amount.toFixed(2)} USD</td>
                </tr>
              </table>
            </div>
            <p>To access your materials, log into your student dashboard at any time.</p>
            <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">Tuition Platform, Inc. All rights reserved.</p>
          </div>
        `,
      });

      return res.json({
        success: true,
        message: 'Payment completed and content unlocked successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          purchasedWeeks: user.purchasedWeeks,
          purchasedVideoSets: user.purchasedVideoSets,
        },
      });
    } else {
      return res.status(400).json({ success: false, message: 'Payment simulation transaction failed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Server error during payment verification' });
  }
};

// ==========================================
// BANK SLIP EXTENSIONS
// ==========================================

// @desc    Upload bank deposit slip for manual confirmation
// @route   POST /api/payments/bank-slip
// @access  Private
exports.uploadBankSlip = async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    const userId = req.user._id;

    if (!itemId || !itemType) {
      return res.status(400).json({ success: false, message: 'Please provide itemId and itemType' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a bank deposit slip file' });
    }

    let amount = 0;
    let title = '';

    if (itemType === 'week') {
      const week = await Week.findById(itemId);
      if (!week) return res.status(404).json({ success: false, message: 'Week module not found' });
      amount = week.price;
      title = `Week ${week.weekNumber}: ${week.title}`;
    } else if (itemType === 'videoSet') {
      const videoSet = await VideoSet.findById(itemId);
      if (!videoSet) return res.status(404).json({ success: false, message: 'Video set package not found' });
      amount = videoSet.price;
      title = videoSet.title;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid item type' });
    }

    const transactionId = `slip_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const slipUrl = (req.file.path && req.file.path.startsWith('http'))
      ? req.file.path
      : `/uploads/${req.file.filename}`;

    const payment = await Payment.create({
      user: userId,
      itemType,
      itemId,
      itemTypeModel: itemType === 'week' ? 'Week' : 'VideoSet',
      amount,
      transactionId,
      status: 'pending',
      paymentMethod: 'bank',
      slipUrl
    });

    res.status(201).json({
      success: true,
      message: 'Bank receipt uploaded successfully. Awaiting admin manual confirmation.',
      payment
    });
  } catch (error) {
    console.error('Bank slip upload error:', error);
    res.status(500).json({ success: false, message: 'Server error during bank slip upload' });
  }
};

// @desc    Get pending bank slip payments for logged-in student
// @route   GET /api/payments/my-pending
// @access  Private
exports.getMyPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ 
      user: req.user._id, 
      status: 'pending', 
      paymentMethod: 'bank' 
    });
    res.json({ success: true, payments });
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving pending payments' });
  }
};

// @desc    Get all pending bank slip payments (Admin only)
// @route   GET /api/payments/admin/pending
// @access  Private/Admin
exports.getPendingBankSlips = async (req, res) => {
  try {
    const payments = await Payment.find({ 
      status: 'pending', 
      paymentMethod: 'bank' 
    }).populate('user', 'name email');

    res.json({ success: true, payments });
  } catch (error) {
    console.error('Get all pending slips error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving bank slips log' });
  }
};

// @desc    Approve bank slip payment and unlock course content (Admin only)
// @route   PUT /api/payments/admin/approve/:id
// @access  Private/Admin
exports.approveBankSlip = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Transaction has already been processed' });
    }

    payment.status = 'completed';
    await payment.save();

    const user = await User.findById(payment.user);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Associated student profile not found' });
    }

    let contentName = '';
    if (payment.itemType === 'week') {
      const week = await Week.findById(payment.itemId);
      contentName = week ? `Week ${week.weekNumber}: ${week.title}` : 'Weekly Module';
      if (!user.purchasedWeeks.includes(payment.itemId.toString())) {
        user.purchasedWeeks.push(payment.itemId);
      }
    } else if (payment.itemType === 'videoSet') {
      const videoSet = await VideoSet.findById(payment.itemId);
      contentName = videoSet ? videoSet.title : 'Video Set Package';
      if (!user.purchasedVideoSets.includes(payment.itemId.toString())) {
        user.purchasedVideoSets.push(payment.itemId);
      }
    }

    await user.save();

    // Dispatch receipt confirmation email in background
    sendEmail({
      to: user.email,
      subject: `Payment Confirmed: Access Unlocked for ${contentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2 style="color: #6366f1; text-align: center;">Payment Receipt & Confirmation</h2>
          <p>Dear ${user.name},</p>
          <p>We have reviewed and approved your bank deposit receipt! Access to the purchased module has been unlocked on your dashboard.</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; color: #4b5563;"><strong>Purchased Item:</strong></td>
                <td style="padding: 5px 0; text-align: right;">${contentName}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #4b5563;"><strong>Transaction Ref:</strong></td>
                <td style="padding: 5px 0; text-align: right; font-family: monospace;">${payment.transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #4b5563;"><strong>Amount:</strong></td>
                <td style="padding: 5px 0; text-align: right; color: #10b981; font-weight: bold;">$${payment.amount.toFixed(2)} USD</td>
              </tr>
            </table>
          </div>
          <p>To access your materials, log into your student dashboard at any time.</p>
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Tuition Platform, Inc. All rights reserved.</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'Bank slip approved and content unlocked successfully' });
  } catch (error) {
    console.error('Approve bank slip error:', error);
    res.status(500).json({ success: false, message: 'Server error during bank slip approval' });
  }
};

// @desc    Reject bank slip payment (Admin only)
// @route   PUT /api/payments/admin/reject/:id
// @access  Private/Admin
exports.rejectBankSlip = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Transaction has already been processed' });
    }

    payment.status = 'failed';
    await payment.save();

    res.json({ success: true, message: 'Bank slip payment rejected successfully' });
  } catch (error) {
    console.error('Reject bank slip error:', error);
    res.status(500).json({ success: false, message: 'Server error during bank slip rejection' });
  }
};

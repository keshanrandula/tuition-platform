const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

// POST /api/ai/chat - Send messages to OpenRouter AI (Protected)
router.post('/chat', protect, handleChat);

module.exports = router;

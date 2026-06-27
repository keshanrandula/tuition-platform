const express = require('express');
const router = express.Router();
const {
  getProgressSummary,
  updateVideoProgress,
  logQuizAttempt,
  logClassAttendance
} = require('../controllers/progress.controller');
const { protect } = require('../middleware/auth.middleware');

// All progress routes are protected
router.get('/summary', protect, getProgressSummary);
router.post('/video/:videoId', protect, updateVideoProgress);
router.post('/quiz/:weekId', protect, logQuizAttempt);
router.post('/class/:classId', protect, logClassAttendance);

module.exports = router;

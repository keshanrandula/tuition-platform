const express = require('express');
const router = express.Router();
const { getMetrics, getAnalytics, getProgressOverview, getStudents, updateStudentAccess } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

router.get('/metrics', protect, adminOnly, getMetrics);
router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/progress-overview', protect, adminOnly, getProgressOverview);
router.get('/students', protect, adminOnly, getStudents);
router.put('/students/:id/access', protect, adminOnly, updateStudentAccess);

module.exports = router;

const express = require('express');
const router = express.Router();
const { 
  getAllWeeks, 
  getVideosByWeek, 
  uploadVideo,
  createWeek, 
  getVideoSets, 
  createVideoSet, 
  getVideos, 
  getVideoById, 
  deleteVideo,
  addWeekResource,
  deleteWeekResource
} = require('../controllers/video.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');
const { checkContentAccess } = require('../middleware/payment.middleware');
const { upload } = require('../config/cloudinary');

// Week Module Routes
router.get('/weeks', protect, getAllWeeks);
router.post('/weeks', protect, adminOnly, createWeek);

// VideoSet Package Routes
router.get('/sets', protect, getVideoSets);
router.post('/sets', protect, adminOnly, createVideoSet);

// Specific Week Number Route
router.get('/week/:weekNumber', protect, getVideosByWeek);

// General Video Routes
router.get('/', protect, getVideos);

router.post(
  '/upload',
  protect,
  adminOnly,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  uploadVideo
);

router.get(
  '/:id',
  protect,
  (req, res, next) => {
    req.params.type = 'video';
    next();
  },
  checkContentAccess,
  getVideoById
);

router.post(
  '/',
  protect,
  adminOnly,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  uploadVideo
);

router.delete('/:id', protect, adminOnly, deleteVideo);

// Week PDF Resource Routes
router.post(
  '/weeks/:id/resources',
  protect,
  adminOnly,
  upload.single('file'),
  addWeekResource
);

router.delete(
  '/weeks/:weekId/resources/:resourceId',
  protect,
  adminOnly,
  deleteWeekResource
);

module.exports = router;

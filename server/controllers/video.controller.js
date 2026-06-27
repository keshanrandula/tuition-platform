const Video = require('../models/Video');
const Week = require('../models/Week');
const VideoSet = require('../models/VideoSet');

// ==========================================
// WEEK MODULES CONTROLLER
// ==========================================

// @desc    Get all weeks (for both student viewing and admin management)
// @route   GET /api/videos/weeks
// @access  Private
exports.getAllWeeks = async (req, res) => {
  try {
    const weeks = await Week.find().sort({ weekNumber: 1 });
    res.json({ success: true, weeks });
  } catch (error) {
    console.error('Get all weeks error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving weeks' });
  }
};

// Alias for compatibility
exports.getWeeks = exports.getAllWeeks;

// @desc    Get videos of specific week by weekNumber
// @route   GET /api/videos/week/:weekNumber
// @access  Private
exports.getVideosByWeek = async (req, res) => {
  try {
    const { weekNumber } = req.params;
    const week = await Week.findOne({ weekNumber: parseInt(weekNumber) });
    if (!week) {
      return res.status(404).json({ success: false, message: `Week ${weekNumber} module not found` });
    }

    const videos = await Video.find({ week: week._id }).populate('week');
    
    // Access control for PDF resources
    const isUnlocked = req.user.role === 'admin' || week.price === 0 || (req.user.purchasedWeeks && req.user.purchasedWeeks.includes(week._id.toString()));
    
    const weekObj = week.toObject();
    if (weekObj.resources) {
      weekObj.resources = weekObj.resources.map(resource => {
        if (!isUnlocked) {
          const { fileUrl, ...rest } = resource;
          return { ...rest, isLocked: true };
        } else {
          return { ...resource, isLocked: false };
        }
      });
    }

    res.json({ success: true, week: weekObj, videos });
  } catch (error) {
    console.error('Get videos by week error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving videos for week' });
  }
};

// @desc    Create a week module
// @route   POST /api/videos/weeks
// @access  Private/Admin
exports.createWeek = async (req, res) => {
  try {
    const { weekNumber, subject, title, description, price, isLockedByDefault } = req.body;

    const weekExists = await Week.findOne({ weekNumber });
    if (weekExists) {
      return res.status(400).json({ success: false, message: `Week ${weekNumber} already exists` });
    }

    const week = await Week.create({
      weekNumber,
      subject: subject || 'General',
      title,
      description,
      price: price || 0,
      isLockedByDefault: isLockedByDefault !== undefined ? isLockedByDefault : true,
    });

    res.status(201).json({ success: true, week });
  } catch (error) {
    console.error('Create week error:', error);
    res.status(500).json({ success: false, message: 'Server error creating week' });
  }
};

// ==========================================
// VIDEO SETS CONTROLLER
// ==========================================

// @desc    Get all video sets (packages)
// @route   GET /api/videos/sets
// @access  Private
exports.getVideoSets = async (req, res) => {
  try {
    const videoSets = await VideoSet.find().sort({ createdAt: -1 });
    res.json({ success: true, videoSets });
  } catch (error) {
    console.error('Get video sets error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving video sets' });
  }
};

// @desc    Create a video set (package)
// @route   POST /api/videos/sets
// @access  Private/Admin
exports.createVideoSet = async (req, res) => {
  try {
    const { title, description, price, thumbnailUrl } = req.body;

    const videoSet = await VideoSet.create({
      title,
      description,
      price,
      thumbnailUrl: thumbnailUrl || '',
    });

    res.status(201).json({ success: true, videoSet });
  } catch (error) {
    console.error('Create video set error:', error);
    res.status(500).json({ success: false, message: 'Server error creating video set' });
  }
};

// ==========================================
// VIDEOS CONTROLLER
// ==========================================

// @desc    Get all videos
// @route   GET /api/videos
// @access  Private
exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate('week', 'weekNumber title')
      .populate('videoSet', 'title');
    res.json({ success: true, videos });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving videos' });
  }
};

// @desc    Get single video details
// @route   GET /api/videos/:id
// @access  Private (Restricted by content check)
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('week')
      .populate('videoSet');
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    res.json({ success: true, video });
  } catch (error) {
    console.error('Get video by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving video' });
  }
};

// @desc    Create a new video (supports direct URL or files uploaded to Cloudinary/Disk)
// @route   POST /api/videos
// @access  Private/Admin
exports.createVideo = async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, weekId, videoSetId, duration } = req.body;
    
    let finalVideoUrl = videoUrl || '';
    let finalThumbnailUrl = thumbnailUrl || '';

    // Handle files uploaded from Multer
    if (req.files) {
      if (req.files.video && req.files.video[0]) {
        // If uploaded to Cloudinary, it starts with http, if local disk storage, save relative web URL
        finalVideoUrl = (req.files.video[0].path && req.files.video[0].path.startsWith('http'))
          ? req.files.video[0].path
          : `/uploads/${req.files.video[0].filename}`;
      }
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        finalThumbnailUrl = (req.files.thumbnail[0].path && req.files.thumbnail[0].path.startsWith('http'))
          ? req.files.thumbnail[0].path
          : `/uploads/${req.files.thumbnail[0].filename}`;
      }
    }

    if (!finalVideoUrl) {
      return res.status(400).json({ success: false, message: 'Please provide a video URL or upload a file' });
    }

    const newVideo = await Video.create({
      title,
      description,
      videoUrl: finalVideoUrl,
      thumbnailUrl: finalThumbnailUrl,
      duration: duration || 0,
      week: weekId || null,
      videoSet: videoSetId || null,
    });

    res.status(201).json({ success: true, video: newVideo });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ success: false, message: 'Server error creating video record' });
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Private/Admin
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    await video.deleteOne();
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting video' });
  }
};

exports.uploadVideo = exports.createVideo;

// ==========================================
// WEEK RESOURCES CONTROLLER
// ==========================================

// @desc    Add PDF resource to a week module
// @route   POST /api/videos/weeks/:id/resources
// @access  Private/Admin
exports.addWeekResource = async (req, res) => {
  try {
    const { title, fileUrl } = req.body;
    let finalFileUrl = fileUrl || '';

    // Handle file uploaded from Multer
    if (req.file) {
      finalFileUrl = (req.file.path && req.file.path.startsWith('http'))
        ? req.file.path
        : `/uploads/${req.file.filename}`;
    }

    if (!title) {
      return res.status(400).json({ success: false, message: 'Please provide a resource title' });
    }
    if (!finalFileUrl) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF or enter a file URL' });
    }

    const week = await Week.findById(req.params.id);
    if (!week) {
      return res.status(404).json({ success: false, message: 'Week module not found' });
    }

    if (!week.resources) {
      week.resources = [];
    }

    week.resources.push({
      title,
      fileUrl: finalFileUrl,
    });

    await week.save();

    res.status(201).json({ success: true, week });
  } catch (error) {
    console.error('Add week resource error:', error);
    res.status(500).json({ success: false, message: 'Server error adding resource to week module' });
  }
};

// @desc    Delete PDF resource from a week module
// @route   DELETE /api/videos/weeks/:weekId/resources/:resourceId
// @access  Private/Admin
exports.deleteWeekResource = async (req, res) => {
  try {
    const { weekId, resourceId } = req.params;
    const week = await Week.findById(weekId);
    if (!week) {
      return res.status(404).json({ success: false, message: 'Week module not found' });
    }

    if (!week.resources) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    week.resources = week.resources.filter(r => r._id.toString() !== resourceId);
    await week.save();

    res.json({ success: true, week });
  } catch (error) {
    console.error('Delete week resource error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting resource from week module' });
  }
};


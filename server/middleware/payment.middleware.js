const Week = require('../models/Week');
const VideoSet = require('../models/VideoSet');
const Video = require('../models/Video');
const Class = require('../models/Class');

const checkContentAccess = async (req, res, next) => {
  try {
    // Admins bypass all content purchase restrictions
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    const { type, id } = req.params;
    const userId = req.user._id;

    if (type === 'week') {
      const week = await Week.findById(id);
      if (!week) {
        return res.status(404).json({ success: false, message: 'Week module not found' });
      }

      // If the week is free, allow access
      if (week.price === 0) {
        return next();
      }

      // Check if user has purchased the week
      const hasAccess = req.user.purchasedWeeks && req.user.purchasedWeeks.includes(week._id.toString());
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Weekly content has not been purchased',
          requiresPayment: true,
          itemId: week._id,
          itemType: 'week',
          price: week.price
        });
      }
      return next();
    }

    if (type === 'videoSet') {
      const videoSet = await VideoSet.findById(id);
      if (!videoSet) {
        return res.status(404).json({ success: false, message: 'Video set package not found' });
      }

      // Check if user has purchased the video set
      const hasAccess = req.user.purchasedVideoSets && req.user.purchasedVideoSets.includes(videoSet._id.toString());
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Video set has not been purchased',
          requiresPayment: true,
          itemId: videoSet._id,
          itemType: 'videoSet',
          price: videoSet.price
        });
      }
      return next();
    }

    if (type === 'video') {
      const video = await Video.findById(id);
      if (!video) {
        return res.status(404).json({ success: false, message: 'Video not found' });
      }

      // If video is associated with a week, check week access
      if (video.week) {
        const week = await Week.findById(video.week);
        if (week && week.price > 0) {
          const hasAccess = req.user.purchasedWeeks && req.user.purchasedWeeks.includes(week._id.toString());
          if (!hasAccess) {
            return res.status(403).json({
              success: false,
              message: 'Access denied: Weekly content containing this video has not been purchased',
              requiresPayment: true,
              itemId: week._id,
              itemType: 'week',
              price: week.price
            });
          }
        }
      }

      // If video is associated with a videoSet, check videoSet access
      if (video.videoSet) {
        const videoSet = await VideoSet.findById(video.videoSet);
        if (videoSet) {
          const hasAccess = req.user.purchasedVideoSets && req.user.purchasedVideoSets.includes(videoSet._id.toString());
          if (!hasAccess) {
            return res.status(403).json({
              success: false,
              message: 'Access denied: Video set package containing this video has not been purchased',
              requiresPayment: true,
              itemId: videoSet._id,
              itemType: 'videoSet',
              price: videoSet.price
            });
          }
        }
      }

      return next();
    }

    if (type === 'class') {
      const liveClass = await Class.findById(id);
      if (!liveClass) {
        return res.status(404).json({ success: false, message: 'Live class session not found' });
      }

      // Classes are always tied to a week. Check access to that week.
      if (liveClass.week) {
        const week = await Week.findById(liveClass.week);
        if (week && week.price > 0) {
          const hasAccess = req.user.purchasedWeeks && req.user.purchasedWeeks.includes(week._id.toString());
          if (!hasAccess) {
            return res.status(403).json({
              success: false,
              message: 'Access denied: Weekly content containing this live class has not been purchased',
              requiresPayment: true,
              itemId: week._id,
              itemType: 'week',
              price: week.price
            });
          }
        }
      }

      return next();
    }

    next();
  } catch (error) {
    console.error('Content authorization error:', error);
    return res.status(500).json({ success: false, message: 'Access check failed due to server error' });
  }
};

module.exports = { checkContentAccess };

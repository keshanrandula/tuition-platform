const Notice = require('../models/Notice');
const Class = require('../models/Class');
const Week = require('../models/Week');

// @desc    Get notices for the logged-in user (filtered by permission access)
// @route   GET /api/notices
// @access  Private
exports.getNotices = async (req, res) => {
  try {
    // If admin, return all notices
    if (req.user.role === 'admin') {
      const notices = await Notice.find()
        .populate({
          path: 'targetClass',
          populate: {
            path: 'week',
            select: 'weekNumber title price'
          }
        })
        .sort({ createdAt: -1 });
      return res.json({ success: true, notices });
    }

    // If student, query all notices
    const allNotices = await Notice.find()
      .populate({
        path: 'targetClass',
        populate: {
          path: 'week',
          select: 'weekNumber title price'
        }
      })
      .sort({ createdAt: -1 });

    // Filter notices based on student's access permissions to week modules
    const filteredNotices = allNotices.filter(notice => {
      if (notice.targetType === 'all') {
        return true;
      }

      if (notice.targetType === 'class') {
        const liveClass = notice.targetClass;
        if (!liveClass) return false; // Class doesn't exist anymore or was deleted

        const week = liveClass.week;
        if (!week) return true; // If no week associated (safeguard), show it

        // Check if week is free (price is 0) or user has purchased it
        const isFree = week.price === 0;
        const isPurchased = req.user.purchasedWeeks && req.user.purchasedWeeks.includes(week._id.toString());

        return isFree || isPurchased;
      }

      return false;
    });

    res.json({ success: true, notices: filteredNotices });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving notices' });
  }
};

// @desc    Get all notices log for Admin dashboard
// @route   GET /api/notices/admin
// @access  Private/Admin
exports.getAllNoticesAdmin = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate({
        path: 'targetClass',
        populate: {
          path: 'week',
          select: 'weekNumber title'
        }
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, notices });
  } catch (error) {
    console.error('Get admin notices error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving admin notices' });
  }
};

// @desc    Create a new announcement notice
// @route   POST /api/notices
// @access  Private/Admin
exports.createNotice = async (req, res) => {
  try {
    const { title, content, targetType, targetClass } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide a title and content' });
    }

    const noticeData = {
      title,
      content,
      targetType: targetType || 'all'
    };

    if (targetType === 'class') {
      if (!targetClass) {
        return res.status(400).json({ success: false, message: 'Please select a target class' });
      }
      const liveClass = await Class.findById(targetClass);
      if (!liveClass) {
        return res.status(404).json({ success: false, message: 'Target class not found' });
      }
      noticeData.targetClass = targetClass;
    }

    const notice = await Notice.create(noticeData);
    
    // Populate before response for immediate UI render in Admin Table
    const populatedNotice = await Notice.findById(notice._id).populate({
      path: 'targetClass',
      populate: {
        path: 'week',
        select: 'weekNumber title'
      }
    });

    res.status(201).json({ success: true, notice: populatedNotice });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ success: false, message: 'Server error creating notice' });
  }
};

// @desc    Delete an announcement notice
// @route   DELETE /api/notices/:id
// @access  Private/Admin
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice record not found' });
    }
    await notice.deleteOne();
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting notice' });
  }
};

const Class = require('../models/Class');
const Week = require('../models/Week');

// @desc    Get all live classes (upcoming sorted by date for students, all for admin)
// @route   GET /api/classes
// @access  Private
exports.getAllClasses = async (req, res) => {
  try {
    const query = req.user && req.user.role === 'admin' ? {} : { scheduleTime: { $gte: new Date() } };
    const classes = await Class.find(query)
      .populate('week', 'weekNumber title price')
      .sort({ scheduleTime: 1 });
    res.json({ success: true, classes });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving classes' });
  }
};

// Alias for compatibility
exports.getClasses = exports.getAllClasses;

// @desc    Get currently active class (if scheduledDate is today)
// @route   GET /api/classes/live
// @access  Private
exports.getLiveClass = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const liveClass = await Class.findOne({
      scheduleTime: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    }).populate('week');

    res.json({ success: true, class: liveClass });
  } catch (error) {
    console.error('Get live class error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving live class' });
  }
};

// @desc    Get single live class details
// @route   GET /api/classes/:id
// @access  Private (Restricted by content check)
exports.getClassById = async (req, res) => {
  try {
    const liveClass = await Class.findById(req.params.id).populate('week');
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }
    res.json({ success: true, class: liveClass });
  } catch (error) {
    console.error('Get class by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving class' });
  }
};

// @desc    Create a live class
// @route   POST /api/classes
// @access  Private/Admin
exports.createClass = async (req, res) => {
  try {
    const { title, description, scheduleTime, duration, meetingUrl, meetingLink, weekId, subject, teacherNotes } = req.body;

    const week = await Week.findById(weekId);
    if (!week) {
      return res.status(404).json({ success: false, message: 'Associated week module not found' });
    }

    // Auto-generate a clean, secure room name for Jitsi integration
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15);
    const jitsiRoomName = `tuition-room-${cleanTitle}-${Date.now()}`;

    const newClass = await Class.create({
      title,
      description,
      scheduleTime,
      duration,
      meetingUrl: meetingUrl || meetingLink || '',
      meetingLink: meetingLink || meetingUrl || '',
      subject: subject || '',
      teacherNotes: teacherNotes || '',
      jitsiRoomName,
      week: weekId,
    });

    res.status(201).json({ success: true, class: newClass });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ success: false, message: 'Server error creating live class' });
  }
};

// @desc    Update live class details
// @route   PUT /api/classes/:id
// @access  Private/Admin
exports.updateClass = async (req, res) => {
  try {
    const liveClass = await Class.findById(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    liveClass.title = req.body.title !== undefined ? req.body.title : liveClass.title;
    liveClass.description = req.body.description !== undefined ? req.body.description : liveClass.description;
    liveClass.scheduleTime = req.body.scheduleTime !== undefined ? req.body.scheduleTime : liveClass.scheduleTime;
    liveClass.duration = req.body.duration !== undefined ? req.body.duration : liveClass.duration;
    
    if (req.body.meetingUrl !== undefined || req.body.meetingLink !== undefined) {
      const link = req.body.meetingLink !== undefined ? req.body.meetingLink : req.body.meetingUrl;
      liveClass.meetingUrl = link;
      liveClass.meetingLink = link;
    }
    
    liveClass.subject = req.body.subject !== undefined ? req.body.subject : liveClass.subject;
    liveClass.teacherNotes = req.body.teacherNotes !== undefined ? req.body.teacherNotes : liveClass.teacherNotes;
    
    if (req.body.weekId) {
      const week = await Week.findById(req.body.weekId);
      if (!week) {
        return res.status(404).json({ success: false, message: 'Associated week module not found' });
      }
      liveClass.week = req.body.weekId;
    }

    const updatedClass = await liveClass.save();
    res.json({ success: true, class: updatedClass });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ success: false, message: 'Server error updating live class' });
  }
};

// @desc    Delete a live class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
exports.deleteClass = async (req, res) => {
  try {
    const liveClass = await Class.findById(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    await liveClass.deleteOne();
    res.json({ success: true, message: 'Live class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting live class' });
  }
};

const Progress = require('../models/Progress');
const Video = require('../models/Video');
const Quiz = require('../models/Quiz');
const Class = require('../models/Class');
const Week = require('../models/Week');

// @desc    Get progress summary for the logged-in student
// @route   GET /api/progress/summary
// @access  Private
exports.getProgressSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find or create progress document
    let progress = await Progress.findOne({ user: userId });
    if (!progress) {
      progress = await Progress.create({ user: userId, watchedVideos: [], quizScores: [], attendedClasses: [] });
    }

    // Get all videos
    const totalVideos = await Video.find({});
    
    // Get all classes
    const totalClasses = await Class.find({});

    // Get all weeks
    const totalWeeks = await Week.find({});

    // Calculate metrics
    const watchedVideosCount = progress.watchedVideos.filter(v => v.completed).length;
    const totalVideosCount = totalVideos.length;
    const videoCompletionRate = totalVideosCount > 0 ? Math.round((watchedVideosCount / totalVideosCount) * 100) : 0;

    const attendedClassesCount = progress.attendedClasses.length;
    const totalClassesCount = totalClasses.length;
    const classAttendanceRate = totalClassesCount > 0 ? Math.round((attendedClassesCount / totalClassesCount) * 100) : 0;

    const completedQuizzesCount = progress.quizScores.length;
    const totalQuizzesCount = totalWeeks.length; // 1 quiz per week
    const quizCompletionRate = totalQuizzesCount > 0 ? Math.round((completedQuizzesCount / totalQuizzesCount) * 100) : 0;

    // Average quiz score
    let averageQuizScore = 0;
    if (completedQuizzesCount > 0) {
      const totalScorePercent = progress.quizScores.reduce((acc, curr) => {
        const percent = (curr.score / curr.totalQuestions) * 100;
        return acc + percent;
      }, 0);
      averageQuizScore = Math.round(totalScorePercent / completedQuizzesCount);
    }

    // Overall course completion rate (weighted average: 40% videos, 40% quizzes, 20% attendance)
    const overallCompletionRate = Math.min(
      100,
      Math.round((videoCompletionRate * 0.4) + (quizCompletionRate * 0.4) + (classAttendanceRate * 0.2))
    );

    res.json({
      success: true,
      summary: {
        videoCompletionRate,
        watchedVideosCount,
        totalVideosCount,
        classAttendanceRate,
        attendedClassesCount,
        totalClassesCount,
        quizCompletionRate,
        completedQuizzesCount,
        totalQuizzesCount,
        averageQuizScore,
        overallCompletionRate,
        details: {
          watchedVideos: progress.watchedVideos,
          quizScores: progress.quizScores,
          attendedClasses: progress.attendedClasses
        }
      }
    });

  } catch (error) {
    console.error('Get progress summary error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving progress summary' });
  }
};

// @desc    Update video watch progress
// @route   POST /api/progress/video/:videoId
// @access  Private
exports.updateVideoProgress = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { watchTime, completed } = req.body;
    const userId = req.user._id;

    let progress = await Progress.findOne({ user: userId });
    if (!progress) {
      progress = new Progress({ user: userId, watchedVideos: [] });
    }

    const videoIndex = progress.watchedVideos.findIndex(
      (v) => v.video.toString() === videoId
    );

    if (videoIndex > -1) {
      // Update existing video progress
      progress.watchedVideos[videoIndex].watchTime = watchTime;
      // Only set completed to true if it isn't already (or matches request)
      if (completed) {
        progress.watchedVideos[videoIndex].completed = true;
      }
      progress.watchedVideos[videoIndex].updatedAt = Date.now();
    } else {
      // Add new video progress record
      progress.watchedVideos.push({
        video: videoId,
        watchTime,
        completed: completed || false,
        updatedAt: Date.now()
      });
    }

    await progress.save();
    res.json({ success: true, progress });

  } catch (error) {
    console.error('Update video progress error:', error);
    res.status(500).json({ success: false, message: 'Server error saving video progress' });
  }
};

// @desc    Log quiz attempt score
// @route   POST /api/progress/quiz/:weekId
// @access  Private
exports.logQuizAttempt = async (req, res) => {
  try {
    const { weekId } = req.params;
    const { score, totalQuestions } = req.body;
    const userId = req.user._id;

    if (score === undefined || totalQuestions === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide score and totalQuestions' });
    }

    let progress = await Progress.findOne({ user: userId });
    if (!progress) {
      progress = new Progress({ user: userId, quizScores: [] });
    }

    const quizIndex = progress.quizScores.findIndex(
      (q) => q.week.toString() === weekId
    );

    if (quizIndex > -1) {
      // Keep the highest score
      if (score > progress.quizScores[quizIndex].score) {
        progress.quizScores[quizIndex].score = score;
        progress.quizScores[quizIndex].totalQuestions = totalQuestions;
        progress.quizScores[quizIndex].submittedAt = Date.now();
      }
    } else {
      progress.quizScores.push({
        week: weekId,
        score,
        totalQuestions,
        submittedAt: Date.now()
      });
    }

    await progress.save();
    res.json({ success: true, progress });

  } catch (error) {
    console.error('Log quiz attempt error:', error);
    res.status(500).json({ success: false, message: 'Server error saving quiz score' });
  }
};

// @desc    Log live class attendance
// @route   POST /api/progress/class/:classId
// @access  Private
exports.logClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user._id;

    let progress = await Progress.findOne({ user: userId });
    if (!progress) {
      progress = new Progress({ user: userId, attendedClasses: [] });
    }

    const attendanceIndex = progress.attendedClasses.findIndex(
      (c) => c.class.toString() === classId
    );

    if (attendanceIndex === -1) {
      progress.attendedClasses.push({
        class: classId,
        attendedAt: Date.now()
      });
      await progress.save();
    }

    res.json({ success: true, progress });

  } catch (error) {
    console.error('Log class attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error saving attendance log' });
  }
};
